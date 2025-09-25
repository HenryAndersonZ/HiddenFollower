import { task } from "hardhat/config";

task("hf:follow", "Follow a user with encrypted real follower")
  .addParam("contract", "HiddenFollower contract address")
  .addParam("followee", "Followee address")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("HiddenFollower", args.contract, signer);

    // In a real flow, the client should build encrypted input using fhevm/relayer SDK.
    // Here, we can't build it in a task without relayer. So we only show the signature.
    console.log("Use frontend/relayer to produce encrypted input and call 'follow' directly.");
    console.log("Function signature:", "follow(address,bytes32,bytes)");
    console.log({ followee: args.followee });
  });

task("hf:unfollow", "Unfollow a user")
  .addParam("contract", "HiddenFollower contract address")
  .addParam("followee", "Followee address")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("HiddenFollower", args.contract, signer);
    const tx = await contract.unfollow(args.followee);
    console.log("unfollow tx:", tx.hash);
    await tx.wait();
    console.log("unfollow confirmed");
  });

task("hf:len", "Get follower list length of a user")
  .addParam("contract", "HiddenFollower contract address")
  .addParam("user", "User address")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractAt("HiddenFollower", args.contract, signer);
    const len = await contract.getFollowerListLength(args.user);
    console.log("length:", len.toString());
  });
