// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Anchors Merkle roots of batched PIKE completion-event hashes to a public chain
/// (see docs/PIKE_onchain_attestation_PRD.md). Stores nothing beyond an event log — Postgres
/// remains the source of truth for every completion; this only makes each batch's record
/// tamper-evident by putting its root somewhere PIKE itself can't quietly rewrite.
contract AttestationRegistry is Ownable {
    event RootSubmitted(bytes32 indexed root, uint256 itemCount, uint256 timestamp);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Records one batch's Merkle root. Only the backend service wallet (the owner)
    /// ever calls this — visitors and clients never interact with this contract directly.
    function submitRoot(bytes32 root, uint256 itemCount) external onlyOwner {
        emit RootSubmitted(root, itemCount, block.timestamp);
    }
}
