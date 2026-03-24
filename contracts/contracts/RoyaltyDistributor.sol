// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title RoyaltyDistributor
 * @notice Scalable royalty distribution using Merkle Tree batching.
 *         Admin aggregates earnings off-chain, publishes Merkle root on-chain,
 *         and creators claim with proof verification.
 */
contract RoyaltyDistributor is Ownable, ReentrancyGuard {

    // Current Merkle root of all earnings
    bytes32 public merkleRoot;

    // Epoch counter (incremented with each root update)
    uint256 public currentEpoch;

    // user => total amount already claimed
    mapping(address => uint256) public totalClaimed;

    // Deposit tracking
    uint256 public totalDeposited;

    // ─── Events ──────────────────────────────────────────────

    event MerkleRootUpdated(
        bytes32 indexed newRoot,
        uint256 indexed epoch,
        uint256 timestamp
    );

    event RoyaltyClaimed(
        address indexed claimant,
        uint256 amount,
        uint256 indexed epoch,
        uint256 timestamp
    );

    event FundsDeposited(
        address indexed depositor,
        uint256 amount,
        uint256 timestamp
    );

    // ─── Errors ──────────────────────────────────────────────

    error InvalidProof();
    error NothingToClaim();
    error InsufficientContractBalance();
    error ZeroRoot();

    // ─── Constructor ─────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── Admin Functions ─────────────────────────────────────

    /**
     * @notice Update the Merkle root with new aggregated earnings
     * @param root  New Merkle root computed off-chain
     */
    function updateMerkleRoot(bytes32 root) external onlyOwner {
        if (root == bytes32(0)) revert ZeroRoot();

        merkleRoot = root;
        currentEpoch++;

        emit MerkleRootUpdated(root, currentEpoch, block.timestamp);
    }

    /**
     * @notice Deposit funds for royalty distribution
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit > 0");
        totalDeposited += msg.value;
        emit FundsDeposited(msg.sender, msg.value, block.timestamp);
    }

    // ─── Claim Functions ─────────────────────────────────────

    /**
     * @notice Claim accumulated royalties with Merkle proof
     * @param cumulativeAmount  Total earnings for the user (cumulative)
     * @param proof             Merkle proof verifying the claim
     *
     * @dev The leaf is keccak256(abi.encodePacked(msg.sender, cumulativeAmount))
     *      Users can only claim the difference between cumulativeAmount and totalClaimed
     */
    function claim(
        uint256 cumulativeAmount,
        bytes32[] calldata proof
    ) external nonReentrant {
        // Verify Merkle proof
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(msg.sender, cumulativeAmount)))
        );

        if (!MerkleProof.verify(proof, merkleRoot, leaf)) {
            revert InvalidProof();
        }

        // Calculate claimable amount
        uint256 claimable = cumulativeAmount - totalClaimed[msg.sender];
        if (claimable == 0) revert NothingToClaim();
        if (address(this).balance < claimable) revert InsufficientContractBalance();

        // Update state before transfer (CEI pattern)
        totalClaimed[msg.sender] = cumulativeAmount;

        // Transfer funds
        (bool sent, ) = msg.sender.call{value: claimable}("");
        require(sent, "Transfer failed");

        emit RoyaltyClaimed(msg.sender, claimable, currentEpoch, block.timestamp);
    }

    // ─── View Functions ──────────────────────────────────────

    function getClaimable(
        address user,
        uint256 cumulativeAmount,
        bytes32[] calldata proof
    ) external view returns (uint256) {
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(user, cumulativeAmount)))
        );

        if (!MerkleProof.verify(proof, merkleRoot, leaf)) {
            return 0;
        }

        return cumulativeAmount - totalClaimed[user];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Allow contract to receive ETH
    receive() external payable {
        totalDeposited += msg.value;
        emit FundsDeposited(msg.sender, msg.value, block.timestamp);
    }
}
