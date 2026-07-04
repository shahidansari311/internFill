import { useEffect } from 'react';
import { Briefcase, Calendar, CheckCircle2, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { Button, Card, Badge } from '@/shared/components';
import { useTrackerStore } from '@/features/tracker/store';
import { useProfileStore } from '@/features/profile/store';
import type { ApplicationStatus } from '@/features/tracker/types';

interface DashboardPageProps {
  onNavigate: (page: 'applications' | 'profile') => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { applications, loadApplications } = useTrackerStore();
  const { profiles, loadProfiles } = useProfileStore();

  useEffect(() => {
    loadApplications();
    loadProfiles();
  }, [loadApplications, loadProfiles]);

  // Statistics calculations
  const totalApps = applications.length;
  const interviewApps = applications.filter((a) => a.status === 'interview').length;
  const offerApps = applications.filter((a) => a.status === 'offer').length;
  const rejectedApps = applications.filter((a) => a.status === 'rejected').length;
  const appliedApps = applications.filter((a) => a.status === 'applied').length;

  const responseRate = totalApps > 0 ? Math.round(((interviewApps + offerApps) / totalApps) * 100) : 0;

  // Recent 5 applications
  const recentApps = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'applied':
        return 'var(--color-primary-500)';
      case 'interview':
        return 'var(--color-warning-500)';
      case 'offer':
        return 'var(--color-success-500)';
      case 'rejected':
        return 'var(--color-danger-500)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Track your internship applications and response metrics in real-time</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {[
          { label: 'Total Applications', value: String(totalApps), color: 'var(--color-primary-500)', icon: <Briefcase size={20} /> },
          { label: 'Interviews Scheduled', value: String(interviewApps), color: 'var(--color-warning-500)', icon: <Calendar size={20} /> },
          { label: 'Offers Received', value: String(offerApps), color: 'var(--color-success-500)', icon: <CheckCircle2 size={20} /> },
          { label: 'Response Rate', value: `${responseRate}%`, color: 'var(--color-accent-500)', icon: <TrendingUp size={20} /> },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div
              className="stat-icon"
              style={{ background: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Dashboard Body grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Recent Applications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3>Recent Applications</h3>
              {totalApps > 5 && (
                <Button variant="secondary" size="sm" onClick={() => onNavigate('applications')}>
                  View All
                </Button>
              )}
            </div>

            {recentApps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {recentApps.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255, 255, 255, 0.01)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>{app.company}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {app.role} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge
                      variant={
                        app.status === 'applied'
                          ? 'primary'
                          : app.status === 'interview'
                            ? 'warning'
                            : app.status === 'offer'
                              ? 'success'
                              : 'danger'
                      }
                      size="sm"
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                <Briefcase size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p>No applications tracked yet.</p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => onNavigate('applications')}
                  style={{ marginTop: 'var(--space-3)' }}
                >
                  Add First Application
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Breakdown Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Status Breakdown CSS Chart */}
          <Card>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Status Breakdown</h3>
            {totalApps > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Horizontal CSS segment bar */}
                <div
                  style={{
                    display: 'flex',
                    height: '16px',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {[
                    { count: appliedApps, color: 'var(--color-primary-500)' },
                    { count: interviewApps, color: 'var(--color-warning-500)' },
                    { count: offerApps, color: 'var(--color-success-500)' },
                    { count: rejectedApps, color: 'var(--color-danger-500)' },
                  ].map((seg, idx) => {
                    const widthPct = (seg.count / totalApps) * 100;
                    if (widthPct === 0) return null;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: seg.color,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Status legend list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {[
                    { label: 'Applied', count: appliedApps, status: 'applied' as ApplicationStatus },
                    { label: 'Interview', count: interviewApps, status: 'interview' as ApplicationStatus },
                    { label: 'Offer', count: offerApps, status: 'offer' as ApplicationStatus },
                    { label: 'Rejected', count: rejectedApps, status: 'rejected' as ApplicationStatus },
                  ].map((legend) => {
                    const pct = totalApps > 0 ? Math.round((legend.count / totalApps) * 100) : 0;
                    return (
                      <div
                        key={legend.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(legend.status),
                            }}
                          />
                          <span style={{ color: 'var(--text-secondary)' }}>{legend.label}</span>
                        </div>
                        <span style={{ fontWeight: '600' }}>
                          {legend.count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 'var(--space-4)' }}>
                No status data. Track applications to see metrics.
              </p>
            )}
          </Card>

          {/* Quick onboarding card */}
          {profiles.length === 0 && (
            <Card style={{ background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1), rgba(var(--color-accent-rgb), 0.05))', border: '1px solid rgba(var(--color-primary-rgb), 0.2)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                <Sparkles size={18} className="text-primary" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontWeight: '700', marginBottom: '4px' }}>Welcome Onboard!</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Create your first user profile to start automatically filling job applications.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate('profile')}
                    style={{ marginTop: '8px' }}
                  >
                    Create Profile
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
