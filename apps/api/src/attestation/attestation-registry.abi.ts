/**
 * Hand-maintained ABI for packages/contracts/contracts/AttestationRegistry.sol.
 * The contract is deliberately a single function + one event, so the Solidity source
 * (compiled/tested via packages/contracts) remains the source of truth — keep this literal
 * in sync manually if that interface ever changes.
 */
export const attestationRegistryAbi = [
  {
    type: "constructor",
    inputs: [{ name: "initialOwner", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitRoot",
    inputs: [
      { name: "root", type: "bytes32" },
      { name: "itemCount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "RootSubmitted",
    inputs: [
      { name: "root", type: "bytes32", indexed: true },
      { name: "itemCount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
] as const;
