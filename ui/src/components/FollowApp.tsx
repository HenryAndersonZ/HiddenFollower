import { useState } from 'react';
import { Header } from './Header';
import { FollowForm } from './FollowForm';
import { FollowersList } from './FollowersList';
import { FollowingList } from './FollowingList';
import '../styles/FollowApp.css';

export function FollowApp() {
  const [activeTab, setActiveTab] = useState<'follow' | 'following' | 'followers'>('follow');

  return (
    <div className="hf-app">
      <Header />
      <main className="main-content">
        <div className="intro-section">
          <p className="intro-text">
            Follow other addresses and keep them <span className="intro-highlight">private and secure</span> using FHE encryption.
            Build your network while maintaining complete anonymity.
          </p>
        </div>

        <div className="tab-navigation">
          <nav className="tab-nav">
            <button
              onClick={() => setActiveTab('follow')}
              className={`tab-button ${activeTab === 'follow' ? 'active' : 'inactive'}`}
            >
              🔗 Follow
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`tab-button ${activeTab === 'following' ? 'active' : 'inactive'}`}
            >
              👥 Following
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`tab-button ${activeTab === 'followers' ? 'active' : 'inactive'}`}
            >
              👤 Followers
            </button>
          </nav>
        </div>

        <div className="content-area">
          {activeTab === 'follow' && <FollowForm />}
          {activeTab === 'following' && <FollowingList />}
          {activeTab === 'followers' && <FollowersList />}
        </div>
      </main>
    </div>
  );
}
