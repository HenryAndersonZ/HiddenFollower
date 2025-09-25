import { useState } from 'react';
import { Header } from './Header';
import { FollowForm } from './FollowForm';
import { FollowersList } from './FollowersList';
import '../styles/FollowApp.css';

export function FollowApp() {
  const [activeTab, setActiveTab] = useState<'follow' | 'followers'>('follow');

  return (
    <div className="hf-app">
      <Header />
      <main className="main-content">
        <div>
          <p>You can follow other address. Keep these addresses in secret by FHE encrypted.</p>
        </div>
        <div>
          <div className="tab-navigation">
            <nav className="tab-nav">
              <button
                onClick={() => setActiveTab('follow')}
                className={`tab-button ${activeTab === 'follow' ? 'active' : 'inactive'}`}
              >
                Follow
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`tab-button ${activeTab === 'followers' ? 'active' : 'inactive'}`}
              >
                My Followers
              </button>
            </nav>
          </div>

          {activeTab === 'follow' && <FollowForm />}
          {activeTab === 'followers' && <FollowersList />}
        </div>
      </main>
    </div>
  );
}

