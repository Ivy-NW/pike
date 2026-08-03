// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SoulboundERC1155} from "./SoulboundERC1155.sol";

/// @notice PIKE's tokenized-incentives contract (docs/PIKE_token_layer_PRD.md section 7.2,
/// ADR 0007). One token id per quest reward; a voucher is issued when a redemption reaches
/// `claimed` and burned when the venue honors it. The burn is the point of this contract:
/// it gives both sides a redemption receipt neither can forge or retract, replacing "PIKE
/// marked a row as used" as the entire record of a reward being honored.
///
/// Vouchers are non-transferable. A voucher is redeemable for exactly the reward it names, at
/// the venue that issued it — there is no currency, no exchange rate, and no market.
///
/// Postgres remains authoritative for eligibility, redemption caps, and expiry (FR-3, FR-11).
/// Expiry deliberately is NOT enforced here: an expired voucher is simply never burned and the
/// wallet stops surfacing it. Putting time logic on-chain would add contract surface for no
/// verification benefit.
contract PikeRewardVouchers is SoulboundERC1155 {
    /// @dev Idempotency is keyed by redemption reference rather than by balance, because a
    /// user can legitimately hold several vouchers for the same reward id — repeat visits are
    /// exactly the engagement PIKE rewards, so balance carries no information about whether a
    /// specific redemption was already processed.
    mapping(bytes32 => bool) public issued;
    mapping(bytes32 => bool) public redeemed;

    event VoucherIssued(address indexed holder, uint256 indexed rewardId, bytes32 indexed redemptionRef);
    event VoucherRedeemed(address indexed holder, uint256 indexed rewardId, bytes32 indexed redemptionRef);

    /// @notice Raised when redeeming a reference that was never issued — a burn without a
    /// matching mint would mean the backend and the chain disagree about what exists, which
    /// should surface loudly rather than silently succeed.
    error VoucherNotIssued();

    constructor(address initialOwner, string memory uri_) ERC1155(uri_) Ownable(initialOwner) {}

    /// @notice Issues one voucher for a claimed redemption.
    /// @param redemptionRef Opaque per-redemption reference (a hash of the redemption id — no
    /// PII, per FR-T4). This is what makes a retried batch safe.
    /// @return newlyIssued False if this reference was already issued, so a retry is a no-op
    /// rather than a double-issue (FR-T2) and cannot fail the surrounding batch.
    function issue(address to, uint256 rewardId, bytes32 redemptionRef)
        public
        onlyOwner
        returns (bool newlyIssued)
    {
        if (issued[redemptionRef]) return false;
        issued[redemptionRef] = true;
        _mint(to, rewardId, 1, "");
        emit VoucherIssued(to, rewardId, redemptionRef);
        return true;
    }

    /// @notice Burns a voucher when the venue honors the reward.
    /// @return newlyRedeemed False if already redeemed, so a retry is a no-op.
    function redeem(address from, uint256 rewardId, bytes32 redemptionRef)
        public
        onlyOwner
        returns (bool newlyRedeemed)
    {
        if (redeemed[redemptionRef]) return false;
        if (!issued[redemptionRef]) revert VoucherNotIssued();
        redeemed[redemptionRef] = true;
        _burn(from, rewardId, 1);
        emit VoucherRedeemed(from, rewardId, redemptionRef);
        return true;
    }

    /// @notice Issues many vouchers in one transaction (PRD section 7.3).
    function issueBatch(
        address[] calldata holders,
        uint256[] calldata rewardIds,
        bytes32[] calldata redemptionRefs
    ) external onlyOwner returns (uint256 issuedCount) {
        if (holders.length != rewardIds.length || holders.length != redemptionRefs.length) {
            revert ArrayLengthMismatch();
        }
        for (uint256 i = 0; i < holders.length; i++) {
            if (issue(holders[i], rewardIds[i], redemptionRefs[i])) issuedCount++;
        }
    }

    /// @notice Burns many vouchers in one transaction.
    function redeemBatch(
        address[] calldata holders,
        uint256[] calldata rewardIds,
        bytes32[] calldata redemptionRefs
    ) external onlyOwner returns (uint256 redeemedCount) {
        if (holders.length != rewardIds.length || holders.length != redemptionRefs.length) {
            revert ArrayLengthMismatch();
        }
        for (uint256 i = 0; i < holders.length; i++) {
            if (redeem(holders[i], rewardIds[i], redemptionRefs[i])) redeemedCount++;
        }
    }
}
