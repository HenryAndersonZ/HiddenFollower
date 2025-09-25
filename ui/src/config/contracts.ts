// HiddenFollower contract
export const CONTRACT_ADDRESS = '0x06eB20e4B27fFCc68fA505DdBe762710cC92FED7';

// ABI copied from compiled artifacts of HiddenFollower
export const CONTRACT_ABI = [
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"followee","type":"address"},{"indexed":true,"internalType":"address","name":"pseudoFollower","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"FollowAdded","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"followee","type":"address"},{"indexed":true,"internalType":"address","name":"pseudoFollower","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"FollowRemoved","type":"event"},
  {"inputs":[{"internalType":"address","name":"followee","type":"address"},{"internalType":"externalEaddress","name":"encryptedRealFollower","type":"bytes32"},{"internalType":"bytes","name":"inputProof","type":"bytes"}],"name":"follow","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getEncryptedFollower","outputs":[{"internalType":"eaddress","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getEncryptedFollowing","outputs":[{"internalType":"eaddress","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getFollowerCount","outputs":[{"internalType":"euint32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getFollowerListLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getFollowerTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getFollowingListLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getFollowingTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"isFollowerActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"isFollowingActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"isFollowingPublic","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"protocolId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},
  {"inputs":[{"internalType":"address","name":"followee","type":"address"}],"name":"unfollow","outputs":[],"stateMutability":"nonpayable","type":"function"}
] as const;
