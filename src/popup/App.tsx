import { useEffect, useState } from 'react';
import {
  Zap,
  User,
  FileText,
  Settings,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button, ThemeToggle, ToastContainer, ProgressBar, Select, toast } from '@/shared/components';
import { useProfileStore } from '@/features/profile/store';
import { PROFILE_TYPE_LABELS } from '@/features/profile/types';
import { PersonalInfoForm } from '@/features/profile/components/PersonalInfoForm';
import './popup.css';

type PopupView = 'home' | 'profile' | 'settings';

export function PopupApp() {
  const [view, setView] = useState<PopupView>('home');
  const { loadProfiles } = useProfileStore();

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

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
  const { profiles, activeProfileId, setActiveProfile, getProfileCompletion } = useProfileStore();

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null;
  const completion = activeProfile ? getProfileCompletion(activeProfile.id!) : 0;

  const handleAutofill = () => {
    if (!activeProfile) {
      toast.warning('No Profile Active', 'Please set up a profile first.');
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          type: 'AUTOFILL_PAGE',
          profileId: String(activeProfile.id),
        });
        toast.success('Autofill Triggered!', `Filling form with your ${PROFILE_TYPE_LABELS[activeProfile.type]} profile.`);
      } else {
        toast.error('Error', 'Unable to find active tab.');
      }
    });
  };

  return (
    <div className="popup-body animate-fade-in">
      {/* Profile Selector & Summary */}
      <div className="popup-profile-card-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {profiles.length > 0 ? (
          <>
            <div className="popup-profile-card">
              <div className="popup-profile-avatar">
                <User size={24} />
              </div>
              <div className="popup-profile-info" style={{ flex: 1 }}>
                <h3>{activeProfile?.name || 'Active Profile'}</h3>
                <p>{activeProfile ? PROFILE_TYPE_LABELS[activeProfile.type] : 'No profile selected'}</p>
              </div>
            </div>
            {profiles.length > 1 && (
              <Select
                label="Switch Active Profile"
                options={profiles.map((p) => ({ value: String(p.id), label: p.name }))}
                value={String(activeProfileId || '')}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (id) setActiveProfile(id);
                }}
              />
            )}
          </>
        ) : (
          <div className="popup-profile-card">
            <div className="popup-profile-avatar">
              <User size={24} />
            </div>
            <div className="popup-profile-info">
              <h3>Welcome to InternFill</h3>
              <p>Set up your profile to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Completion */}
      {activeProfile && (
        <ProgressBar
          value={completion}
          label="Profile Completion"
          variant="gradient"
          size="sm"
        />
      )}

      {/* Quick Actions */}
      <div className="popup-actions">
        <Button
          variant="primary"
          fullWidth
          icon={<Zap size={16} />}
          size="lg"
          onClick={handleAutofill}
          disabled={!activeProfile}
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
  const { profiles, activeProfileId, updatePersonalInfo } = useProfileStore();
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null;

  return (
    <div className="popup-body animate-fade-in" style={{ overflowY: 'auto' }}>
      <div className="popup-back-header" style={{ marginBottom: 'var(--space-4)' }}>
        <button className="popup-back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Edit Profile</h2>
      </div>

      {activeProfile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <PersonalInfoForm
            data={activeProfile.personalInfo}
            onSave={async (data) => {
              await updatePersonalInfo(activeProfile.id!, data);
              toast.success('Saved', 'Personal Information updated.');
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
            <Button
              variant="secondary"
              icon={<ExternalLink size={14} />}
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              Open Dashboard for Education/Experience
            </Button>
          </div>
        </div>
      ) : (
        <div className="popup-placeholder">
          <User size={48} />
          <p>No profile found. Please create a profile in the Dashboard first.</p>
          <Button
            variant="primary"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            Go to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}

function PopupSettings({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useStorage<{ autoDetect: boolean; showNotifications: boolean }>('internfill-settings', {
    autoDetect: true,
    showNotifications: true,
  });

  const handleToggleAutoDetect = () => {
    setSettings((prev) => ({ ...prev, autoDetect: !prev.autoDetect }));
  };

  const handleToggleNotifications = () => {
    setSettings((prev) => ({ ...prev, showNotifications: !prev.showNotifications }));
  };

  return (
    <div className="popup-body animate-fade-in">
      <div className="popup-back-header" style={{ marginBottom: 'var(--space-4)' }}>
        <button className="popup-back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Settings</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Toggle Auto-detect */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>Smart Detection</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Scan inputs on page load
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings?.autoDetect ?? true}
            onChange={handleToggleAutoDetect}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>

        {/* Toggle Notifications */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>Notifications</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Show feedback on autofill
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings?.showNotifications ?? true}
            onChange={handleToggleNotifications}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
          <Button
            variant="secondary"
            icon={<ExternalLink size={14} />}
            fullWidth
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            Open Full Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useStorage } from '@/shared/hooks/useStorage';
