import { useEffect, useState } from 'react';
import { useProfileStore } from '../store';
import type { ProfileType } from '../types';
import { PROFILE_TYPE_LABELS } from '../types';
import {
  PersonalInfoForm,
  EducationForm,
  ExperienceForm,
  ProjectsForm,
  SkillsForm,
  SocialLinksForm,
  CertificationsForm,
} from './index';
import { Tabs, ProgressBar, Button, Select, toast } from '@/shared/components';
import { User, GraduationCap, Briefcase, FolderGit2, Wrench, Link2, Award, Plus, Trash2, Sparkles, Upload } from 'lucide-react';
import { useResumeStore } from '@/features/resume/store';
import { MockAIService } from '@/features/ai/services/answer-generator';
import { getAIService } from '@/features/ai/services/groq';
import './profile-forms.css';

export function ProfileEditor() {
  const {
    profiles,
    activeProfileId,
    loading,
    loadProfiles,
    createProfile,
    updateProfile,
    updatePersonalInfo,
    updateEducation,
    updateExperience,
    updateProjects,
    updateSkills,
    updateSocialLinks,
    updateCertifications,
    setActiveProfile,
    deleteProfile,
    getProfileCompletion,
  } = useProfileStore();

  const { resumes, loadResumes, uploadResume } = useResumeStore();

  const [newProfileType, setNewProfileType] = useState<ProfileType>('sde');
  const [customRoleName, setCustomRoleName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');

  useEffect(() => {
    loadProfiles();
    loadResumes();
  }, [loadProfiles, loadResumes]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null;

  const handleCreate = async () => {
    try {
      let finalType = newProfileType;
      if (newProfileType === 'custom') {
        if (!customRoleName.trim()) {
          toast.error('Role Required', 'Please enter a custom role name.');
          return;
        }
        finalType = customRoleName.trim();
      }
      await createProfile(finalType);
      toast.success('Profile Created', `New ${PROFILE_TYPE_LABELS[finalType]} profile created successfully.`);
      setShowCreateModal(false);
      setCustomRoleName('');
      setNewProfileType('sde');
    } catch (err) {
      toast.error('Failed to create profile', String(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this profile? All its data will be lost.')) {
      try {
        await deleteProfile(id);
        toast.success('Profile Deleted', 'Profile has been removed.');
      } catch (err) {
        toast.error('Failed to delete profile', String(err));
      }
    }
  };

  if (loading) {
    return (
      <div className="section-card">
        <div className="skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  const profileOptions = [
    { value: 'sde', label: 'SDE (Full Stack)' },
    { value: 'frontend', label: 'Frontend Developer' },
    { value: 'backend', label: 'Backend Developer' },
    { value: 'devops', label: 'DevOps Engineer' },
    { value: 'data-science', label: 'Data Scientist' },
    { value: 'custom', label: 'Custom Role...' },
  ];

  const renderForms = () => {
    if (!activeProfile) return null;
    const profileId = activeProfile.id!;

    const tabItems = [
      {
        id: 'personal',
        label: 'Personal',
        icon: <User size={14} />,
        content: (
          <PersonalInfoForm
            data={activeProfile.personalInfo}
            onSave={async (data) => {
              await updatePersonalInfo(profileId, data);
              toast.success('Saved', 'Personal Information updated successfully.');
            }}
          />
        ),
      },
      {
        id: 'education',
        label: 'Education',
        icon: <GraduationCap size={14} />,
        content: (
          <EducationForm
            data={activeProfile.education}
            onSave={async (data) => {
              await updateEducation(profileId, data);
              toast.success('Saved', 'Education details updated.');
            }}
          />
        ),
      },
      {
        id: 'experience',
        label: 'Experience',
        icon: <Briefcase size={14} />,
        content: (
          <ExperienceForm
            data={activeProfile.experience}
            onSave={async (data) => {
              await updateExperience(profileId, data);
              toast.success('Saved', 'Work experience details updated.');
            }}
          />
        ),
      },
      {
        id: 'projects',
        label: 'Projects',
        icon: <FolderGit2 size={14} />,
        content: (
          <ProjectsForm
            data={activeProfile.projects}
            onSave={async (data) => {
              await updateProjects(profileId, data);
              toast.success('Saved', 'Projects updated.');
            }}
          />
        ),
      },
      {
        id: 'skills',
        label: 'Skills',
        icon: <Wrench size={14} />,
        content: (
          <SkillsForm
            data={activeProfile.skills}
            onSave={async (data) => {
              await updateSkills(profileId, data);
              toast.success('Saved', 'Skills updated.');
            }}
          />
        ),
      },
      {
        id: 'social',
        label: 'Socials',
        icon: <Link2 size={14} />,
        content: (
          <SocialLinksForm
            data={activeProfile.socialLinks}
            onSave={async (data) => {
              await updateSocialLinks(profileId, data);
              toast.success('Saved', 'Social links updated.');
            }}
          />
        ),
      },
      {
        id: 'certifications',
        label: 'Certifications',
        icon: <Award size={14} />,
        content: (
          <CertificationsForm
            data={activeProfile.certifications}
            onSave={async (data) => {
              await updateCertifications(profileId, data);
              toast.success('Saved', 'Certifications updated.');
            }}
          />
        ),
      },
    ];

    return <Tabs tabs={tabItems} className="profile-tabs" />;
  };

  return (
    <div className="profile-editor-container">
      {/* Profile selector bar */}
      <div className="section-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div className="profile-selector">
            {profiles.map((p) => (
              <button
                key={p.id}
                className={`profile-chip ${activeProfileId === p.id ? 'active' : ''}`}
                onClick={() => p.id && setActiveProfile(p.id)}
              >
                {p.isActive && <span className="chip-dot" />}
                {p.name}
              </button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setShowCreateModal(true)}
            >
              New Profile
            </Button>
            {activeProfile && (
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles size={14} />}
                onClick={() => setShowImportModal(true)}
              >
                AI Autofill from Resume
              </Button>
            )}
          </div>

          {activeProfile && profiles.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={14} />}
              className="text-danger"
              onClick={() => handleDelete(activeProfile.id!)}
            >
              Delete Active Profile
            </Button>
          )}
        </div>

        {activeProfile && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <ProgressBar
              value={getProfileCompletion(activeProfile.id!)}
              label={`${PROFILE_TYPE_LABELS[activeProfile.type]} Completion`}
              variant="gradient"
            />
          </div>
        )}
      </div>

      {activeProfile ? (
        <div className="section-card">{renderForms()}</div>
      ) : (
        <div className="section-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <h3>No Profiles Found</h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
            Create your first profile to start storing your resume and job details.
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Create Profile
          </Button>
        </div>
      )}

      {/* Simple creation modal inline/overlay */}
      {showCreateModal && (
        <div className="modal-overlay-container" style={{ display: 'flex' }}>
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)} />
          <div className="modal modal-sm" style={{ zIndex: 301 }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Profile</h2>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Select
                label="Profile Role Type"
                options={profileOptions}
                value={newProfileType}
                onChange={(e) => setNewProfileType(e.target.value as ProfileType)}
              />
              {newProfileType === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Custom Role Name
                  </label>
                  <input
                    type="text"
                    value={customRoleName}
                    onChange={(e) => setCustomRoleName(e.target.value)}
                    placeholder="e.g. iOS Developer, Product Manager"
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
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                <Button variant="secondary" onClick={() => { setShowCreateModal(false); setCustomRoleName(''); setNewProfileType('sde'); }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleCreate}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Resume Import Modal */}
      {showImportModal && activeProfile && (
        <div className="modal-overlay-container" style={{ display: 'flex' }}>
          <div className="modal-overlay" onClick={() => !isExtracting && setShowImportModal(false)} />
          <div className="modal" style={{ zIndex: 301, maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} className="text-primary" />
                AI Resume Autofill
              </h2>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {isExtracting ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div className="spinner" style={{ border: '4px solid rgba(255, 255, 255, 0.1)', borderTop: '4px solid var(--color-primary-500)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto var(--space-4)' }} />
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  <p style={{ fontWeight: '600' }}>Extracting details from resume...</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>This may take a few seconds.</p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Import your details automatically by selecting an existing resume or uploading a new one. This will fill your <strong>{PROFILE_TYPE_LABELS[activeProfile.type]}</strong> profile fields.
                  </p>

                  {resumes.filter((r) => r.profileId === activeProfile.id).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Select Existing Resume</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                        {resumes
                          .filter((r) => r.profileId === activeProfile.id)
                          .map((r) => (
                            <label
                              key={r.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid',
                                borderColor: selectedResumeId === r.id ? 'var(--color-primary-500)' : 'var(--border-color)',
                                background: selectedResumeId === r.id ? 'rgba(var(--color-primary-rgb), 0.04)' : 'rgba(255,255,255,0.01)',
                                cursor: 'pointer',
                                fontSize: '13px',
                              }}
                            >
                              <input
                                type="radio"
                                name="selectedResume"
                                checked={selectedResumeId === r.id}
                                onChange={() => {
                                  setSelectedResumeId(r.id || null);
                                  setUploadFile(null);
                                }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '600', color: selectedResumeId === r.id ? 'var(--color-primary-500)' : 'var(--text-primary)' }}>{r.name}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{r.fileName}</span>
                              </div>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {resumes.filter((r) => r.profileId === activeProfile.id).length > 0 ? 'Or Upload a New Resume' : 'Upload Resume'}
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                          if (!allowed.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
                            toast.error('Invalid Type', 'Please drop a PDF or Word document.');
                            return;
                          }
                          setUploadFile(file);
                          setUploadName(file.name.replace(/\.[^/.]+$/, ''));
                          setSelectedResumeId(null);
                        }
                      }}
                      onClick={() => document.getElementById('ai-resume-file-input')?.click()}
                      style={{
                        border: '2px dashed',
                        borderColor: dragOver ? 'var(--color-primary-500)' : 'var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-6)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: dragOver ? 'rgba(var(--color-primary-rgb), 0.04)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        id="ai-resume-file-input"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                            if (!allowed.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
                              toast.error('Invalid Type', 'Please upload a PDF or Word document.');
                              return;
                            }
                            setUploadFile(file);
                            setUploadName(file.name.replace(/\.[^/.]+$/, ''));
                            setSelectedResumeId(null);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      <Upload size={24} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
                      {uploadFile ? (
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{uploadFile.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Drag file here or click to browse</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Supports PDF, DOC, DOCX up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadFile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Resume Label / Title</label>
                      <input
                        type="text"
                        value={uploadName}
                        onChange={(e) => setUploadName(e.target.value)}
                        placeholder="e.g., SDE Resume - backend"
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
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowImportModal(false);
                        setUploadFile(null);
                        setSelectedResumeId(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={async () => {
                        setIsExtracting(true);
                        try {
                          let fileBlob: Blob | null = null;
                          let mimeType = 'application/pdf';
                          if (uploadFile) {
                            if (!uploadName.trim()) {
                              toast.error('Label Required', 'Please provide a name/label.');
                              setIsExtracting(false);
                              return;
                            }
                            await uploadResume(uploadName.trim(), uploadFile, activeProfile.id!);
                            fileBlob = uploadFile;
                            mimeType = uploadFile.type;
                          } else if (selectedResumeId) {
                            const selected = resumes.find(r => r.id === selectedResumeId);
                            if (selected) {
                              fileBlob = selected.data;
                              mimeType = selected.mimeType;
                            }
                          }

                          if (!fileBlob) {
                            toast.error('No Resume', 'Please select or upload a resume.');
                            setIsExtracting(false);
                            return;
                          }

                          if (!mimeType.includes('pdf')) {
                            toast.error('Invalid Format', 'AI resume extraction only supports PDF files. Please upload a PDF resume.');
                            setIsExtracting(false);
                            return;
                          }

                          const ai = await getAIService();
                          if (ai instanceof MockAIService) {
                            toast.info('Using Mock Service', 'Configure a Groq API Key in Settings to extract details from your actual resume.');
                          }
                          const parsed = await ai.extractDetailsFromResume(fileBlob, mimeType);
                          await updateProfile(activeProfile.id!, parsed);
                          toast.success('Import Successful', 'Profile updated with resume details.');
                          setShowImportModal(false);
                          setUploadFile(null);
                          setSelectedResumeId(null);
                        } catch (err) {
                          toast.error('Import Failed', String(err));
                        } finally {
                          setIsExtracting(false);
                        }
                      }}
                      disabled={!selectedResumeId && !uploadFile}
                    >
                      Extract & Populate
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
