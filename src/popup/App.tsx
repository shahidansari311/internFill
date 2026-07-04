import { useState } from 'react';
import {
  Zap,
  User,
  FileText,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button, ThemeToggle, ToastContainer, ProgressBar, toast } from '@/shared/components';
import './popup.css';

type PopupView = 'home' | 'profile' | 'settings';

export function PopupApp() {
  const [view, setView] = useState<PopupView>('home');

  return (
    <div className="popup-container">
      <ToastContainer />
      <PopupHeader />
      {view === 'home' && <PopupHome onNavigate={setView} />}
      {view === 'profile' && <PopupProfile onBack={() => setView('home')} />}
      {view === 'settings' && <PopupSettings onBack={() => setView('home')} />}
    </div>
  );
}

function PopupHeader() {
  return (
    <header className="popup-header">
      <div className="popup-header-left">
        <Sparkles size={20} className="popup-logo-icon" />
        <h1 className="popup-title">InternFill</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}

function PopupHome({ onNavigate }: { onNavigate: (v: PopupView) => void }) {
  const handleAutofill = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { type: 'AUTOFILL_PAGE', profileId: 'default' });
        toast.success('Autofill triggered!', 'Filling detected fields...');
      }
    });
  };

  return (
    <div className="popup-body animate-fade-in">
      {/* Profile Summary */}
      <div className="popup-profile-card">
        <div className="popup-profile-avatar">
          <User size={24} />
        </div>
        <div className="popup-profile-info">
          <h3>Welcome to InternFill</h3>
          <p>Set up your profile to get started</p>
        </div>
      </div>

      {/* Completion */}
      <ProgressBar
        value={0}
        label="Profile Completion"
        variant="gradient"
        size="sm"
      />

      {/* Quick Actions */}
      <div className="popup-actions">
        <Button
          variant="primary"
          fullWidth
          icon={<Zap size={16} />}
          size="lg"
          onClick={handleAutofill}
        >
          Autofill This Page
        </Button>
      </div>

      {/* Navigation */}
      <nav className="popup-nav">
        <button className="popup-nav-item" onClick={() => onNavigate('profile')}>
          <User size={16} />
          <span>Edit Profile</span>
          <ChevronRight size={14} className="popup-nav-chevron" />
        </button>
        <button
          className="popup-nav-item"
          onClick={() => {
            chrome.runtime.openOptionsPage();
          }}
        >
          <FileText size={16} />
          <span>Dashboard</span>
          <ChevronRight size={14} className="popup-nav-chevron" />
        </button>
        <button className="popup-nav-item" onClick={() => onNavigate('settings')}>
          <Settings size={16} />
          <span>Settings</span>
          <ChevronRight size={14} className="popup-nav-chevron" />
        </button>
      </nav>
    </div>
  );
}

function PopupProfile({ onBack }: { onBack: () => void }) {
  return (
    <div className="popup-body animate-fade-in">
      <div className="popup-back-header">
        <button className="popup-back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Edit Profile</h2>
      </div>
      <div className="popup-placeholder">
        <User size={48} />
        <p>Profile editor coming in Milestone 2</p>
        <Button
          variant="secondary"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Open Full Editor
        </Button>
      </div>
    </div>
  );
}

function PopupSettings({ onBack }: { onBack: () => void }) {
  return (
    <div className="popup-body animate-fade-in">
      <div className="popup-back-header">
        <button className="popup-back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Settings</h2>
      </div>
      <div className="popup-placeholder">
        <Settings size={48} />
        <p>Settings coming in Milestone 6</p>
      </div>
    </div>
  );
}
