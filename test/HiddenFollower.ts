import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { HiddenFollower, HiddenFollower__factory } from "../types";
import { expect } from "chai";

type Signers = {
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("HiddenFollower")) as HiddenFollower__factory;
  const contract = (await factory.deploy()) as HiddenFollower;
  const address = await contract.getAddress();
  return { contract, address };
}

describe("HiddenFollower (mock)", function () {
  let signers: Signers;
  let hf: HiddenFollower;
  let hfAddr: string;

  before(async function () {
    const all = await ethers.getSigners();
    signers = { alice: all[0], bob: all[1] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }
    ({ contract: hf, address: hfAddr } = await deployFixture());
  });

  it("alice follows bob with encrypted real follower", async function () {
    // Initially, bob has zero entries
    const len0 = await hf.getFollowerListLength(signers.bob.address);
    expect(len0).to.eq(0n);

    // Prepare encrypted input: alice address as eaddress
    const enc = await fhevm
      .createEncryptedInput(hfAddr, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();

    // Call follow(bob, encryptedAlice, proof)
    const tx = await hf.connect(signers.alice).follow(signers.bob.address, enc.handles[0], enc.inputProof);
    await tx.wait();

    // Public mapping flags alice is following bob
    const isFollowing = await hf.isFollowingPublic(signers.bob.address, signers.alice.address);
    expect(isFollowing).to.eq(true);

    // One entry stored
    const len1 = await hf.getFollowerListLength(signers.bob.address);
    expect(len1).to.eq(1n);

    // Retrieve encrypted follower and user-decrypt as alice
    const handle = await hf.getEncryptedFollower(signers.bob.address, 0);
    const clearAddr = await fhevm.userDecryptEaddress(handle, hfAddr, signers.alice);
    expect(clearAddr.toLowerCase()).to.eq(signers.alice.address.toLowerCase());

    // Entry is active
    const active = await hf.isFollowerActive(signers.bob.address, 0);
    expect(active).to.eq(true);
  });

  it("unfollow marks latest active entry inactive", async function () {
    // Encrypt alice address
    const enc = await fhevm
      .createEncryptedInput(hfAddr, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();

    await (await hf.connect(signers.alice).follow(signers.bob.address, enc.handles[0], enc.inputProof)).wait();

    // Unfollow
    await (await hf.connect(signers.alice).unfollow(signers.bob.address)).wait();

    // Mapping cleared
    const isFollowing = await hf.isFollowingPublic(signers.bob.address, signers.alice.address);
    expect(isFollowing).to.eq(false);

    // Entry remains but inactive
    const len = await hf.getFollowerListLength(signers.bob.address);
    expect(len).to.eq(1n);
    const active = await hf.isFollowerActive(signers.bob.address, 0);
    expect(active).to.eq(false);
  });
});

