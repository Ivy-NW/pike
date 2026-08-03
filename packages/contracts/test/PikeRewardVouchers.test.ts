import { expect } from "chai";
import hre from "hardhat";
import { keccak256, parseEventLogs, toHex, type Hex } from "viem";

const REWARD_FREE_SHOT = 1n;
const REWARD_VIP_PASS = 2n;

/** Stands in for the backend's hash of a redemption id — opaque, no PII (FR-T4). */
const ref = (label: string): Hex => keccak256(toHex(label));

describe("PikeRewardVouchers", () => {
  async function deployFixture() {
    const [owner, holderA, holderB] = await hre.viem.getWalletClients();
    const vouchers = await hre.viem.deployContract("PikeRewardVouchers", [
      owner.account.address,
      "https://api.pike.test/vouchers/{id}.json",
    ]);
    const publicClient = await hre.viem.getPublicClient();
    return { vouchers, owner, holderA, holderB, publicClient };
  }

  it("issues a voucher on claim and emits VoucherIssued", async () => {
    const { vouchers, holderA, publicClient } = await deployFixture();
    const redemptionRef = ref("redemption-1");

    const txHash = await vouchers.write.issue([holderA.account.address, REWARD_FREE_SHOT, redemptionRef]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    expect(await vouchers.read.balanceOf([holderA.account.address, REWARD_FREE_SHOT])).to.equal(1n);
    expect(await vouchers.read.issued([redemptionRef])).to.equal(true);

    const logs = parseEventLogs({ abi: vouchers.abi, logs: receipt.logs, eventName: "VoucherIssued" });
    expect(logs).to.have.lengthOf(1);
    const args = logs[0]?.args as { holder: string; rewardId: bigint; redemptionRef: Hex };
    expect(args.holder.toLowerCase()).to.equal(holderA.account.address.toLowerCase());
    expect(args.rewardId).to.equal(REWARD_FREE_SHOT);
    expect(args.redemptionRef).to.equal(redemptionRef);
  });

  // FR-T2: a retried batch must not double-issue. Idempotency keys on the redemption reference,
  // not on balance — see the balance test below for why balance cannot carry that information.
  it("is idempotent per redemption reference", async () => {
    const { vouchers, holderA, publicClient } = await deployFixture();
    const redemptionRef = ref("redemption-1");
    await vouchers.write.issue([holderA.account.address, REWARD_FREE_SHOT, redemptionRef]);

    const { result } = await vouchers.simulate.issue([
      holderA.account.address,
      REWARD_FREE_SHOT,
      redemptionRef,
    ]);
    expect(result).to.equal(false);

    const txHash = await vouchers.write.issue([holderA.account.address, REWARD_FREE_SHOT, redemptionRef]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    expect(await vouchers.read.balanceOf([holderA.account.address, REWARD_FREE_SHOT])).to.equal(1n);
    const logs = parseEventLogs({ abi: vouchers.abi, logs: receipt.logs, eventName: "VoucherIssued" });
    expect(logs).to.have.lengthOf(0);
  });

  // Repeat visits are exactly the engagement PIKE rewards, so the same user completing the same
  // quest twice must end up holding two vouchers. This is why idempotency cannot key on balance.
  it("lets one holder accumulate several vouchers for the same reward via distinct redemptions", async () => {
    const { vouchers, holderA } = await deployFixture();

    await vouchers.write.issue([holderA.account.address, REWARD_FREE_SHOT, ref("visit-1")]);
    await vouchers.write.issue([holderA.account.address, REWARD_FREE_SHOT, ref("visit-2")]);

    expect(await vouchers.read.balanceOf([holderA.account.address, REWARD_FREE_SHOT])).to.equal(2n);
  });

  it("burns a voucher on redemption and emits VoucherRedeemed", async () => {
    const { vouchers, holderA, publicClient } = await deployFixture();
    const redemptionRef = ref("redemption-1");
    await vouchers.write.issue([holderA.account.address, REWARD_VIP_PASS, redemptionRef]);

    const txHash = await vouchers.write.redeem([holderA.account.address, REWARD_VIP_PASS, redemptionRef]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    expect(await vouchers.read.balanceOf([holderA.account.address, REWARD_VIP_PASS])).to.equal(0n);
    expect(await vouchers.read.redeemed([redemptionRef])).to.equal(true);

    const logs = parseEventLogs({ abi: vouchers.abi, logs: receipt.logs, eventName: "VoucherRedeemed" });
    expect(logs).to.have.lengthOf(1);
    expect((logs[0]?.args as { redemptionRef: Hex }).redemptionRef).to.equal(redemptionRef);
  });

  it("treats a repeated redemption as a no-op rather than burning a second voucher", async () => {
    const { vouchers, holderA } = await deployFixture();
    await vouchers.write.issue([holderA.account.address, REWARD_FREE_SHOT, ref("visit-1")]);
    await vouchers.write.issue([holderA.account.address, REWARD_FREE_SHOT, ref("visit-2")]);
    await vouchers.write.redeem([holderA.account.address, REWARD_FREE_SHOT, ref("visit-1")]);

    const { result } = await vouchers.simulate.redeem([
      holderA.account.address,
      REWARD_FREE_SHOT,
      ref("visit-1"),
    ]);
    expect(result).to.equal(false);

    await vouchers.write.redeem([holderA.account.address, REWARD_FREE_SHOT, ref("visit-1")]);
    // The second, unrelated voucher must survive a retry of the first redemption.
    expect(await vouchers.read.balanceOf([holderA.account.address, REWARD_FREE_SHOT])).to.equal(1n);
  });

  // A burn with no matching mint means the backend and the chain disagree about what exists.
  // That should surface loudly, not silently succeed.
  it("reverts a redemption for a reference that was never issued", async () => {
    const { vouchers, holderA } = await deployFixture();
    await expect(
      vouchers.write.redeem([holderA.account.address, REWARD_FREE_SHOT, ref("never-issued")]),
    ).to.be.rejected;
  });

  it("issues and redeems in batches, counting only the entries that changed state", async () => {
    const { vouchers, holderA, holderB } = await deployFixture();
    await vouchers.write.issue([holderA.account.address, REWARD_FREE_SHOT, ref("visit-1")]);

    const holders = [holderA.account.address, holderB.account.address, holderB.account.address];
    const rewardIds = [REWARD_FREE_SHOT, REWARD_FREE_SHOT, REWARD_VIP_PASS];
    const refs = [ref("visit-1"), ref("visit-2"), ref("visit-3")];

    const issueSim = await vouchers.simulate.issueBatch([holders, rewardIds, refs]);
    expect(issueSim.result).to.equal(2n); // visit-1 already issued

    await vouchers.write.issueBatch([holders, rewardIds, refs]);
    expect(await vouchers.read.balanceOf([holderB.account.address, REWARD_FREE_SHOT])).to.equal(1n);
    expect(await vouchers.read.balanceOf([holderB.account.address, REWARD_VIP_PASS])).to.equal(1n);

    const redeemSim = await vouchers.simulate.redeemBatch([holders, rewardIds, refs]);
    expect(redeemSim.result).to.equal(3n);

    await vouchers.write.redeemBatch([holders, rewardIds, refs]);
    expect(await vouchers.read.balanceOf([holderA.account.address, REWARD_FREE_SHOT])).to.equal(0n);
    expect(await vouchers.read.balanceOf([holderB.account.address, REWARD_VIP_PASS])).to.equal(0n);
  });

  it("reverts a batch whose parallel arrays disagree in length", async () => {
    const { vouchers, holderA } = await deployFixture();
    await expect(
      vouchers.write.issueBatch([[holderA.account.address], [REWARD_FREE_SHOT], [ref("a"), ref("b")]]),
    ).to.be.rejected;
    await expect(
      vouchers.write.redeemBatch([[holderA.account.address], [REWARD_FREE_SHOT, REWARD_VIP_PASS], [ref("a")]]),
    ).to.be.rejected;
  });

  // FR-T3. A transferable voucher would create a secondary market in venue reward inventory —
  // the exact outcome the redemption-cap system exists to prevent.
  it("reverts any holder-to-holder transfer", async () => {
    const { vouchers, holderA, holderB } = await deployFixture();
    await vouchers.write.issue([holderA.account.address, REWARD_VIP_PASS, ref("visit-1")]);

    const asHolderA = await hre.viem.getContractAt("PikeRewardVouchers", vouchers.address, {
      client: { wallet: holderA },
    });

    await expect(
      asHolderA.write.safeTransferFrom([
        holderA.account.address,
        holderB.account.address,
        REWARD_VIP_PASS,
        1n,
        "0x",
      ]),
    ).to.be.rejected;

    expect(await vouchers.read.balanceOf([holderA.account.address, REWARD_VIP_PASS])).to.equal(1n);
    expect(await vouchers.read.balanceOf([holderB.account.address, REWARD_VIP_PASS])).to.equal(0n);
  });

  it("reverts when a non-owner tries to issue or redeem", async () => {
    const { vouchers, holderA, holderB } = await deployFixture();
    await vouchers.write.issue([holderB.account.address, REWARD_FREE_SHOT, ref("visit-1")]);

    const asHolderA = await hre.viem.getContractAt("PikeRewardVouchers", vouchers.address, {
      client: { wallet: holderA },
    });

    await expect(
      asHolderA.write.issue([holderA.account.address, REWARD_FREE_SHOT, ref("self-issued")]),
    ).to.be.rejected;
    await expect(
      asHolderA.write.redeem([holderB.account.address, REWARD_FREE_SHOT, ref("visit-1")]),
    ).to.be.rejected;
  });
});
