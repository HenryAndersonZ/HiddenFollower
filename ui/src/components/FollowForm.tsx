import React, { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useFhevm } from '../hooks/useFhevm';
import { CONTRACT_ADDRESS } from '../config/fhevm';

interface FollowFormProps {
  onSuccess: () => void;
}

export const FollowForm: React.FC<FollowFormProps> = ({ onSuccess }) => {
  const [followeeAddress, setFolloweeAddress] = useState('');
  const [realFollowerAddress, setRealFollowerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { instance: fhevmInstance } = useFhevm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !walletClient || !fhevmInstance) return;

    setLoading(true);
    setStatus('Encrypting real follower address...');

    try {
      // Create encrypted input for the real follower address
      const input = fhevmInstance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.addAddress(realFollowerAddress);
      const encryptedInput = await input.encrypt();

      setStatus('Preparing transaction...');

      // Contract ABI for the follow function
      const abi = [{
        "inputs": [
          {
            "internalType": "address",
            "name": "followee",
            "type": "address"
          },
          {
            "internalType": "externalEaddress",
            "name": "encryptedRealFollower",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "inputProof",
            "type": "bytes"
          }
        ],
        "name": "follow",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }];

      setStatus('Sending transaction...');

      // Send the transaction
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'follow',
        args: [
          followeeAddress as `0x${string}`,
          encryptedInput.handles[0],
          encryptedInput.inputProof
        ],
      });

      setStatus(`Transaction sent: ${hash}`);
      
      // Reset form
      setFolloweeAddress('');
      setRealFollowerAddress('');
      
      onSuccess();
      
    } catch (error) {
      console.error('Error following:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Follow Someone Anonymously</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="followee">Person to Follow (Address):</label>
          <input
            id="followee"
            type="text"
            className="input"
            value={followeeAddress}
            onChange={(e) => setFolloweeAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="realFollower">Your Real Address (will be encrypted):</label>
          <input
            id="realFollower"
            type="text"
            className="input"
            value={realFollowerAddress}
            onChange={(e) => setRealFollowerAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>

        <button 
          type="submit" 
          className="button"
          disabled={loading || !address || !fhevmInstance}
        >
          {loading ? 'Processing...' : 'Follow'}
        </button>
      </form>

      {status && (
        <div className={`status ${loading ? 'loading' : status.includes('Error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
};