// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Shared base for PIKE's non-transferable token contracts (see
/// docs/PIKE_token_layer_PRD.md, FR-T3 and ADR 0007). Non-transferability is the single
/// property that keeps these tokens reputational rather than a currency — it is what stops
/// venue reward inventory developing a secondary market, and what keeps the layer outside
/// Apple/Google IAP scope (v1 PRD section 13).
///
/// It is enforced by reverting in the one balance-change hook rather than by an owner-settable
/// flag, deliberately: relaxing it later requires a redeploy and a new ADR, not a config change.
abstract contract SoulboundERC1155 is ERC1155, Ownable {
    /// @notice Raised on any holder-to-holder transfer. Only mint and burn are permitted.
    error SoulboundTransferNotAllowed();

    /// @notice Raised when parallel batch arrays disagree in length.
    error ArrayLengthMismatch();

    /// @dev Every balance change in ERC1155 routes through _update, including mint (from == 0)
    /// and burn (to == 0). Rejecting the case where both ends are real holders covers
    /// safeTransferFrom and safeBatchTransferFrom without overriding either individually.
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        virtual
        override
    {
        if (from != address(0) && to != address(0)) revert SoulboundTransferNotAllowed();
        super._update(from, to, ids, values);
    }

    /// @dev Transfers already revert, so an approval could never be acted on. Rejecting it
    /// outright keeps wallets and explorers from displaying a spender permission that is
    /// unusable in practice.
    function setApprovalForAll(address, bool) public pure override {
        revert SoulboundTransferNotAllowed();
    }

    /// @notice Metadata URI, owner-settable so it can follow the API without a redeploy.
    function setURI(string calldata newuri) external onlyOwner {
        _setURI(newuri);
    }
}
