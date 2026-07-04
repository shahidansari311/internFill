import { useState } from 'react';
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Settings,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle, ToastContainer } from '@/shared/components';
import './options.css';

import { ProfileEditor } from '@/features/profile/components/ProfileEditor';
import DashboardPage from './pages/Dashboard';
import ApplicationsPage from './pages/Applications';
import ResumesPage from './pages/Resumes';
import SettingsPage from './pages/Settings';

type Page = 'dashboard' | 'profile' | 'applications' | 'resumes' | 'settings';

const NAV_ITEMS: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'applications', label: 'Applications', icon: Briefcase },
  { id: 'resumes', label: 'Resumes', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function OptionsApp() {
  const [activePage, setActivePage] = useState<Page>('dashboard');

  return (
    <div className="dashboard-container">
      <ToastContainer />

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <Sparkles size={24} className="popup-logo-icon" />
          <h2>InternFill</h2>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle />
          <span className="sidebar-version">v1.0.0</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <PageContent page={activePage} onNavigate={setActivePage} />
      </main>
    </div>
  );
}

function PageContent({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  switch (page) {
    case 'dashboard':
      return <DashboardPage onNavigate={onNavigate} />;
    case 'profile':
      return (
        <div className="animate-fade-in">
          <div className="page-header">
            <div>
              <h1>User Profile Management</h1>
              <p>Store your information once to autofill any internship form</p>
            </div>
          </div>
          <ProfileEditor />
        </div>
      );
    case 'applications':
      return <ApplicationsPage />;
    case 'resumes':
      return <ResumesPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return null;
  }
}
