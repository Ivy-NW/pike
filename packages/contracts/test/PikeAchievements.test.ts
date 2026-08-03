import { expect } from "chai";
import hre from "hardhat";
import { parseEventLogs } from "viem";

const BADGE_FIRST_QUEST = 1n; // 1-999 badges, per PRD section 7.1
const BADGE_EXPLORER = 2n;
const LEVEL_5 = 1000n; // 1000-1999 level milestones
const MACRO_QUEST = 2000n; // 2000-2999 macro-quest completions

describe("PikeAchievements", () => {
  async function deployFixture() {
    const [owner, holderA, holderB] = await hre.viem.getWalletClients();
    const achievements = await hre.viem.deployContract("PikeAchievements", [
      owner.account.address,
      "https://api.pike.test/achievements/{id}.json",
    ]);
    const publicClient = await hre.viem.getPublicClient();
    return { achievements, owner, holderA, holderB, publicClient };
  }

  it("mints an achievement to a holder and emits AchievementMinted", async () => {
    const { achievements, holderA, publicClient } = await deployFixture();

    const txHash = await achievements.write.mint([holderA.account.address, BADGE_FIRST_QUEST]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    expect(await achievements.read.balanceOf([holderA.account.address, BADGE_FIRST_QUEST])).to.equal(1n);

    const logs = parseEventLogs({ abi: achievements.abi, logs: receipt.logs, eventName: "AchievementMinted" });
    expect(logs).to.have.lengthOf(1);
    const args = logs[0]?.args as { holder: string; id: bigint };
    expect(args.holder.toLowerCase()).to.equal(holderA.account.address.toLowerCase());
    expect(args.id).to.equal(BADGE_FIRST_QUEST);
  });

  // FR-T1: mints are submitted by a retrying backend, so a redundant mint must be a harmless
  // no-op — not a revert (which would fail the whole batch) and not a second token.
  it("is idempotent — re-minting an already-held achievement issues nothing and emits nothing", async () => {
    const { achievements, holderA, publicClient } = await deployFixture();
    await achievements.write.mint([holderA.account.address, BADGE_FIRST_QUEST]);

    const { result } = await achievements.simulate.mint([holderA.account.address, BADGE_FIRST_QUEST]);
    expect(result).to.equal(false);

    const txHash = await achievements.write.mint([holderA.account.address, BADGE_FIRST_QUEST]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    expect(await achievements.read.balanceOf([holderA.account.address, BADGE_FIRST_QUEST])).to.equal(1n);
    const logs = parseEventLogs({ abi: achievements.abi, logs: receipt.logs, eventName: "AchievementMinted" });
    expect(logs).to.have.lengthOf(0);
  });

  it("mints across many holders and ids in one batch, counting only new issuances", async () => {
    const { achievements, holderA, holderB } = await deployFixture();
    await achievements.write.mint([holderA.account.address, BADGE_FIRST_QUEST]);

    const holders = [holderA.account.address, holderA.account.address, holderB.account.address];
    const ids = [BADGE_FIRST_QUEST, BADGE_EXPLORER, LEVEL_5];

    // holderA already has BADGE_FIRST_QUEST, so only two of the three are new.
    const { result } = await achievements.simulate.mintBatch([holders, ids]);
    expect(result).to.equal(2n);

    await achievements.write.mintBatch([holders, ids]);
    expect(await achievements.read.balanceOf([holderA.account.address, BADGE_EXPLORER])).to.equal(1n);
    expect(await achievements.read.balanceOf([holderB.account.address, LEVEL_5])).to.equal(1n);
    expect(await achievements.read.balanceOf([holderA.account.address, BADGE_FIRST_QUEST])).to.equal(1n);
  });

  it("reverts a batch whose parallel arrays disagree in length", async () => {
    const { achievements, holderA } = await deployFixture();
    await expect(
      achievements.write.mintBatch([[holderA.account.address], [BADGE_FIRST_QUEST, BADGE_EXPLORER]]),
    ).to.be.rejected;
  });

  // FR-T3: the property the whole design rests on. If this test ever goes green after being
  // changed to expect success, the tokens have stopped being reputational.
  it("reverts any holder-to-holder transfer", async () => {
    const { achievements, holderA, holderB } = await deployFixture();
    await achievements.write.mint([holderA.account.address, MACRO_QUEST]);

    const asHolderA = await hre.viem.getContractAt("PikeAchievements", achievements.address, {
      client: { wallet: holderA },
    });

    await expect(
      asHolderA.write.safeTransferFrom([
        holderA.account.address,
        holderB.account.address,
        MACRO_QUEST,
        1n,
        "0x",
      ]),
    ).to.be.rejected;

    await expect(
      asHolderA.write.safeBatchTransferFrom([
        holderA.account.address,
        holderB.account.address,
        [MACRO_QUEST],
        [1n],
        "0x",
      ]),
    ).to.be.rejected;

    expect(await achievements.read.balanceOf([holderA.account.address, MACRO_QUEST])).to.equal(1n);
    expect(await achievements.read.balanceOf([holderB.account.address, MACRO_QUEST])).to.equal(0n);
  });

  it("reverts setApprovalForAll so no unusable spender permission is ever displayed", async () => {
    const { achievements, holderA, holderB } = await deployFixture();
    const asHolderA = await hre.viem.getContractAt("PikeAchievements", achievements.address, {
      client: { wallet: holderA },
    });

    await expect(asHolderA.write.setApprovalForAll([holderB.account.address, true])).to.be.rejected;
  });

  it("reverts when a non-owner tries to mint", async () => {
    const { achievements, holderA, holderB } = await deployFixture();
    const asHolderA = await hre.viem.getContractAt("PikeAchievements", achievements.address, {
      client: { wallet: holderA },
    });

    await expect(asHolderA.write.mint([holderB.account.address, BADGE_FIRST_QUEST])).to.be.rejected;
    await expect(asHolderA.write.mintBatch([[holderB.account.address], [BADGE_FIRST_QUEST]])).to.be.rejected;
  });

  it("lets only the owner change the metadata URI", async () => {
    const { achievements, holderA } = await deployFixture();
    const asHolderA = await hre.viem.getContractAt("PikeAchievements", achievements.address, {
      client: { wallet: holderA },
    });

    await expect(asHolderA.write.setURI(["https://evil.test/{id}.json"])).to.be.rejected;
    await achievements.write.setURI(["https://api.pike.test/v2/achievements/{id}.json"]);
    expect(await achievements.read.uri([BADGE_FIRST_QUEST])).to.equal(
      "https://api.pike.test/v2/achievements/{id}.json",
    );
  });

  // Guards the PRD's "IDs are never reassigned" rule. The ranges are a contract-level promise:
  // a badge inserted into the middle of BADGE_DEFINITIONS must take a new id, never shift an
  // existing one. Phase C should additionally assert this mapping against badges.ts directly.
  it("keeps ids in independent ranges so badges, levels, and macro-quests never collide", async () => {
    const { achievements, holderA } = await deployFixture();

    await achievements.write.mintBatch([
      [holderA.account.address, holderA.account.address, holderA.account.address],
      [BADGE_FIRST_QUEST, LEVEL_5, MACRO_QUEST],
    ]);

    expect(await achievements.read.balanceOf([holderA.account.address, BADGE_FIRST_QUEST])).to.equal(1n);
    expect(await achievements.read.balanceOf([holderA.account.address, LEVEL_5])).to.equal(1n);
    expect(await achievements.read.balanceOf([holderA.account.address, MACRO_QUEST])).to.equal(1n);
    expect(await achievements.read.balanceOf([holderA.account.address, BADGE_EXPLORER])).to.equal(0n);
  });
});
