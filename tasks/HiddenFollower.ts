import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("deploy:hidden-follower")
  .setDescription("Deploy the HiddenFollower contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers, deployments }) {
    console.log("Deploying HiddenFollower contract...");

    const result = await deployments.run(["HiddenFollower"], {
      resetMemory: false,
      deletePreviousDeployments: false,
    });

    console.log("HiddenFollower deployed at:", result["HiddenFollower"].address);
    return result["HiddenFollower"].address;
  });

task("follow:user")
  .addParam("contract", "The contract address")
  .addParam("followee", "Address to follow")
  .addParam("realfollower", "Real follower address (will be encrypted)")
  .setDescription("Follow a user anonymously")
  .setAction(async function (taskArguments: TaskArguments, { ethers, fhevm }) {
    const { contract, followee, realfollower } = taskArguments;

    const [signer] = await ethers.getSigners();
    const hiddenFollowerContract = await ethers.getContractAt("HiddenFollower", contract);

    console.log(`Following ${followee} with encrypted real address ${realfollower}...`);

    // Create encrypted input
    const input = fhevm.createEncryptedInput(contract, signer.address);
    input.addAddress(realfollower);
    const encryptedInput = await input.encrypt();

    const tx = await hiddenFollowerContract.follow(followee, encryptedInput.handles[0], encryptedInput.inputProof);

    await tx.wait();
    console.log(`Successfully followed! Transaction: ${tx.hash}`);
  });

task("get:follower-count")
  .addParam("contract", "The contract address")
  .addParam("user", "User address to check")
  .setDescription("Get encrypted follower count for a user")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const { contract, user } = taskArguments;

    const hiddenFollowerContract = await ethers.getContractAt("HiddenFollower", contract);

    const encryptedCount = await hiddenFollowerContract.getFollowerCount(user);
    console.log(`Encrypted follower count for ${user}: ${encryptedCount}`);

    const listLength = await hiddenFollowerContract.getFollowerListLength(user);
    console.log(`Total follower list length: ${listLength}`);
  });
