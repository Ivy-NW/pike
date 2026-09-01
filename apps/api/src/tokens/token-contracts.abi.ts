/**
 * Generated ABIs for PikeAchievements and PikeRewardVouchers.
 * Export these from the deployed contract artifacts in packages/contracts.
 */

export const pikeAchievementsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "initialOwner", type: "address" },
      { name: "uri_", type: "string" },
    ],
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "minted", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintBatch",
    inputs: [
      { name: "holders", type: "address[]" },
      { name: "ids", type: "uint256[]" },
    ],
    outputs: [{ name: "mintedCount", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AchievementMinted",
    inputs: [
      { name: "holder", type: "address", indexed: true },
      { name: "id", type: "uint256", indexed: true },
    ],
  },
] as const;

export const pikeRewardVouchersAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "initialOwner", type: "address" },
      { name: "uri_", type: "string" },
    ],
  },
  {
    type: "function",
    name: "issue",
    inputs: [
      { name: "to", type: "address" },
      { name: "rewardId", type: "uint256" },
      { name: "redemptionRef", type: "bytes32" },
    ],
    outputs: [{ name: "newlyIssued", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "issueBatch",
    inputs: [
      { name: "holders", type: "address[]" },
      { name: "rewardIds", type: "uint256[]" },
      { name: "redemptionRefs", type: "bytes32[]" },
    ],
    outputs: [{ name: "issuedCount", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeem",
    inputs: [
      { name: "holder", type: "address" },
      { name: "rewardId", type: "uint256" },
      { name: "redemptionRef", type: "bytes32" },
    ],
    outputs: [{ name: "newlyRedeemed", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeemBatch",
    inputs: [
      { name: "holders", type: "address[]" },
      { name: "rewardIds", type: "uint256[]" },
      { name: "redemptionRefs", type: "bytes32[]" },
    ],
    outputs: [{ name: "redeemedCount", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "issued",
    inputs: [{ name: "redemptionRef", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "redeemed",
    inputs: [{ name: "redemptionRef", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "VoucherIssued",
    inputs: [
      { name: "holder", type: "address", indexed: true },
      { name: "rewardId", type: "uint256", indexed: true },
      { name: "redemptionRef", type: "bytes32", indexed: true },
    ],
  },
  {
    type: "event",
    name: "VoucherRedeemed",
    inputs: [
      { name: "holder", type: "address", indexed: true },
      { name: "rewardId", type: "uint256", indexed: true },
      { name: "redemptionRef", type: "bytes32", indexed: true },
    ],
  },
] as const;
