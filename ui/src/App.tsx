import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { FollowForm } from './components/FollowForm'
import { FollowerList } from './components/FollowerList'
import { useFhevm } from './hooks/useFhevm'

function App() {
  const { loading: fhevmLoading, error: fhevmError } = useFhevm();

  const handleFollowSuccess = () => {
    // Trigger a refresh of the follower list
    window.location.reload();
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Hidden Follower</h1>
        <ConnectButton />
      </div>

      {fhevmLoading && (
        <div className="card">
          <div className="status loading">Initializing FHEVM...</div>
        </div>
      )}

      {fhevmError && (
        <div className="card">
          <div className="status error">FHEVM Error: {fhevmError}</div>
        </div>
      )}

      {!fhevmLoading && !fhevmError && (
        <>
          <div className="card">
            <h2>Anonymous Following Platform</h2>
            <p>
              This platform allows you to follow other users anonymously using Zama's Fully Homomorphic Encryption (FHE).
            </p>
            <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
              <li>Use a pseudonym address to call the contract</li>
              <li>Your real address is encrypted using Zama FHE</li>
              <li>The person you follow cannot see who is following them</li>
              <li>Only encrypted addresses are stored in the follower list</li>
            </ul>
          </div>

          <FollowForm onSuccess={handleFollowSuccess} />
          <FollowerList />
        </>
      )}
    </div>
  )
}

export default App