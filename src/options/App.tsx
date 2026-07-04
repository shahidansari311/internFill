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
        <PageContent page={activePage} />
      </main>
    </div>
  );
}

function PageContent({ page }: { page: Page }) {
  switch (page) {
    case 'dashboard':
      return <DashboardPlaceholder />;
    case 'profile':
      return <PlaceholderPage title="Profile" description="Profile management coming in Milestone 2" />;
    case 'applications':
      return <PlaceholderPage title="Applications" description="Application tracker coming in Milestone 5" />;
    case 'resumes':
      return <PlaceholderPage title="Resumes" description="Resume management coming in Milestone 4" />;
    case 'settings':
      return <PlaceholderPage title="Settings" description="Settings coming in Milestone 6" />;
    default:
      return null;
  }
}

function DashboardPlaceholder() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Track your internship applications at a glance</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Applications', value: '0', color: 'var(--color-primary-500)' },
          { label: 'Interviews', value: '0', color: 'var(--color-warning-500)' },
          { label: 'Offers', value: '0', color: 'var(--color-success-500)' },
          { label: 'Response Rate', value: '0%', color: 'var(--color-accent-500)' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div
              className="stat-icon"
              style={{ background: `${stat.color}15`, color: stat.color }}
            >
              <Briefcase size={20} />
            </div>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="section-card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="empty-state">
          <LayoutDashboard size={48} />
          <h3>No applications yet</h3>
          <p>Start applying to internships and track your progress here.</p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="section-card">
        <div className="empty-state">
          <Settings size={48} />
          <h3>Coming Soon</h3>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
