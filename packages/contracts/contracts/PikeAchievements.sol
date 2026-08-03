// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SoulboundERC1155} from "./SoulboundERC1155.sol";

/// @notice PIKE's gamification-mechanics contract (docs/PIKE_token_layer_PRD.md section 7.1,
/// ADR 0007). Mirrors a user's earned badges, level milestones, and macro-quest completions
/// on-chain as non-transferable ERC-1155 tokens.
///
/// This is a MIRROR, not a migration: Postgres remains the source of truth for XP, badges,
/// streaks, and every gamification read the product performs (ADR 0003, ADR 0005). Nothing
/// here is ever read back into the claim or reward path, so a chain outage cannot affect a
/// user-facing feature.
///
/// XP itself is deliberately not tokenized — it changes on every claim, which is the
/// per-event write pattern ADR 0006 already rejected as unscalable. Only the milestones XP
/// crosses are minted.
///
/// Token ID ranges (PRD section 7.1) — the mapping is explicit and additive. IDs are never
/// reassigned, so inserting a badge into BADGE_DEFINITIONS cannot silently renumber tokens
/// users have already earned:
///   1-999     badges, one id per BADGE_DEFINITIONS key
///   1000-1999 level milestones
///   2000-2999 macro-quest completions
contract PikeAchievements is SoulboundERC1155 {
    /// @notice Emitted only when an achievement is newly issued, never on a redundant re-mint.
    event AchievementMinted(address indexed holder, uint256 indexed id);

    constructor(address initialOwner, string memory uri_) ERC1155(uri_) Ownable(initialOwner) {}

    /// @notice Issues one achievement to a holder. Balance for any achievement id is 0 or 1.
    /// @dev Idempotent per FR-T1: a holder who already has the achievement is a no-op returning
    /// false, rather than a revert. That distinction matters because mints are submitted in
    /// batches by a retrying backend (PRD section 7.3) — one already-issued entry must not
    /// fail the whole batch and block every other user in it.
    /// @return minted True if this call issued the token, false if it was already held.
    function mint(address to, uint256 id) public onlyOwner returns (bool minted) {
        if (balanceOf(to, id) != 0) return false;
        _mint(to, id, 1, "");
        emit AchievementMinted(to, id);
        return true;
    }

    /// @notice Issues many achievements across many holders in one transaction — this is what
    /// keeps per-user cost near-zero as completion volume grows (PRD section 7.3).
    /// @return mintedCount How many entries were newly issued; the remainder were already held.
    function mintBatch(address[] calldata holders, uint256[] calldata ids)
        external
        onlyOwner
        returns (uint256 mintedCount)
    {
        if (holders.length != ids.length) revert ArrayLengthMismatch();
        for (uint256 i = 0; i < holders.length; i++) {
            if (mint(holders[i], ids[i])) mintedCount++;
        }
    }
}
