// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreatorRights
 * @notice Registers content ownership and manages licensing on-chain.
 *         Acts as a "legal notary" — stores only hashes and references, not data.
 */
contract CreatorRights is Ownable, ReentrancyGuard {

    struct ContentRecord {
        address owner;
        bytes32 fingerprintHash;
        string  termsURI;          // IPFS URI to full license terms
        uint96  royaltyBps;        // basis points (e.g. 1000 = 10%)
        uint256 registeredAt;
        bool    exists;
    }

    struct License {
        bool    active;
        uint256 grantedAt;
        uint256 paidAmount;
    }

    // contentId => ContentRecord
    mapping(bytes32 => ContentRecord) public records;

    // contentId => licensee => License
    mapping(bytes32 => mapping(address => License)) public licenses;

    // Track total licenses per content
    mapping(bytes32 => uint256) public licenseCount;

    // Track all registered content IDs
    bytes32[] public contentIds;

    // ─── Events ──────────────────────────────────────────────

    event RightsRegistered(
        bytes32 indexed contentId,
        address indexed owner,
        bytes32 fingerprintHash,
        string  termsURI,
        uint96  royaltyBps,
        uint256 timestamp
    );

    event LicenseGranted(
        bytes32 indexed contentId,
        address indexed licensee,
        uint256 amount,
        uint256 timestamp
    );

    event RoyaltyPaid(
        bytes32 indexed contentId,
        address indexed owner,
        uint256 amount
    );

    // ─── Errors ──────────────────────────────────────────────

    error ContentAlreadyRegistered(bytes32 contentId);
    error ContentNotFound(bytes32 contentId);
    error AlreadyLicensed(bytes32 contentId, address licensee);
    error InsufficientPayment(uint256 required, uint256 sent);
    error NotContentOwner(bytes32 contentId);
    error InvalidRoyaltyBps();

    // ─── Constructor ─────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── Core Functions ──────────────────────────────────────

    /**
     * @notice Register content ownership rights
     * @param contentId     Unique identifier for the content (keccak256 of CID)
     * @param fingerprintHash  Hash of the AI-generated fingerprint
     * @param termsURI      IPFS URI pointing to license terms document
     * @param royaltyBps    Royalty percentage in basis points (max 5000 = 50%)
     */
    function registerRights(
        bytes32 contentId,
        bytes32 fingerprintHash,
        string  calldata termsURI,
        uint96  royaltyBps
    ) external {
        if (records[contentId].exists) {
            revert ContentAlreadyRegistered(contentId);
        }
        if (royaltyBps > 5000) {
            revert InvalidRoyaltyBps();
        }

        records[contentId] = ContentRecord({
            owner: msg.sender,
            fingerprintHash: fingerprintHash,
            termsURI: termsURI,
            royaltyBps: royaltyBps,
            registeredAt: block.timestamp,
            exists: true
        });

        contentIds.push(contentId);

        emit RightsRegistered(
            contentId,
            msg.sender,
            fingerprintHash,
            termsURI,
            royaltyBps,
            block.timestamp
        );
    }

    /**
     * @notice License content — pays royalty directly to creator
     * @param contentId  The content to license
     */
    function licenseTo(bytes32 contentId) external payable nonReentrant {
        ContentRecord storage record = records[contentId];
        if (!record.exists) {
            revert ContentNotFound(contentId);
        }
        if (licenses[contentId][msg.sender].active) {
            revert AlreadyLicensed(contentId, msg.sender);
        }

        // Record the license
        licenses[contentId][msg.sender] = License({
            active: true,
            grantedAt: block.timestamp,
            paidAmount: msg.value
        });

        licenseCount[contentId]++;

        // Forward payment to content owner (royalty)
        if (msg.value > 0) {
            uint256 royaltyAmount = (msg.value * record.royaltyBps) / 10000;
            uint256 platformFee = msg.value - royaltyAmount;

            (bool sent, ) = record.owner.call{value: royaltyAmount}("");
            require(sent, "Royalty transfer failed");

            if (platformFee > 0) {
                (bool feeSent, ) = owner().call{value: platformFee}("");
                require(feeSent, "Fee transfer failed");
            }

            emit RoyaltyPaid(contentId, record.owner, royaltyAmount);
        }

        emit LicenseGranted(contentId, msg.sender, msg.value, block.timestamp);
    }

    // ─── View Functions ──────────────────────────────────────

    function getRecord(bytes32 contentId) external view returns (ContentRecord memory) {
        return records[contentId];
    }

    function getLicense(bytes32 contentId, address user) external view returns (License memory) {
        return licenses[contentId][user];
    }

    function hasLicense(bytes32 contentId, address user) external view returns (bool) {
        return licenses[contentId][user].active;
    }

    function getContentCount() external view returns (uint256) {
        return contentIds.length;
    }

    function verifyOwnership(bytes32 contentId, address claimedOwner) external view returns (bool) {
        return records[contentId].exists && records[contentId].owner == claimedOwner;
    }
}
