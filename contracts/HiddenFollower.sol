// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, eaddress, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract HiddenFollower is SepoliaConfig {
    struct EncryptedFollower {
        eaddress encryptedFollowerAddress;
        uint256 timestamp;
        bool isActive;
    }

    mapping(address => EncryptedFollower[]) private followers;
    mapping(address => euint32) private followerCounts;
    mapping(address => mapping(address => bool)) public isFollowingPublic;

    event FollowAdded(address indexed followee, address indexed pseudoFollower, uint256 timestamp);
    event FollowRemoved(address indexed followee, address indexed pseudoFollower, uint256 timestamp);

    function follow(address followee, externalEaddress encryptedRealFollower, bytes calldata inputProof) external {
        require(followee != address(0), "Invalid followee address");
        require(!isFollowingPublic[msg.sender][followee], "Already following");

        eaddress realFollower = FHE.fromExternal(encryptedRealFollower, inputProof);

        EncryptedFollower memory newFollower = EncryptedFollower({
            encryptedFollowerAddress: realFollower,
            timestamp: block.timestamp,
            isActive: true
        });

        followers[followee].push(newFollower);

        euint32 currentCount = followerCounts[followee];
        followerCounts[followee] = FHE.add(currentCount, FHE.asEuint32(1));

        isFollowingPublic[msg.sender][followee] = true;

        FHE.allowThis(realFollower);
        FHE.allow(realFollower, followee);
        FHE.allowThis(followerCounts[followee]);
        FHE.allow(followerCounts[followee], followee);

        emit FollowAdded(followee, msg.sender, block.timestamp);
    }

    function unfollow(address followee) external {
        require(isFollowingPublic[msg.sender][followee], "Not following");

        EncryptedFollower[] storage userFollowers = followers[followee];

        for (uint256 i = 0; i < userFollowers.length; ++i) {
            if (userFollowers[i].isActive) {
                userFollowers[i].isActive = false;
                break;
            }
        }

        euint32 currentCount = followerCounts[followee];
        followerCounts[followee] = FHE.sub(currentCount, FHE.asEuint32(1));

        isFollowingPublic[msg.sender][followee] = false;

        FHE.allowThis(followerCounts[followee]);
        FHE.allow(followerCounts[followee], followee);

        emit FollowRemoved(followee, msg.sender, block.timestamp);
    }

    function getFollowerCount(address user) external view returns (euint32) {
        return followerCounts[user];
    }

    function getEncryptedFollower(address user, uint256 index) external view returns (eaddress) {
        require(index < followers[user].length, "Index out of bounds");
        require(followers[user][index].isActive, "Follower inactive");
        return followers[user][index].encryptedFollowerAddress;
    }

    function getFollowerListLength(address user) external view returns (uint256) {
        return followers[user].length;
    }

    function isFollowerActive(address user, uint256 index) external view returns (bool) {
        require(index < followers[user].length, "Index out of bounds");
        return followers[user][index].isActive;
    }

    function getFollowerTimestamp(address user, uint256 index) external view returns (uint256) {
        require(index < followers[user].length, "Index out of bounds");
        return followers[user][index].timestamp;
    }
}
