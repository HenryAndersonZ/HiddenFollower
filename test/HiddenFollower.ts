import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { HiddenFollower, HiddenFollower__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("HiddenFollower")) as HiddenFollower__factory;
  const hiddenFollowerContract = (await factory.deploy()) as HiddenFollower;
  const hiddenFollowerContractAddress = await hiddenFollowerContract.getAddress();

  return { hiddenFollowerContract, hiddenFollowerContractAddress };
}

describe("HiddenFollower", function () {
  let signers: Signers;
  let hiddenFollowerContract: HiddenFollower;
  let hiddenFollowerContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ hiddenFollowerContract, hiddenFollowerContractAddress } = await deployFixture());
  });

  it("should allow anonymous following", async function () {
    const followee = signers.bob.address;
    const pseudoFollower = signers.alice.address;
    const realFollower = signers.charlie.address;

    const encryptedRealFollower = await fhevm
      .createEncryptedInput(hiddenFollowerContractAddress, pseudoFollower)
      .addAddress(realFollower)
      .encrypt();

    const isFollowingBefore = await hiddenFollowerContract.isFollowingPublic(pseudoFollower, followee);
    expect(isFollowingBefore).to.be.false;

    const tx = await hiddenFollowerContract
      .connect(signers.alice)
      .follow(followee, encryptedRealFollower.handles[0], encryptedRealFollower.inputProof);

    await tx.wait();

    const isFollowingAfter = await hiddenFollowerContract.isFollowingPublic(pseudoFollower, followee);
    expect(isFollowingAfter).to.be.true;

    const followerCount = await hiddenFollowerContract.getFollowerCount(followee);
    const decryptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      followerCount,
      hiddenFollowerContractAddress,
      signers.bob,
    );
    expect(decryptedCount).to.eq(1);

    const followerListLength = await hiddenFollowerContract.getFollowerListLength(followee);
    expect(followerListLength).to.eq(1);

    const isActive = await hiddenFollowerContract.isFollowerActive(followee, 0);
    expect(isActive).to.be.true;
  });

  it("should allow unfollowing", async function () {
    const followee = signers.bob.address;
    const pseudoFollower = signers.alice.address;
    const realFollower = signers.charlie.address;

    const encryptedRealFollower = await fhevm
      .createEncryptedInput(hiddenFollowerContractAddress, pseudoFollower)
      .addAddress(realFollower)
      .encrypt();

    await hiddenFollowerContract
      .connect(signers.alice)
      .follow(followee, encryptedRealFollower.handles[0], encryptedRealFollower.inputProof);

    const isFollowingBefore = await hiddenFollowerContract.isFollowingPublic(pseudoFollower, followee);
    expect(isFollowingBefore).to.be.true;

    const unfollowTx = await hiddenFollowerContract.connect(signers.alice).unfollow(followee);

    await unfollowTx.wait();

    const isFollowingAfter = await hiddenFollowerContract.isFollowingPublic(pseudoFollower, followee);
    expect(isFollowingAfter).to.be.false;

    const followerCount = await hiddenFollowerContract.getFollowerCount(followee);
    const decryptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      followerCount,
      hiddenFollowerContractAddress,
      signers.bob,
    );
    expect(decryptedCount).to.eq(0);

    const isActive = await hiddenFollowerContract.isFollowerActive(followee, 0);
    expect(isActive).to.be.false;
  });

  it("should prevent double following", async function () {
    const followee = signers.bob.address;
    const pseudoFollower = signers.alice.address;
    const realFollower = signers.charlie.address;

    const encryptedRealFollower = await fhevm
      .createEncryptedInput(hiddenFollowerContractAddress, pseudoFollower)
      .addAddress(realFollower)
      .encrypt();

    await hiddenFollowerContract
      .connect(signers.alice)
      .follow(followee, encryptedRealFollower.handles[0], encryptedRealFollower.inputProof);

    await expect(
      hiddenFollowerContract
        .connect(signers.alice)
        .follow(followee, encryptedRealFollower.handles[0], encryptedRealFollower.inputProof),
    ).to.be.revertedWith("Already following");
  });

  it("should prevent unfollowing when not following", async function () {
    const followee = signers.bob.address;

    await expect(hiddenFollowerContract.connect(signers.alice).unfollow(followee)).to.be.revertedWith("Not following");
  });

  it("should handle multiple followers", async function () {
    const followee = signers.bob.address;

    const encryptedRealFollower1 = await fhevm
      .createEncryptedInput(hiddenFollowerContractAddress, signers.alice.address)
      .addAddress(signers.charlie.address)
      .encrypt();

    const encryptedRealFollower2 = await fhevm
      .createEncryptedInput(hiddenFollowerContractAddress, signers.deployer.address)
      .addAddress(signers.alice.address)
      .encrypt();

    await hiddenFollowerContract
      .connect(signers.alice)
      .follow(followee, encryptedRealFollower1.handles[0], encryptedRealFollower1.inputProof);

    await hiddenFollowerContract
      .connect(signers.deployer)
      .follow(followee, encryptedRealFollower2.handles[0], encryptedRealFollower2.inputProof);

    const followerCount = await hiddenFollowerContract.getFollowerCount(followee);
    const decryptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      followerCount,
      hiddenFollowerContractAddress,
      signers.bob,
    );
    expect(decryptedCount).to.eq(2);

    const followerListLength = await hiddenFollowerContract.getFollowerListLength(followee);
    expect(followerListLength).to.eq(2);
  });

  it("should allow access to encrypted follower data", async function () {
    const followee = signers.bob.address;
    const pseudoFollower = signers.alice.address;
    const realFollower = signers.charlie.address;

    const encryptedRealFollower = await fhevm
      .createEncryptedInput(hiddenFollowerContractAddress, pseudoFollower)
      .addAddress(realFollower)
      .encrypt();

    await hiddenFollowerContract
      .connect(signers.alice)
      .follow(followee, encryptedRealFollower.handles[0], encryptedRealFollower.inputProof);

    const encryptedFollowerData = await hiddenFollowerContract.connect(signers.bob).getEncryptedFollower(followee, 0);

    // For testing purposes, we just verify that encrypted data is returned
    // In a real scenario, this would be decrypted by the authorized user
    expect(encryptedFollowerData).to.not.eq(ethers.ZeroHash);

    // Verify the follower is active
    const isActive = await hiddenFollowerContract.isFollowerActive(followee, 0);
    expect(isActive).to.be.true;
  });
});
