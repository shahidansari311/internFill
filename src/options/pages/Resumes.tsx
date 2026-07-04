import { useEffect, useState, useRef } from 'react';
import { FileText, Trash2, Upload, Check, AlertCircle } from 'lucide-react';
import { Button, Input, Card, Badge, toast } from '@/shared/components';
import { useProfileStore } from '@/features/profile/store';
import { useResumeStore } from '@/features/resume/store';
import { PROFILE_TYPE_LABELS } from '@/features/profile/types';

export default function ResumesPage() {
  const { profiles, activeProfileId, setActiveProfile, loadProfiles } = useProfileStore();
  const { resumes, loading, loadResumes, uploadResume, deleteResume, setDefaultResume } = useResumeStore();

  const [resumeName, setResumeName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfiles();
    loadResumes();
  }, [loadProfiles, loadResumes]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;
  const activeProfileResumes = resumes.filter((r) => r.profileId === activeProfileId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      toast.error('Invalid File Type', 'Please upload a PDF or Word document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File Too Large', 'Maximum resume file size is 10MB.');
      return;
    }

    setSelectedFile(file);
    if (!resumeName) {
      // Auto-populate resume name from file name (sans extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setResumeName(nameWithoutExt);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) {
      toast.error('Error', 'Please create a profile first.');
      return;
    }
    if (!selectedFile) {
      toast.error('File Required', 'Please select or drag a resume file.');
      return;
    }
    if (!resumeName.trim()) {
      toast.error('Label Required', 'Please enter a name/label for the resume.');
      return;
    }

    try {
      await uploadResume(resumeName.trim(), selectedFile, activeProfile.id!);
      toast.success('Upload Successful', 'Resume has been stored and associated with this profile.');
      setResumeName('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error('Upload Failed', String(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume(id);
        toast.success('Resume Deleted', 'File removed from local storage.');
      } catch (err) {
        toast.error('Delete Failed', String(err));
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    if (!activeProfile) return;
    try {
      await setDefaultResume(id, activeProfile.id!);
      toast.success('Default Updated', 'Primary resume updated for this profile.');
    } catch (err) {
      toast.error('Failed to set default', String(err));
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="page-header">
        <div>
          <h1>Resume Management</h1>
          <p>Associate and store multiple resumes for each profile type</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Resumes List & Upload Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {activeProfile ? (
            <>
              {/* Upload Card */}
              <Card>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Upload Resume for {activeProfile.name}</h3>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div
                    className={`drag-drop-zone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-8)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isDragOver ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent',
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                    />
                    <Upload size={32} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }} />
                    {selectedFile ? (
                      <div>
                        <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedFile.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{formatBytes(selectedFile.size)}</p>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>
                          Drag & drop your resume here, or <span className="text-primary">browse</span>
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                          Supports PDF, DOC, DOCX up to 10MB
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedFile && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-3)', alignItems: 'end' }}>
                      <Input
                        label="Resume Label / Title"
                        value={resumeName}
                        onChange={(e) => setResumeName(e.target.value)}
                        placeholder="e.g., SDE Resume - Backend Focus"
                      />
                      <Button variant="primary" type="submit" loading={loading} style={{ height: '42px' }}>
                        Upload
                      </Button>
                    </div>
                  )}
                </form>
              </Card>

              {/* Resumes List Card */}
              <Card>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Saved Resumes</h3>
                {activeProfileResumes.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {activeProfileResumes.map((resume) => (
                      <div
                        key={resume.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div
                            style={{
                              padding: '8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(var(--color-primary-rgb), 0.1)',
                              color: 'var(--color-primary-500)',
                            }}
                          >
                            <FileText size={18} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '600' }}>{resume.name}</span>
                              {resume.isDefault && (
                                <Badge variant="success" size="sm">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                              {resume.fileName} • {formatBytes(resume.size)}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {!resume.isDefault && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Check size={14} />}
                              onClick={() => resume.id && handleSetDefault(resume.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={14} />}
                            className="text-danger"
                            onClick={() => resume.id && handleDelete(resume.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                    <FileText size={40} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p>No resumes uploaded for this profile yet.</p>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
              <AlertCircle size={40} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
              <h3>No Profiles Available</h3>
              <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                Please create a user profile before managing resumes.
              </p>
            </Card>
          )}
        </div>

        {/* Profile Sidebar Switcher */}
        <div>
          <Card>
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Select Profile</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => p.id && setActiveProfile(p.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: activeProfileId === p.id ? 'var(--color-primary-500)' : 'var(--border-color)',
                    background: activeProfileId === p.id ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{PROFILE_TYPE_LABELS[p.type]}</span>
                </button>
              ))}
              {profiles.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No profiles found. Go to Profile page to create one.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
