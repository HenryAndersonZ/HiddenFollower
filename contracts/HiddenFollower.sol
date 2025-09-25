// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, eaddress, externalEaddress, euint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title HiddenFollower - Encrypted follower relationships
/// @notice Stores encrypted real follower addresses while exposing only pseudonymous public relations
contract HiddenFollower is SepoliaConfig {
    struct FollowerEntry {
        eaddress realFollower; // encrypted real follower address
        uint256 timestamp;     // follow timestamp
        bool active;           // active or unfollowed
    }

    struct FollowingEntry {
        eaddress followee; // encrypted followee address
        uint256 timestamp;
        bool active;
    }

    // followee => list of encrypted followers
    mapping(address => FollowerEntry[]) private _followers;

    // followee => pseudo follower (msg.sender) => whether currently following
    mapping(address => mapping(address => bool)) public isFollowingPublic;

    // Optional: encrypted follower count per followee
    mapping(address => euint32) private _followerCount;

    // follower (msg.sender) => list of encrypted followees
    mapping(address => FollowingEntry[]) private _following;

    event FollowAdded(address indexed followee, address indexed pseudoFollower, uint256 timestamp);
    event FollowRemoved(address indexed followee, address indexed pseudoFollower, uint256 timestamp);

    /// @notice Follow an address with encrypted real follower
    /// @param followee The address being followed
    /// @param encryptedRealFollower Encrypted real follower address (eaddress handle)
    /// @param inputProof The input proof produced by the relayer SDK
    function follow(address followee, externalEaddress encryptedRealFollower, bytes calldata inputProof) external {
        require(followee != address(0), "Invalid followee");
        require(!isFollowingPublic[followee][msg.sender], "Already following");

        // Import the encrypted address from external input
        eaddress realFollower = FHE.fromExternal(encryptedRealFollower, inputProof);

        // append entry
        _followers[followee].push(FollowerEntry({
            realFollower: realFollower,
            timestamp: block.timestamp,
            active: true
        }));

        // Access control: allow contract, followee, and the follower (msg.sender) to decrypt the follower address
        FHE.allowThis(realFollower);
        FHE.allow(realFollower, followee);
        FHE.allow(realFollower, msg.sender);

        // Public mapping marks the pseudo follower (msg.sender) as following
        isFollowingPublic[followee][msg.sender] = true;

        // Maintain encrypted follower count (active count)
        // Note: We keep a running counter, not recomputing from array.
        //       Uses FHE.asEuint32(1) as a constant increment.
        // Update encrypted follower count and maintain ACL for subsequent operations
        euint32 newCount = FHE.add(_followerCount[followee], FHE.asEuint32(1));
        FHE.allowThis(newCount);
        _followerCount[followee] = newCount;

        // Also record following entry for the follower (msg.sender)
        // Note: we store a trivially-encrypted handle of the followee address.
        eaddress encFollowee = FHE.asEaddress(followee);
        FHE.allowThis(encFollowee);
        FHE.allow(encFollowee, msg.sender);
        _following[msg.sender].push(FollowingEntry({
            followee: encFollowee,
            timestamp: block.timestamp,
            active: true
        }));

        emit FollowAdded(followee, msg.sender, block.timestamp);
    }

    /// @notice Unfollow a previously followed address
    /// @dev Marks the most recent active follow relation from this pseudo follower as inactive
    function unfollow(address followee) external {
        require(isFollowingPublic[followee][msg.sender], "Not following");

        // Walk backwards to find the most recent active entry
        FollowerEntry[] storage list = _followers[followee];
        for (uint256 i = list.length; i > 0; i--) {
            FollowerEntry storage entry = list[i - 1];
            if (entry.active) {
                entry.active = false;

                // decrement encrypted follower count and maintain ACL
                euint32 newCount = FHE.sub(_followerCount[followee], FHE.asEuint32(1));
                FHE.allowThis(newCount);
                _followerCount[followee] = newCount;

                isFollowingPublic[followee][msg.sender] = false;
                emit FollowRemoved(followee, msg.sender, block.timestamp);
                return;
            }
        }

        revert("No active follow found");
    }

    /// @notice Returns the encrypted real follower address handle for an entry
    function getEncryptedFollower(address user, uint256 index) external view returns (eaddress) {
        require(index < _followers[user].length, "Index out of bounds");
        return _followers[user][index].realFollower;
    }

    /// @notice Returns the encrypted number of currently active followers for a user
    function getFollowerCount(address user) external view returns (euint32) {
        return _followerCount[user];
    }

    /// @notice Returns the follower list length (including inactive entries)
    function getFollowerListLength(address user) external view returns (uint256) {
        return _followers[user].length;
    }

    /// @notice Returns the timestamp for a follower entry
    function getFollowerTimestamp(address user, uint256 index) external view returns (uint256) {
        require(index < _followers[user].length, "Index out of bounds");
        return _followers[user][index].timestamp;
    }

    /// @notice Returns whether a follower entry is currently active
    function isFollowerActive(address user, uint256 index) external view returns (bool) {
        require(index < _followers[user].length, "Index out of bounds");
        return _followers[user][index].active;
    }

    /// ================= Following (who I follow) =================
    function getEncryptedFollowing(address user, uint256 index) external view returns (eaddress) {
        require(index < _following[user].length, "Index out of bounds");
        return _following[user][index].followee;
    }

    function getFollowingListLength(address user) external view returns (uint256) {
        return _following[user].length;
    }

    function getFollowingTimestamp(address user, uint256 index) external view returns (uint256) {
        require(index < _following[user].length, "Index out of bounds");
        return _following[user][index].timestamp;
    }

    function isFollowingActive(address user, uint256 index) external view returns (bool) {
        require(index < _following[user].length, "Index out of bounds");
        return _following[user][index].active;
    }
}
