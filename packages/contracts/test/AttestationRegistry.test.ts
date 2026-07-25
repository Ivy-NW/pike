import { expect } from "chai";
import hre from "hardhat";
import { parseEventLogs, type Hex } from "viem";

describe("AttestationRegistry", () => {
  async function deployFixture() {
    const [owner, other] = await hre.viem.getWalletClients();
    const registry = await hre.viem.deployContract("AttestationRegistry", [owner.account.address]);
    const publicClient = await hre.viem.getPublicClient();
    return { registry, owner, other, publicClient };
  }

  it("lets the owner submit a root and emits RootSubmitted with the correct args", async () => {
    const { registry, publicClient } = await deployFixture();
    const root: Hex = `0x${"11".repeat(32)}`;

    const txHash = await registry.write.submitRoot([root, 42n]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    const logs = parseEventLogs({ abi: registry.abi, logs: receipt.logs });
    expect(logs).to.have.lengthOf(1);
    expect(logs[0]?.eventName).to.equal("RootSubmitted");
    const args = logs[0]?.args as { root: Hex; itemCount: bigint };
    expect(args.root).to.equal(root);
    expect(args.itemCount).to.equal(42n);
  });

  it("reverts when a non-owner calls submitRoot", async () => {
    const { registry, other } = await deployFixture();
    const root: Hex = `0x${"22".repeat(32)}`;

    const registryAsOther = await hre.viem.getContractAt("AttestationRegistry", registry.address, {
      client: { wallet: other },
    });

    await expect(registryAsOther.write.submitRoot([root, 1n])).to.be.rejected;
  });
});
