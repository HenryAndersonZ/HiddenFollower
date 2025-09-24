import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useFhevm } from '../hooks/useFhevm';
import { CONTRACT_ADDRESS } from '../config/fhevm';

export const FollowerList: React.FC = () => {
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [decryptedFollowers, setDecryptedFollowers] = useState<string[]>([]);

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { instance: fhevmInstance } = useFhevm();

  const contractAbi = [
    {
      "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
      "name": "getFollowerCount",
      "outputs": [{"internalType": "euint32", "name": "", "type": "bytes32"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "user", "type": "address"},
        {"internalType": "uint256", "name": "index", "type": "uint256"}
      ],
      "name": "getEncryptedFollower",
      "outputs": [{"internalType": "eaddress", "name": "", "type": "bytes32"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
      "name": "getFollowerListLength",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "user", "type": "address"},
        {"internalType": "uint256", "name": "index", "type": "uint256"}
      ],
      "name": "isFollowerActive",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const loadFollowerData = async () => {
    if (!address || !publicClient) return;

    setLoading(true);
    try {
      // Get encrypted follower count
      const encryptedCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractAbi,
        functionName: 'getFollowerCount',
        args: [address],
      });

      // Get follower list length
      const listLength = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractAbi,
        functionName: 'getFollowerListLength',
        args: [address],
      }) as bigint;

      // Load all followers
      const followerData = [];
      for (let i = 0; i < Number(listLength); i++) {
        const isActive = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: contractAbi,
          functionName: 'isFollowerActive',
          args: [address, BigInt(i)],
        });

        if (isActive) {
          const encryptedFollower = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: contractAbi,
            functionName: 'getEncryptedFollower',
            args: [address, BigInt(i)],
          });

          followerData.push({
            index: i,
            encryptedFollower,
            isActive
          });
        }
      }

      setFollowers(followerData);
      
      // Decrypt follower count if FHEVM instance is available
      if (fhevmInstance && walletClient) {
        try {
          const keypair = fhevmInstance.generateKeypair();
          const handleContractPairs = [{
            handle: encryptedCount,
            contractAddress: CONTRACT_ADDRESS,
          }];
          
          const startTimeStamp = Math.floor(Date.now() / 1000).toString();
          const durationDays = "10";
          const contractAddresses = [CONTRACT_ADDRESS];

          const eip712 = fhevmInstance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);

          const signature = await walletClient.signTypedData({
            domain: eip712.domain,
            types: {
              UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
            },
            primaryType: 'UserDecryptRequestVerification',
            message: eip712.message,
          });

          const result = await fhevmInstance.userDecrypt(
            handleContractPairs,
            keypair.privateKey,
            keypair.publicKey,
            signature.replace("0x", ""),
            contractAddresses,
            address,
            startTimeStamp,
            durationDays,
          );

          setFollowerCount(result[encryptedCount as string]);
        } catch (decryptError) {
          console.error('Error decrypting follower count:', decryptError);
        }
      }

    } catch (error) {
      console.error('Error loading follower data:', error);
    } finally {
      setLoading(false);
    }
  };

  const decryptFollower = async (encryptedFollower: string, index: number) => {
    if (!fhevmInstance || !walletClient || !address) return;

    try {
      const keypair = fhevmInstance.generateKeypair();
      const handleContractPairs = [{
        handle: encryptedFollower,
        contractAddress: CONTRACT_ADDRESS,
      }];
      
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = fhevmInstance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);

      const signature = await walletClient.signTypedData({
        domain: eip712.domain,
        types: {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        primaryType: 'UserDecryptRequestVerification',
        message: eip712.message,
      });

      const result = await fhevmInstance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays,
      );

      const decryptedAddress = result[encryptedFollower];
      setDecryptedFollowers(prev => {
        const updated = [...prev];
        updated[index] = decryptedAddress;
        return updated;
      });

    } catch (error) {
      console.error('Error decrypting follower:', error);
    }
  };

  useEffect(() => {
    if (address) {
      loadFollowerData();
    }
  }, [address, publicClient, fhevmInstance]);

  if (!address) {
    return <div className="card">Please connect your wallet to view followers.</div>;
  }

  return (
    <div className="card">
      <h3>My Followers</h3>
      <div style={{ marginBottom: '20px' }}>
        <strong>Total Followers: </strong>
        {followerCount !== null ? followerCount : 'Encrypted'}
      </div>

      {loading ? (
        <div className="status loading">Loading follower data...</div>
      ) : (
        <div className="follower-list">
          {followers.length === 0 ? (
            <p>No active followers found.</p>
          ) : (
            followers.map((follower, index) => (
              <div key={follower.index} className="follower-item">
                <div>
                  <strong>Follower #{follower.index + 1}</strong>
                  <div className="encrypted-data">
                    Encrypted: {follower.encryptedFollower}
                  </div>
                  {decryptedFollowers[index] && (
                    <div style={{ marginTop: '5px', color: '#007bff' }}>
                      Decrypted: {decryptedFollowers[index]}
                    </div>
                  )}
                </div>
                <button 
                  className="button"
                  onClick={() => decryptFollower(follower.encryptedFollower, index)}
                  disabled={!!decryptedFollowers[index]}
                >
                  {decryptedFollowers[index] ? 'Decrypted' : 'Decrypt'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <button 
        className="button" 
        onClick={loadFollowerData}
        disabled={loading}
        style={{ marginTop: '20px' }}
      >
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
};