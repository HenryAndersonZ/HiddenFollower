import { useMemo, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import '../styles/FollowersList.css';

function FollowingRow({ index, owner, onDecrypted, decrypted, decrypting, setDecrypting }: {
  index: number;
  owner: `0x${string}`;
  onDecrypted: (idx: number, value: string) => void;
  decrypted: Record<number, string>;
  decrypting: number | null;
  setDecrypting: (n: number | null) => void;
}) {
  const { instance } = useZamaInstance();
  const signer = useEthersSigner();

  const { data: handle } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getEncryptedFollowing',
    args: [owner, BigInt(index)],
  });

  const decrypt = async () => {
    if (!instance || !owner || !signer || !handle) return;
    setDecrypting(index);
    try {
      const handleHex = handle as `0x${string}`;
      const pair = [{ handle: handleHex, contractAddress: CONTRACT_ADDRESS }];
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];
      const keypair = instance.generateKeypair();
      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
      const s = await signer;
      const signature = await s!.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );
      const result = await instance.userDecrypt(
        pair,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        owner,
        startTimeStamp,
        durationDays
      );
      const plain = result[handleHex as string] as string | undefined;
      if (plain) onDecrypted(index, plain.startsWith('0x') ? plain : ('0x' + plain));
    } finally {
      setDecrypting(null);
    }
  };

  return (
    <li className="row">
      <div className="row-left">
        <span className="masked">***</span>
      </div>
      <div className="row-actions">
        {decrypted[index] ? (
          <span className="decrypted">{decrypted[index]}</span>
        ) : (
          <button className="decrypt-button" onClick={decrypt} disabled={decrypting === index}>
            {decrypting === index ? 'Decrypting...' : 'Decrypt'}
          </button>
        )}
      </div>
    </li>
  );
}

export function FollowingList() {
  const { address } = useAccount();
  const [decrypting, setDecrypting] = useState<number | null>(null);
  const [decrypted, setDecrypted] = useState<Record<number, string>>({});

  const { data: len } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getFollowingListLength',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const length = useMemo(() => (typeof len === 'bigint' ? Number(len) : 0), [len]);
  const entries = useMemo(() => Array.from({ length }, (_, i) => i), [length]);

  const onDecrypted = (idx: number, value: string) => setDecrypted(prev => ({ ...prev, [idx]: value }));

  if (!address) {
    return (
      <div className="empty-box">
        <p>Please connect your wallet to view following</p>
      </div>
    );
  }

  return (
    <div className="followers-container">
      <div className="card">
        <h2 className="title">My Following</h2>
        {length === 0 ? (
          <p>No following yet.</p>
        ) : (
          <ul className="list">
            {entries.map((i) => (
              <FollowingRow
                key={i}
                index={i}
                owner={address as `0x${string}`}
                decrypted={decrypted}
                decrypting={decrypting}
                setDecrypting={setDecrypting}
                onDecrypted={onDecrypted}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

