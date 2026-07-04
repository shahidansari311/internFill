import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Download, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { Button, Input, Select, Card, Badge, Modal, toast } from '@/shared/components';
import { useTrackerStore } from '@/features/tracker/store';
import { useProfileStore } from '@/features/profile/store';
import { applicationSchema, type ApplicationFormData } from '@/features/tracker/schemas/application.schema';
import { generateCSV, downloadCSV } from '@/shared/utils/csv';
import type { ApplicationStatus } from '@/features/tracker/types';

export default function ApplicationsPage() {
  const { applications, loadApplications, addApplication, updateApplication, deleteApplication } = useTrackerStore();
  const { profiles, loadProfiles } = useProfileStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadApplications();
    loadProfiles();
  }, [loadApplications, loadProfiles]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: '',
      role: '',
      website: '',
      status: 'applied',
      notes: '',
      profileId: 0,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      if (editingId !== null) {
        await updateApplication(editingId, data);
        toast.success('Application Updated', 'Your changes have been saved.');
      } else {
        // Assert the non-optional fields to resolve Omit typing difference
        await addApplication({
          company: data.company,
          role: data.role,
          website: data.website || '',
          status: data.status,
          notes: data.notes || '',
          profileId: data.profileId,
        });
        toast.success('Application Added', 'New application tracked successfully.');
      }
      handleCloseModal();
    } catch (err) {
      toast.error('Operation Failed', String(err));
    }
  };

  const handleEdit = (app: any) => {
    setEditingId(app.id);
    setValue('company', app.company);
    setValue('role', app.role);
    setValue('website', app.website || '');
    setValue('status', app.status);
    setValue('notes', app.notes || '');
    setValue('profileId', app.profileId);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(id);
        toast.success('Application Deleted', 'Record removed.');
      } catch (err) {
        toast.error('Failed to Delete', String(err));
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    reset({
      company: '',
      role: '',
      website: '',
      status: 'applied',
      notes: '',
      profileId: profiles[0]?.id || 0,
    });
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    reset({
      company: '',
      role: '',
      website: '',
      status: 'applied',
      notes: '',
      profileId: profiles[0]?.id || 0,
    });
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    if (applications.length === 0) {
      toast.warning('No Data', 'There are no applications to export.');
      return;
    }

    const columns = [
      { header: 'Company', accessor: (row: any) => row.company },
      { header: 'Role', accessor: (row: any) => row.role },
      { header: 'Status', accessor: (row: any) => row.status.toUpperCase() },
      { header: 'Website', accessor: (row: any) => row.website || '' },
      { header: 'Notes', accessor: (row: any) => row.notes || '' },
      { header: 'Applied Date', accessor: (row: any) => new Date(row.appliedAt).toLocaleDateString() },
    ];

    const csvContent = generateCSV(applications, columns);
    downloadCSV(csvContent, `internfill_applications_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Export Complete', 'Your applications CSV file has been downloaded.');
  };

  // Filter list
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case 'applied':
        return 'primary';
      case 'interview':
        return 'warning';
      case 'offer':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Applications Tracker</h1>
          <p>Manage and track all your internship submissions</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="secondary" icon={<Download size={16} />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAddModal}>
            Add Application
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {(['all', 'applied', 'interview', 'offer', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: statusFilter === status ? 'var(--color-primary-500)' : 'var(--border-color)',
                  background: statusFilter === status ? 'rgba(var(--color-primary-rgb), 0.08)' : 'transparent',
                  color: statusFilter === status ? 'var(--color-primary-500)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ width: '280px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {filteredApplications.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: '600', fontSize: '13px', color: 'var(--text-tertiary)' }}>Company</th>
                  <th style={{ padding: '14px 20px', fontWeight: '600', fontSize: '13px', color: 'var(--text-tertiary)' }}>Role</th>
                  <th style={{ padding: '14px 20px', fontWeight: '600', fontSize: '13px', color: 'var(--text-tertiary)' }}>Profile Used</th>
                  <th style={{ padding: '14px 20px', fontWeight: '600', fontSize: '13px', color: 'var(--text-tertiary)' }}>Applied Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: '600', fontSize: '13px', color: 'var(--text-tertiary)' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: '600', fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => {
                  const associatedProfile = profiles.find((p) => p.id === app.profileId);
                  return (
                    <tr
                      key={app.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.2s',
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '16px 20px', fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {app.company}
                          {app.website && (
                            <a href={app.website} target="_blank" rel="noreferrer" style={{ color: 'var(--text-tertiary)' }}>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{app.role}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                        {associatedProfile ? associatedProfile.name : 'Unknown'}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <Badge variant={getStatusBadgeVariant(app.status)} size="md">
                          {app.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
                          <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => handleEdit(app)} />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={13} />}
                            className="text-danger"
                            onClick={() => app.id && handleDelete(app.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
            <h3>No applications found</h3>
            <p>Try refining your search filter or add a new application above.</p>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId !== null ? 'Edit Application' : 'Add Application'}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Input
                label="Company Name"
                {...register('company')}
                error={errors.company?.message}
                placeholder="e.g. Google"
              />
              <Input
                label="Role / Job Title"
                {...register('role')}
                error={errors.role?.message}
                placeholder="e.g. Software Engineer Intern"
              />
            </div>

            <Input
              label="Application Website / Job URL (Optional)"
              {...register('website')}
              error={errors.website?.message}
              placeholder="https://careers.google.com/..."
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Select
                label="Status"
                {...register('status')}
                error={errors.status?.message}
                options={[
                  { value: 'applied', label: 'Applied' },
                  { value: 'interview', label: 'Interview' },
                  { value: 'offer', label: 'Offer' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />

              <Select
                label="Associated Profile"
                {...register('profileId', { valueAsNumber: true })}
                error={errors.profileId?.message}
                options={profiles.map((p) => ({ value: String(p.id), label: p.name }))}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Notes / Cover Letter Snippets</label>
              <textarea
                rows={3}
                {...register('notes')}
                placeholder="Interview schedules, referral names, or details..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={isSubmitting}>
                {editingId !== null ? 'Save Changes' : 'Add Application'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
