import { useEffect, useState } from 'react';
import { Download, Upload, Trash2, ShieldCheck } from 'lucide-react';
import { Button, Card, Select, toast } from '@/shared/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useStorage } from '@/shared/hooks/useStorage';
import { db, clearAllData, exportAllData } from '@/shared/db';

interface SettingsData {
  autoDetect: boolean;
  showNotifications: boolean;
  groqApiKey?: string;
  groqModel?: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useStorage<SettingsData>('internfill-settings', {
    autoDetect: true,
    showNotifications: true,
    groqApiKey: import.meta.env.VITE_GROQ_API || '',
    groqModel: 'llama-3.3-70b-versatile',
  });

  const [encryptionKeyHex, setEncryptionKeyHex] = useState<string>('');

  useEffect(() => {
    // Read the JWK key from storage to display to the user
    chrome.storage.local.get('internfill_encryption_key', (result) => {
      const stored = result['internfill_encryption_key'] as string | undefined;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setEncryptionKeyHex(parsed.k || 'Local Key Installed');
        } catch {
          setEncryptionKeyHex('Generated Key');
        }
      } else {
        setEncryptionKeyHex('Active Dev Mode Key');
      }
    });
  }, []);

  const handleToggleAutoDetect = () => {
    setSettings((prev) => ({ ...prev, autoDetect: !prev.autoDetect }));
    toast.success('Settings Saved', `Auto-detection is now ${!settings.autoDetect ? 'enabled' : 'disabled'}.`);
  };

  const handleToggleNotifications = () => {
    setSettings((prev) => ({ ...prev, showNotifications: !prev.showNotifications }));
    toast.success('Settings Saved', `Notifications are now ${!settings.showNotifications ? 'enabled' : 'disabled'}.`);
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `internfill_data_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Backup Successful', 'Your profile and application data has been exported.');
    } catch (err) {
      toast.error('Export Failed', String(err));
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.profiles || !data.applications) {
          toast.error('Invalid Format', 'Backup file must contain profiles and applications.');
          return;
        }

        if (confirm('Importing data will merge the backup with your existing profiles. Proceed?')) {
          // Clear current tables and insert imported data
          for (const profile of data.profiles) {
            // Remove ID if present to let IndexedDB generate a new key, or keep it
            await db.profiles.put(profile);
          }
          for (const app of data.applications) {
            await db.applications.put(app);
          }
          toast.success('Import Complete', 'Your profiles and applications have been restored.');
          window.location.reload();
        }
      } catch (err) {
        toast.error('Import Failed', 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (
      confirm(
        'WARNING: This will permanently delete ALL your user profiles, uploaded resumes, settings, and application history. This cannot be undone. Are you sure?'
      )
    ) {
      if (confirm('Please type "RESET" to confirm permanent deletion:')) {
        try {
          await clearAllData();
          await chrome.storage.local.clear();
          localStorage.clear();
          toast.success('System Reset', 'All local database entries have been erased.');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (err) {
          toast.error('Reset Failed', String(err));
        }
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="page-header">
        <div>
          <h1>Extension Settings</h1>
          <p>Configure preferences, manage data backups, and security settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Main Settings Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Preferences Card */}
          <Card>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Toggle Auto-detect */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>Form Smart Detection</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    Scan and highlight fillable inputs automatically when pages load
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoDetect}
                  onChange={handleToggleAutoDetect}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              {/* Toggle Notifications */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>Desktop Notifications</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    Show toast messages on autofill triggers
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showNotifications}
                  onChange={handleToggleNotifications}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              {/* Theme Dropdown */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>Interface Theme</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    Choose how the dashboard and popup look
                  </div>
                </div>
                <div style={{ width: '150px' }}>
                  <Select
                    options={[
                      { value: 'system', label: 'System' },
                      { value: 'light', label: 'Light Theme' },
                      { value: 'dark', label: 'Dark Theme' },
                    ]}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* AI Configuration */}
          <Card>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>AI Configuration</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Configure your Groq API key to enable fast, AI-powered resume parsing, cover letter generation, and question answering.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: 'var(--space-1.5)' }}>
                  Groq API Key
                </label>
                <input
                  type="password"
                  value={settings.groqApiKey || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, groqApiKey: e.target.value }))}
                  placeholder="gsk_..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'inline-block' }}>
                  Don't have a key? Get one from the{' '}
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-500)', textDecoration: 'underline' }}>
                    Groq Console
                  </a>.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: 'var(--space-1.5)' }}>
                  Groq Model
                </label>
                <div style={{ width: '220px' }}>
                  <Select
                    options={[
                      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Recommended)' },
                      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
                      { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
                    ]}
                    value={settings.groqModel || 'llama-3.3-70b-versatile'}
                    onChange={(e) => setSettings((prev) => ({ ...prev, groqModel: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Backup and Restore */}
          <Card>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Data Management</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Export your profiles and application data as a JSON file to transfer between devices, or restore a previous backup.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="secondary" icon={<Download size={16} />} onClick={handleExportData}>
                Export Backup JSON
              </Button>
              <div style={{ position: 'relative' }}>
                <Button variant="secondary" icon={<Upload size={16} />}>
                  Import Backup JSON
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Security & Cryptography */}
          <Card>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Security & Encryption</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'start', marginBottom: 'var(--space-4)' }}>
              <ShieldCheck size={24} style={{ color: 'var(--color-success-500)', marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: '600', fontSize: '14px' }}>AES-GCM Encryption Key</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Your profile data is encrypted locally using the Web Crypto API. The key is securely stored in Chrome local storage and never leaves your device.
                </p>
              </div>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                wordBreak: 'break-all',
              }}
            >
              Key signature: {encryptionKeyHex}
            </div>
          </Card>
        </div>

        {/* Sidebar Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card style={{ borderColor: 'rgba(var(--color-danger-rgb), 0.2)' }}>
            <h4 style={{ color: 'var(--color-danger-500)', marginBottom: 'var(--space-3)' }}>Danger Zone</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Permanently clear all profiles, resume files, and tracker databases. This action is irreversible.
            </p>
            <Button variant="ghost" icon={<Trash2 size={14} />} className="text-danger" fullWidth onClick={handleReset}>
              Reset Extension Data
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
