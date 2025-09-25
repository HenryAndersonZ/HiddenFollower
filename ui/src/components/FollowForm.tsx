import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Contract } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/FollowForm.css';

export function FollowForm() {
  const { address } = useAccount();
  const { instance, isLoading: zamaLoading } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [followee, setFollowee] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [success, setSuccess] = useState<string>('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    if (!address || !instance || !signerPromise) {
      alert('Please connect wallet and wait for initialization');
      return;
    }
    if (!followee) {
      alert('Please input a valid followee address');
      return;
    }
    setIsSubmitting(true);
    try {
      // Encrypt the real follower address (msg.sender) as eaddress
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      input.addAddress(address);
      const encryptedInput = await input.encrypt();

      const signer = await signerPromise;
      if (!signer) throw new Error('Signer not available');
      const hf = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setIsConfirming(true);
      const tx = await hf.follow(
        followee,
        encryptedInput.handles[0],
        encryptedInput.inputProof
      );
      await tx.wait();
      setSuccess('Followed successfully');
      setFollowee('');
    } catch (err) {
      console.error('follow failed:', err);
      alert('Follow failed');
    } finally {
      setIsConfirming(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="follow-form-container">
      <div className="follow-form-card">
        <h2 className="title">Follow an address</h2>
        <form onSubmit={onSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Followee Address</label>
            <input
              type="text"
              value={followee}
              onChange={(e) => setFollowee(e.target.value)}
              placeholder="0x..."
              className="text-input"
              required
            />
          </div>
          <div className="submit-section">
            <button
              type="submit"
              disabled={zamaLoading || isSubmitting || isConfirming}
              className="submit-button"
            >
              {zamaLoading ? 'Initializing...' : isSubmitting ? 'Encrypting...' : isConfirming ? 'Confirming...' : 'Follow'}
            </button>
          </div>
        </form>
        {success && (
          <div className="success-box">{success}</div>
        )}
      </div>
    </div>
  );
}

