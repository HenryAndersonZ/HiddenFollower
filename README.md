# HiddenFollower

> A privacy-preserving social relationship platform built on Fully Homomorphic Encryption (FHE) technology, enabling users to follow others while keeping their real identities encrypted on-chain.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Technical Advantages](#technical-advantages)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Smart Contract](#smart-contract)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Frontend Application](#frontend-application)
- [Use Cases](#use-cases)
- [Security Considerations](#security-considerations)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

**HiddenFollower** is a groundbreaking decentralized application that leverages **Fully Homomorphic Encryption (FHE)** powered by [Zama's FHEVM](https://docs.zama.ai/fhevm) to create a privacy-first social relationship platform. Unlike traditional blockchain applications where all data is publicly visible, HiddenFollower encrypts user relationships on-chain, ensuring that only authorized parties can decrypt and view follower/following connections.

The platform allows users to:
- Follow other Ethereum addresses while keeping their real identity encrypted
- Maintain public pseudonymous relationships (transaction sender addresses)
- Selectively decrypt and reveal their true follower identities
- Build social graphs without exposing sensitive relationship data

## Problem Statement

### Privacy Crisis in Web3 Social Platforms

Current blockchain-based social platforms face critical privacy challenges:

1. **Complete Transparency**: All follower/following relationships are publicly visible on-chain, exposing users' social connections, interests, and behaviors to anyone with blockchain access.

2. **Doxxing Risks**: Public social graphs enable malicious actors to:
   - Track user activities across platforms
   - Identify real-world identities through relationship analysis
   - Target users based on their social connections
   - Build comprehensive profiles for exploitation

3. **Limited Privacy Options**: Existing solutions force users to choose between:
   - Full transparency (standard blockchain approach)
   - Off-chain storage (sacrificing decentralization and trust)
   - Multiple wallets (poor UX and operational overhead)

4. **Censorship Vulnerability**: Public relationship data can be used by authoritarian regimes or malicious entities to:
   - Identify and target political dissidents
   - Map out organizational structures
   - Enforce social credit systems

### Why Existing Solutions Fall Short

- **Off-chain databases**: Centralized, vulnerable to data breaches, require trust in third parties
- **Zero-Knowledge Proofs (ZK)**: Computationally expensive, limited to simple verification, doesn't enable on-chain computation
- **Multi-wallet strategies**: Poor user experience, high gas costs, complex key management
- **Private chains**: Sacrifices transparency and composability with the broader ecosystem

## Key Features

### 1. Encrypted Identity Protection

- **Real follower addresses** are encrypted using FHEVM's `eaddress` type
- Encryption happens client-side using the Zama Relayer SDK
- Only authorized users (contract, followee, and follower) can decrypt the data
- Pseudonymous public addresses mask true follower identities

### 2. Selective Decryption

- **User decryption**: Followers and followees can decrypt their private relationship data
- **Access Control Lists (ACL)**: Fine-grained permission management through FHEVM's `FHE.allow()` mechanism
- **Client-side decryption**: Data never leaves the blockchain in plaintext
- **Time-bound permissions**: Decryption permissions can be limited by duration

### 3. Public Pseudonymous Layer

- Transaction sender (`msg.sender`) acts as a public pseudonymous identity
- Public mappings enable basic social graph queries without exposing real identities
- Enables public follower counts and relationship verification without privacy breaches
- Supports social discovery while maintaining anonymity

### 4. Encrypted Metrics

- **Private follower counts**: Maintained as encrypted `euint32` values
- **Timestamp tracking**: Record when relationships were established (public)
- **Active status tracking**: Mark relationships as active/inactive without exposing identities

### 5. Follow/Unfollow Operations

- **Follow**: Encrypt real follower address and store on-chain with cryptographic proof
- **Unfollow**: Mark relationships as inactive while preserving historical data
- **Replay protection**: Prevents duplicate follows from the same pseudonymous address

## Technical Advantages

### 1. Fully Homomorphic Encryption (FHE)

Unlike traditional encryption or Zero-Knowledge Proofs, FHE enables:

- **On-chain computation** on encrypted data without decryption
- **Arithmetic operations** on encrypted follower counts (increment/decrement)
- **Comparison operations** without exposing plaintext values
- **Composability** with other FHEVM-enabled smart contracts

### 2. No Trusted Third Parties

- **Decentralized Key Management System (KMS)**: Managed by Zama's distributed network
- **Threshold cryptography**: No single entity controls decryption keys
- **On-chain verification**: All operations are verifiable on Ethereum
- **Trustless architecture**: Users control their own encryption keys

### 3. Superior to ZK-Based Solutions

| Feature | HiddenFollower (FHE) | ZK-Based Solutions |
|---------|---------------------|-------------------|
| On-chain computation | ✅ Yes | ❌ No (proof verification only) |
| Real-time updates | ✅ Instant | ⚠️ Requires proof regeneration |
| Gas efficiency | ✅ Constant cost | ❌ Grows with complexity |
| Developer complexity | ✅ Simple (Solidity-like) | ❌ Circuit design required |
| Composability | ✅ Full compatibility | ⚠️ Limited |

### 4. Scalability

- **Efficient storage**: Encrypted data is compact (handles, not full ciphertexts)
- **Optimized operations**: FHEVM precompiles for FHE operations
- **Batch operations**: Multiple encryptions in single transaction
- **Layer 2 compatible**: Ready for future L2 integrations

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  FollowForm  │  │ FollowersList│  │ FollowingList│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │  Zama Relayer   │                       │
│                    │   SDK Client    │                       │
│                    └────────┬────────┘                       │
└─────────────────────────────┼──────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   FHEVM Network   │
                    │   (Sepolia)       │
                    └─────────┬─────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
┌─────────▼─────────┐ ┌───────▼────────┐ ┌───────▼────────┐
│ HiddenFollower    │ │  KMS Contract  │ │ Input Verifier │
│    Contract       │ │                │ │   Contract     │
│                   │ │                │ │                │
│ - follow()        │ │ - ACL checks   │ │ - Proof verify │
│ - unfollow()      │ │ - Decryption   │ │ - Input import │
│ - getEncrypted*() │ │                │ │                │
└───────────────────┘ └────────────────┘ └────────────────┘
          │
          │ Encrypted Data Storage
          ▼
┌──────────────────────────────────────────────────────────┐
│                 Blockchain State                          │
│  _followers[followee][index] = FollowerEntry {           │
│    realFollower: eaddress (encrypted)                    │
│    timestamp: uint256                                    │
│    active: bool                                          │
│  }                                                       │
│                                                          │
│  _followerCount[followee] = euint32 (encrypted count)   │
│                                                          │
│  isFollowingPublic[followee][pseudoFollower] = bool     │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

#### Follow Operation

1. **Client-side Encryption**:
   ```typescript
   const input = instance.createEncryptedInput(contractAddress, userAddress);
   input.addAddress(realFollowerAddress);
   const { handles, inputProof } = await input.encrypt();
   ```

2. **Transaction Submission**:
   ```solidity
   contract.follow(followee, handles[0], inputProof);
   ```

3. **On-chain Verification & Storage**:
   - Verify encryption proof via InputVerifier contract
   - Import encrypted address: `FHE.fromExternal(handle, proof)`
   - Store encrypted data in contract state
   - Set ACL permissions: `FHE.allow(encryptedAddress, authorizedUsers)`
   - Increment encrypted follower count

4. **Event Emission**:
   ```solidity
   emit FollowAdded(followee, msg.sender, block.timestamp);
   ```

#### Decryption Operation

1. **Generate User Keypair**:
   ```typescript
   const keypair = instance.generateKeypair();
   ```

2. **Sign EIP-712 Permission Request**:
   ```typescript
   const eip712 = instance.createEIP712(keypair.publicKey, ...);
   const signature = await signer.signTypedData(eip712);
   ```

3. **Request Decryption via Relayer**:
   ```typescript
   const result = await instance.userDecrypt(
     handleContractPairs,
     keypair.privateKey,
     signature,
     ...
   );
   ```

4. **Relayer Interaction**:
   - Relayer verifies signature and ACL permissions
   - KMS re-encrypts data under user's public key
   - Client decrypts with private key

## Technology Stack

### Blockchain Layer

- **Smart Contract Platform**: Ethereum (Sepolia Testnet)
- **FHE Protocol**: [Zama FHEVM](https://github.com/zama-ai/fhevm) v0.8+
- **Contract Language**: Solidity ^0.8.24
- **Development Framework**: Hardhat 2.26.0
- **Contract Libraries**:
  - `@fhevm/solidity`: FHE types and operations
  - `@zama-fhe/oracle-solidity`: Oracle integration

### Frontend Stack

- **Framework**: React 19.1
- **Build Tool**: Vite 7.1
- **Wallet Connection**:
  - RainbowKit 2.2.8 (wallet UI)
  - Wagmi 2.17.0 (wallet hooks)
  - Viem 2.37.6 (contract reads)
- **Contract Interaction**: Ethers.js 6.15 (contract writes)
- **FHE Client**: `@zama-fhe/relayer-sdk` 0.2.0
- **State Management**: TanStack Query (React Query) 5.89

### Development Tools

- **Package Manager**: npm
- **Testing**: Mocha + Chai + Hardhat Network Helpers
- **Linting**: ESLint 8.57 + Solhint 6.0
- **Formatting**: Prettier 3.6
- **Type Generation**: TypeChain 8.3 + Hardhat TypeChain Plugin
- **Coverage**: Solidity Coverage 0.8.16

### Deployment & Infrastructure

- **Deployment**: hardhat-deploy 0.11.45
- **Network**: Ethereum Sepolia Testnet (Chain ID: 11155111)
- **Gateway**: Zama Gateway Chain (Chain ID: 55815)
- **Relayer**: Zama Relayer (https://relayer.testnet.zama.cloud)
- **RPC Provider**: Infura / Public RPC endpoints

## How It Works

### Cryptographic Foundations

HiddenFollower uses **Fully Homomorphic Encryption (FHE)** from the FHEVM protocol, specifically:

- **Encryption Scheme**: TFHE (Fast Fully Homomorphic Encryption over the Torus)
- **Key Management**: Distributed threshold cryptography
- **Proof System**: Zero-Knowledge Proofs for input verification

### Core Workflow

#### 1. Initialization

When a user connects their wallet:
```typescript
// Initialize FHEVM instance
const instance = await createInstance(SepoliaConfig);
```

The instance connects to:
- FHEVM host chain (Sepolia)
- Gateway chain (Zama Gateway)
- KMS contract (threshold decryption)
- Input verifier contract (proof verification)

#### 2. Following Someone

**Step 2.1: Client-side Encryption**
```typescript
// Create encrypted input buffer
const input = instance.createEncryptedInput(
  CONTRACT_ADDRESS,  // Who can use this encrypted data
  userAddress        // Who is creating the encryption
);

// Add the real follower address (msg.sender) as encrypted data
input.addAddress(userAddress);

// Encrypt + generate ZK proof + upload to relayer
const { handles, inputProof } = await input.encrypt();
```

**Step 2.2: Submit Transaction**
```typescript
// Call smart contract with encrypted data
const tx = await contract.follow(
  followeeAddress,           // Public: who are they following
  handles[0],                // Encrypted: their real identity (eaddress handle)
  inputProof                 // ZK proof that encryption is valid
);
```

**Step 2.3: On-chain Verification**
```solidity
function follow(
    address followee,
    externalEaddress encryptedRealFollower,
    bytes calldata inputProof
) external {
    // Import and verify the encrypted address
    eaddress realFollower = FHE.fromExternal(
        encryptedRealFollower,
        inputProof
    );

    // Store encrypted follower data
    _followers[followee].push(FollowerEntry({
        realFollower: realFollower,    // Encrypted identity
        timestamp: block.timestamp,
        active: true
    }));

    // Set ACL permissions (who can decrypt)
    FHE.allowThis(realFollower);           // Contract can use it
    FHE.allow(realFollower, followee);     // Followee can decrypt it
    FHE.allow(realFollower, msg.sender);   // Follower can decrypt it

    // Update public pseudonymous mapping
    isFollowingPublic[followee][msg.sender] = true;

    // Increment encrypted follower count
    _followerCount[followee] = FHE.add(
        _followerCount[followee],
        FHE.asEuint32(1)
    );
}
```

#### 3. Viewing Encrypted Followers

**Step 3.1: Query Encrypted Data**
```typescript
// Get encrypted follower handle
const encryptedFollowerHandle = await contract.getEncryptedFollower(
  userAddress,
  index
);
```

**Step 3.2: Decrypt (if authorized)**
```typescript
// Generate temporary keypair
const keypair = instance.generateKeypair();

// Create EIP-712 signature for permission
const eip712 = instance.createEIP712(
  keypair.publicKey,
  [contractAddress],
  startTimestamp,
  durationDays
);

const signature = await signer.signTypedData(
  eip712.domain,
  { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
  eip712.message
);

// Request decryption via relayer
const result = await instance.userDecrypt(
  [{ handle: encryptedFollowerHandle, contractAddress }],
  keypair.privateKey,
  keypair.publicKey,
  signature,
  [contractAddress],
  userAddress,
  startTimestamp,
  durationDays
);

const realFollowerAddress = result[encryptedFollowerHandle];
```

**Behind the scenes:**
- Relayer validates signature and checks ACL permissions on-chain
- KMS performs threshold decryption
- Result is re-encrypted under user's temporary public key
- User decrypts locally with their private key

#### 4. Unfollowing

```solidity
function unfollow(address followee) external {
    // Find the most recent active follow entry
    FollowerEntry[] storage list = _followers[followee];
    for (uint256 i = list.length; i > 0; i--) {
        if (list[i - 1].active) {
            list[i - 1].active = false;

            // Decrement encrypted count
            _followerCount[followee] = FHE.sub(
                _followerCount[followee],
                FHE.asEuint32(1)
            );

            // Clear public mapping
            isFollowingPublic[followee][msg.sender] = false;
            return;
        }
    }
}
```

### Access Control Model

The system implements a three-tier access control model:

1. **Contract Level**: Contract can perform FHE operations on encrypted data
2. **Owner Level**: The followee can decrypt their follower identities
3. **Creator Level**: The follower can decrypt their own encrypted identity

This is enforced via FHEVM's ACL system:
```solidity
FHE.allowThis(encryptedData);                // Contract operations
FHE.allow(encryptedData, followee);          // Followee decryption
FHE.allow(encryptedData, msg.sender);        // Follower decryption
```

## Smart Contract

### Contract: `HiddenFollower.sol`

Location: `contracts/HiddenFollower.sol`

#### Key Data Structures

```solidity
struct FollowerEntry {
    eaddress realFollower;  // Encrypted real follower address
    uint256 timestamp;      // When the follow occurred
    bool active;            // Is this follow relationship active?
}

struct FollowingEntry {
    eaddress followee;      // Encrypted followee address
    uint256 timestamp;
    bool active;
}
```

#### State Variables

```solidity
// followee => array of encrypted followers
mapping(address => FollowerEntry[]) private _followers;

// followee => pseudo follower (msg.sender) => is following
mapping(address => mapping(address => bool)) public isFollowingPublic;

// followee => encrypted follower count
mapping(address => euint32) private _followerCount;

// follower => array of encrypted followees
mapping(address => FollowingEntry[]) private _following;
```

#### Core Functions

**Follow Function**
```solidity
function follow(
    address followee,
    externalEaddress encryptedRealFollower,
    bytes calldata inputProof
) external;
```

**Unfollow Function**
```solidity
function unfollow(address followee) external;
```

**Query Functions**
```solidity
// Get encrypted follower address handle
function getEncryptedFollower(address user, uint256 index) external view returns (eaddress);

// Get encrypted follower count
function getFollowerCount(address user) external view returns (euint32);

// Get total follower list length (including inactive)
function getFollowerListLength(address user) external view returns (uint256);

// Get follower timestamp
function getFollowerTimestamp(address user, uint256 index) external view returns (uint256);

// Check if follower entry is active
function isFollowerActive(address user, uint256 index) external view returns (bool);

// Following queries (symmetric to followers)
function getEncryptedFollowing(address user, uint256 index) external view returns (eaddress);
function getFollowingListLength(address user) external view returns (uint256);
function getFollowingTimestamp(address user, uint256 index) external view returns (uint256);
function isFollowingActive(address user, uint256 index) external view returns (bool);
```

#### Events

```solidity
event FollowAdded(
    address indexed followee,
    address indexed pseudoFollower,
    uint256 timestamp
);

event FollowRemoved(
    address indexed followee,
    address indexed pseudoFollower,
    uint256 timestamp
);
```

### Contract Deployment

**Deployed on**: Ethereum Sepolia Testnet
**Contract Address**: [Available after deployment in `deployments/sepolia/HiddenFollower.json`]

## Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH**: For testnet transactions (get from [Sepolia faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/HiddenFollower.git
cd HiddenFollower
```

2. **Install dependencies**

```bash
# Install root dependencies (Hardhat, contract tools)
npm install

# Install frontend dependencies
cd ui
npm install
cd ..
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```bash
# Deployment account (for contract deployment)
PRIVATE_KEY=your_private_key_here

# RPC endpoints
INFURA_API_KEY=your_infura_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/${INFURA_API_KEY}

# Optional: for contract verification
ETHERSCAN_API_KEY=your_etherscan_key
```

Or use Hardhat's secure variable storage:

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY  # optional
```

4. **Configure frontend**

Edit `ui/src/config/contracts.ts` to set your contract address after deployment:

```typescript
export const CONTRACT_ADDRESS = "0x...";  // Your deployed contract
export const CONTRACT_ABI = [...];        // Copy from deployments/sepolia/HiddenFollower.json
```

## Development

### Compile Contracts

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate TypeScript type definitions (TypeChain)
- Output artifacts to `artifacts/` and types to `types/`

### Run Local Development Node

```bash
# Terminal 1: Start local FHEVM-enabled node
npx hardhat node

# Terminal 2: Deploy contracts to local network
npx hardhat deploy --network localhost
```

### Code Quality

```bash
# Run all linters
npm run lint

# Lint Solidity contracts only
npm run lint:sol

# Lint TypeScript files only
npm run lint:ts

# Auto-fix formatting issues
npm run prettier:write
```

## Testing

### Unit Tests (Local Network)

Run tests on Hardhat's local network with FHEVM mocking:

```bash
npm run test
```

Example test output:
```
  HiddenFollower (mock)
    ✓ alice follows bob with encrypted real follower (183ms)
    ✓ unfollow marks latest active entry inactive (142ms)

  2 passing (2s)
```

### Test Structure

Tests are located in `test/HiddenFollower.ts`:

```typescript
describe("HiddenFollower", function () {
  it("alice follows bob with encrypted real follower", async function () {
    // Encrypt alice's address
    const enc = await fhevm
      .createEncryptedInput(contractAddress, alice.address)
      .addAddress(alice.address)
      .encrypt();

    // Alice follows Bob
    await contract.connect(alice).follow(
      bob.address,
      enc.handles[0],
      enc.inputProof
    );

    // Verify public mapping
    expect(await contract.isFollowingPublic(bob.address, alice.address))
      .to.eq(true);

    // Decrypt and verify real follower
    const handle = await contract.getEncryptedFollower(bob.address, 0);
    const decrypted = await fhevm.userDecryptEaddress(
      handle,
      contractAddress,
      alice
    );
    expect(decrypted.toLowerCase()).to.eq(alice.address.toLowerCase());
  });
});
```

### Integration Tests (Sepolia Testnet)

```bash
npm run test:sepolia
```

**Note**: Sepolia tests require:
- Valid Sepolia RPC endpoint in `.env`
- Funded test accounts
- Deployed contract on Sepolia

### Test Coverage

```bash
npm run coverage
```

Generates coverage report in `coverage/` directory.

## Deployment

### Local Deployment

1. Start local node:
```bash
npx hardhat node
```

2. Deploy (in another terminal):
```bash
npx hardhat deploy --network localhost
```

### Sepolia Testnet Deployment

1. Ensure you have:
   - Sepolia ETH in your deployment account
   - `.env` configured with `PRIVATE_KEY`
   - Valid Infura/Alchemy RPC endpoint

2. Deploy contract:
```bash
npm run deploy:sepolia
```

3. Verify contract on Etherscan (optional):
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

4. Update frontend configuration:
```bash
# Copy ABI from deployment artifacts
cp deployments/sepolia/HiddenFollower.json ui/src/config/

# Update ui/src/config/contracts.ts with new address
```

### Deployment Output

After successful deployment:
```
Deploying contracts with account: 0x1234...5678
Account balance: 1.5 ETH

HiddenFollower deployed to: 0xABCD...EF01
  - Block number: 4123456
  - Transaction hash: 0x1234...5678
  - Gas used: 2,345,678
```

Contract address will be saved in `deployments/sepolia/HiddenFollower.json`.

## Frontend Application

### Start Development Server

```bash
cd ui
npm run dev
```

Application will be available at `http://localhost:5173`

### Build for Production

```bash
cd ui
npm run build
```

Output will be in `ui/dist/` directory.

### Frontend Features

#### 1. Wallet Connection
- Connect via RainbowKit (MetaMask, WalletConnect, etc.)
- Automatic network switching to Sepolia
- Account display and management

#### 2. Follow Form
- Input followee Ethereum address
- Encrypt your real address on client-side
- Submit follow transaction with encrypted proof
- Real-time transaction status (encrypting → confirming → success)

#### 3. Followers List
- View your encrypted followers
- Click "Decrypt" to reveal real addresses
- Show timestamp and active status
- Paginated display for large follower lists

#### 4. Following List
- View who you're following (encrypted)
- Decrypt your following list
- Unfollow functionality
- Activity status indicators

#### 5. User Experience
- Loading states during encryption/decryption
- Error handling with user-friendly messages
- Responsive design for mobile/desktop
- Real-time updates after transactions

### Key Frontend Components

**FollowApp.tsx**: Main application container
```typescript
export function FollowApp() {
  return (
    <>
      <Header />
      <FollowForm />
      <FollowersList />
      <FollowingList />
    </>
  );
}
```

**FollowForm.tsx**: Follow operation UI
```typescript
const onSubmit = async (e: React.FormEvent) => {
  // 1. Create encrypted input
  const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
  input.addAddress(address);
  const encryptedInput = await input.encrypt();

  // 2. Submit transaction
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.follow(
    followee,
    encryptedInput.handles[0],
    encryptedInput.inputProof
  );
  await tx.wait();
};
```

**FollowersList.tsx**: Decrypt and display followers
```typescript
const decryptFollower = async (index: number) => {
  // 1. Get encrypted handle
  const handle = await contract.getEncryptedFollower(userAddress, index);

  // 2. Create decryption request
  const keypair = instance.generateKeypair();
  const eip712 = instance.createEIP712(...);
  const signature = await signer.signTypedData(eip712);

  // 3. Decrypt via relayer
  const result = await instance.userDecrypt(
    [{ handle, contractAddress: CONTRACT_ADDRESS }],
    keypair.privateKey,
    keypair.publicKey,
    signature,
    ...
  );

  // 4. Display decrypted address
  const realAddress = result[handle];
};
```

### Configuration Files

**wagmi.ts**: Wallet configuration
```typescript
import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { rainbowWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  // ... wallet connectors
});
```

**contracts.ts**: Contract configuration
```typescript
export const CONTRACT_ADDRESS = "0x...";
export const CONTRACT_ABI = [...]; // From deployments/sepolia/HiddenFollower.json
```

## Use Cases

### 1. Privacy-Preserving Social Networks

**Problem**: Traditional social platforms expose all follower relationships, enabling surveillance and social graph analysis.

**Solution**: HiddenFollower enables users to build social connections while keeping their relationship graph encrypted. Only authorized parties can decrypt specific relationships.

**Example**: A whistleblower can follow investigative journalists without exposing their interest to monitoring entities.

### 2. Anonymous Political Activism

**Problem**: Authoritarian regimes track social media connections to identify and target dissidents.

**Solution**: Activists can organize and follow each other using pseudonymous addresses while their real identities remain encrypted on-chain.

**Example**: Pro-democracy activists in restricted regions can coordinate safely without government surveillance.

### 3. Confidential Professional Networks

**Problem**: Competitive intelligence firms analyze LinkedIn-style connections to identify business relationships and hiring patterns.

**Solution**: Professionals can network privately, revealing connections only to trusted parties through selective decryption.

**Example**: A startup CEO can follow potential investors and advisors without signaling strategic direction to competitors.

### 4. Private Content Creator Ecosystems

**Problem**: Content creators' audience composition is publicly visible, enabling competitors to poach followers and analyze strategies.

**Solution**: Creators can build encrypted subscriber lists, selectively revealing patron identities only when necessary.

**Example**: An adult content creator can protect subscriber privacy from doxxing and harassment.

### 5. Decentralized Anonymous Credentials

**Problem**: Credential systems (voting, access control) require identity verification but expose participation patterns.

**Solution**: Organizations can issue follower-style credentials with encrypted identity verification, enabling anonymous participation with cryptographic proof of eligibility.

**Example**: A DAO can grant voting rights to encrypted token holders, preventing vote buying and coercion.

### 6. Research Data Privacy

**Problem**: Academic collaboration networks are publicly visible, revealing research directions and competitive advantages.

**Solution**: Researchers can form encrypted collaboration networks, protecting sensitive pre-publication research relationships.

**Example**: A pharmaceutical researcher can follow specialists in a specific disease area without signaling their company's R&D focus.

### 7. Anti-Doxxing for Public Figures

**Problem**: Influencers and public figures face harassment when their social connections are exposed.

**Solution**: Public figures can maintain encrypted follower lists, reducing doxxing vectors and targeted harassment campaigns.

**Example**: A controversial political figure can privately follow family members and friends without exposing them to harassment.

### 8. Regulatory Compliance with Privacy

**Problem**: Financial services need to prove relationships (KYC/AML) without exposing customer networks publicly.

**Solution**: Institutions can encrypt relationship data on-chain while providing selective decryption to regulators.

**Example**: A crypto exchange can prove user relationship graphs to regulators without exposing data to competitors or hackers.

## Security Considerations

### Cryptographic Security

#### FHE Security Properties

- **IND-CPA Security**: Encryption is indistinguishable under chosen-plaintext attack
- **Threshold Decryption**: KMS uses distributed key shares (no single point of failure)
- **Proof of Correct Encryption**: ZK-SNARKs ensure ciphertexts are well-formed
- **Side-channel Resistance**: TFHE implementation includes countermeasures against timing attacks

#### Known Limitations

1. **Metadata Leakage**: Transaction sender (`msg.sender`) is public, revealing pseudonymous identity
2. **Timing Analysis**: Follow/unfollow timestamps are public, enabling temporal correlation attacks
3. **Statistical Attacks**: Large-scale pattern analysis may reveal relationships through encrypted follower counts
4. **Relayer Trust**: Decryption requests go through Zama's relayer (can see access patterns, not plaintext)

### Smart Contract Security

#### Implemented Protections

- **Reentrancy Protection**: All state changes before external calls (Checks-Effects-Interactions)
- **Access Control**: ACL system ensures only authorized parties can decrypt
- **Input Validation**: Checks for zero addresses, duplicate follows, etc.
- **Integer Overflow**: Using Solidity 0.8+ with built-in overflow checks

#### Audit Status

⚠️ **This contract has not been professionally audited.** Use at your own risk, especially for mainnet deployments.

### Operational Security

#### Recommended Practices

1. **Key Management**:
   - Never reuse private keys across environments
   - Use hardware wallets for mainnet deployments
   - Rotate deployment keys regularly

2. **Environment Isolation**:
   - Keep testnet and mainnet configurations separate
   - Use `.env.example` templates, never commit real `.env` files
   - Audit dependencies regularly (run `npm audit`)

3. **Frontend Security**:
   - Validate all user inputs (address checksums, etc.)
   - Implement CSP (Content Security Policy) headers
   - Use secure RPC endpoints (avoid public, rate-limited nodes)

4. **Privacy Best Practices**:
   - Encourage users to use fresh pseudonymous addresses
   - Implement address rotation mechanisms
   - Document metadata leakage risks to users

### Attack Vectors & Mitigations

| Attack | Impact | Mitigation |
|--------|--------|-----------|
| Sybil Attack (fake followers) | Spam, reputation manipulation | Rate limiting, cost per follow (gas), reputation systems |
| Front-running | Follow someone before them | Not applicable (no financial incentive) |
| Replay Attack | Reuse encrypted inputs | Input verifier checks nonces, one-time proofs |
| Timing Correlation | Link pseudonyms via timestamps | Use batch transactions, add random delays |
| Network Analysis | Infer relationships from patterns | Encourage using multiple pseudonyms, mixnet-style routing |

## Future Roadmap

### Phase 1: Core Enhancements (Q2 2025)

- [ ] **Encrypted Messaging**: Enable private DMs between followers using FHE
- [ ] **Batch Operations**: Follow/unfollow multiple users in a single transaction
- [ ] **Gas Optimization**: Optimize storage layout and FHE operation gas costs
- [ ] **Audit & Formal Verification**: Professional security audit and formal verification of core contracts

### Phase 2: Advanced Privacy (Q3 2025)

- [ ] **Zero-Knowledge Identity Proofs**: Prove relationships without revealing identities
- [ ] **Private Group Formation**: Create encrypted follower groups with threshold access
- [ ] **Onion Routing Integration**: Hide transaction sender metadata via mixnets
- [ ] **Decentralized Relayer**: Remove dependency on Zama's centralized relayer

### Phase 3: Layer 2 Scaling (Q4 2025)

- [ ] **L2 Deployment**: Deploy on Optimism/Arbitrum/zkSync for lower gas costs
- [ ] **Cross-chain Followers**: Follow addresses on other EVM chains
- [ ] **FHEVM Native Chains**: Migrate to dedicated FHEVM-native chains (when available)

### Phase 4: Social Features (Q1 2026)

- [ ] **Encrypted Social Tokens**: Issue follower-gated tokens with privacy
- [ ] **Private Reputation System**: Accumulate reputation without exposing relationships
- [ ] **Anonymous Voting**: Enable follower-only polls with encrypted ballots
- [ ] **Encrypted Content Gates**: Restrict content access to encrypted follower lists

### Phase 5: Ecosystem Integration (Q2 2026)

- [ ] **Lens Protocol Integration**: Privacy layer for Lens Protocol followers
- [ ] **Farcaster Privacy Mode**: Encrypted social graphs for Farcaster
- [ ] **XMTP Encrypted Contacts**: Use HiddenFollower for contact list privacy
- [ ] **DeFi Integrations**: Privacy-preserving airdrops and token distributions

### Phase 6: Governance & Sustainability (Q3 2026)

- [ ] **DAO Formation**: Transition governance to community DAO
- [ ] **Protocol Fee Mechanism**: Sustainable funding for relayer/infrastructure
- [ ] **Bug Bounty Program**: Incentivize security research
- [ ] **Educational Content**: Tutorials, videos, workshops on FHE privacy

### Research Directions

1. **Post-Quantum FHE**: Investigate quantum-resistant FHE schemes
2. **Private Set Intersection**: Enable "mutual followers" queries without decryption
3. **Differential Privacy**: Add noise to encrypted counts for statistical privacy
4. **Homomorphic Signatures**: Enable verifiable operations on encrypted data without decryption

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Code Contributions**:
   - Bug fixes
   - Feature implementations (see Roadmap)
   - Gas optimizations
   - Test coverage improvements

2. **Documentation**:
   - Fix typos and clarity issues
   - Add code examples
   - Create tutorials and guides
   - Translate documentation

3. **Security**:
   - Report vulnerabilities (see Security Policy below)
   - Conduct security reviews
   - Improve test coverage

4. **Community**:
   - Answer questions in Discussions
   - Share use cases and feedback
   - Create demo applications

### Development Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**:
   - Follow existing code style
   - Add tests for new features
   - Update documentation
4. **Test thoroughly**:
   ```bash
   npm run lint
   npm run test
   npm run coverage
   ```
5. **Commit with clear messages**: `git commit -m "Add feature: encrypted group follows"`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Open a Pull Request** with detailed description

### Code Style

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Use ESLint/Prettier configurations in repository
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)

### Security Policy

**⚠️ DO NOT open public issues for security vulnerabilities.**

For security issues, please email: security@hiddenfollower.xyz (or create a private security advisory on GitHub)

We will respond within 48 hours and work with you to resolve the issue responsibly.

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

See the [LICENSE](LICENSE) file for details.

### Key Terms

- ✅ **Permitted**: Commercial use, modification, distribution, private use
- ❌ **Forbidden**: Patent use claims
- ℹ️ **Required**: License and copyright notice, disclaimer of warranties

### Third-Party Licenses

- **Zama FHEVM**: BSD-3-Clause-Clear
- **Hardhat**: MIT License
- **React**: MIT License
- **Ethers.js**: MIT License

---

## Acknowledgments

This project is built on groundbreaking technologies from:

- **[Zama](https://zama.ai/)**: For pioneering FHEVM and making FHE practical on blockchain
- **[Hardhat](https://hardhat.org/)**: For the best Ethereum development experience
- **[RainbowKit](https://www.rainbowkit.com/)**: For beautiful wallet connection UX
- **Ethereum Foundation**: For supporting decentralized, permissionless innovation

## Contact & Community

- **GitHub**: [HiddenFollower Repository](https://github.com/yourusername/HiddenFollower)
- **Twitter**: [@HiddenFollower](https://twitter.com/HiddenFollower) (if applicable)
- **Discord**: [Join our community](https://discord.gg/...) (if applicable)
- **Email**: contact@hiddenfollower.xyz (if applicable)

---

**Built with ❤️ and FHE for a privacy-preserving future.**

*"Your relationships, encrypted. Your privacy, preserved. Your freedom, uncompromised."*