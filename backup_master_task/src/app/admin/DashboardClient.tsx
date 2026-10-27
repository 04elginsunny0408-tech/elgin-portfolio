'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  LogOut,
  FolderKanban,
  Award,
  User,
  Settings,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  ExternalLink,
  Laptop,
  Save,
  Palette,
  FileText
} from 'lucide-react';

interface DashboardClientProps {
  owner: any;
  initialSettings: any;
  initialProjects: any[];
  initialCertificates: any[];
  initialSkills: any[];
  initialEducation: any[];
  initialSessions: any[];
}

export default function DashboardClient({
  owner,
  initialSettings,
  initialProjects,
  initialCertificates,
  initialSkills,
  initialEducation,
  initialSessions,
}: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'certificates' | 'settings' | 'security'>('projects');

  // State management
  const [settings, setSettings] = useState(initialSettings);
  const [projects, setProjects] = useState(initialProjects);
  const [certificates, setCertificates] = useState(initialCertificates);
  const [sessions, setSessions] = useState(initialSessions);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Project Form Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  // Certificate AI Extraction & Upload Modal
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    credential_id: '',
    credential_url: '',
    file_path: '',
    skills_verified: '',
    ai_extracted: false,
    needs_review: false,
    is_published: false,
  });
  const [certRawText, setCertRawText] = useState('');
  const [isExtractingCert, setIsExtractingCert] = useState(false);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showNotification('Settings updated successfully.');
      } else {
        showNotification('Failed to update settings.', 'error');
      }
    } catch {
      showNotification('Error saving settings.', 'error');
    }
  };

  // File Upload helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'logo' | 'projectCover' | 'certFile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      showNotification('Uploading file securely...');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (targetField === 'logo') {
          setSettings((prev: any) => ({ ...prev, logo_url: data.url }));
        } else if (targetField === 'projectCover' && editingProject) {
          setEditingProject((prev: any) => ({ ...prev, cover_image: data.url }));
        } else if (targetField === 'certFile') {
          setCertForm((prev) => ({ ...prev, file_path: data.url }));
        }
        showNotification('File uploaded successfully!');
      } else {
        showNotification(data.error || 'Upload failed.', 'error');
      }
    } catch {
      showNotification('Network error during upload.', 'error');
    }
  };

  // Save or Update Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const method = editingProject.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      });

      if (res.ok) {
        showNotification(editingProject.id ? 'Project updated!' : 'Project created!');
        setIsProjectModalOpen(false);
        setEditingProject(null);
        // Refresh project list
        const refresh = await fetch('/api/admin/projects');
        const d = await refresh.json();
        setProjects(d.projects || []);
      } else {
        showNotification('Failed to save project.', 'error');
      }
    } catch {
      showNotification('Error saving project.', 'error');
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        showNotification('Project deleted.');
      } else {
        showNotification('Failed to delete project.', 'error');
      }
    } catch {
      showNotification('Error deleting project.', 'error');
    }
  };

  // Trigger AI Certificate Extraction
  const handleExtractCertificate = async () => {
    if (!certRawText.trim() && !certForm.file_path) {
      showNotification('Please enter certificate text or upload a document first.', 'error');
      return;
    }

    setIsExtractingCert(true);
    try {
      const res = await fetch('/api/admin/certificates/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: certRawText, fileName: certForm.file_path }),
      });
      const data = await res.json();
      if (res.ok && data.draft) {
        setCertForm((prev) => ({
          ...prev,
          ...data.draft,
        }));
        showNotification('AI extracted metadata draft! Please review and verify.');
      } else {
        showNotification('Extraction failed.', 'error');
      }
    } catch {
      showNotification('Network error during extraction.', 'error');
    } finally {
      setIsExtractingCert(false);
    }
  };

  // Save Certificate
  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.title || !certForm.issuer) {
      showNotification('Title and Issuer are required.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certForm),
      });

      if (res.ok) {
        showNotification('Certificate saved! ' + (certForm.is_published ? 'Published to portfolio.' : 'Saved as private draft.'));
        setIsCertModalOpen(false);
        setCertForm({
          title: '',
          issuer: '',
          issue_date: '',
          credential_id: '',
          credential_url: '',
          file_path: '',
          skills_verified: '',
          ai_extracted: false,
          needs_review: false,
          is_published: false,
        });
        const refresh = await fetch('/api/admin/certificates');
        const d = await refresh.json();
        setCertificates(d.certificates || []);
      } else {
        showNotification('Failed to save certificate.', 'error');
      }
    } catch {
      showNotification('Error saving certificate.', 'error');
    }
  };

  // Revoke all other sessions
  const handleRevokeSessions = async () => {
    if (!confirm('Revoke all other active logins on your phone and other browsers?')) return;
    try {
      const res = await fetch('/api/auth/sessions', { method: 'DELETE' });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.is_current));
        showNotification('All other devices revoked.');
      }
    } catch {
      showNotification('Failed to revoke sessions.', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070b19', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header
        style={{
          height: '68px',
          borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
          background: 'rgba(10, 16, 40, 0.9)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00f0ff, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={20} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              Elgin Owner Portal
            </span>
            <span style={{ marginLeft: '10px', fontSize: '0.72rem', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.1)' }}>
              Authenticated: {owner?.username}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: '#94a3b8',
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <Eye size={14} />
            <span>View Public Site</span>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: '#f87171',
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 99999,
            padding: '12px 20px',
            borderRadius: '10px',
            background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Dashboard Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Nav */}
        <aside
          style={{
            width: '240px',
            borderRight: '1px solid rgba(56, 189, 248, 0.1)',
            background: 'rgba(8, 13, 33, 0.7)',
            padding: '24px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {[
            { id: 'projects', label: 'Projects Manager', icon: FolderKanban },
            { id: 'certificates', label: 'Certificates (AI)', icon: Award },
            { id: 'profile', label: 'Profile & Social', icon: User },
            { id: 'settings', label: 'Theme & Mascot', icon: Palette },
            { id: 'security', label: 'Sessions & Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                  border: isSelected ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid transparent',
                  color: isSelected ? '#00f0ff' : '#94a3b8',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content View */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {/* ================= TAB: PROJECTS ================= */}
          {activeTab === 'projects' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Project Management</h2>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
                    Publish, edit, and organize verified portfolio projects.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProject({
                      title: '',
                      summary: '',
                      description: '',
                      tech_stack: '',
                      cover_image: '',
                      demo_url: '',
                      repo_url: '',
                      verified_dates: '',
                      is_published: 1,
                      sort_order: 0,
                    });
                    setIsProjectModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>Add Project</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="glass-panel"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: proj.is_published ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: proj.is_published ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: proj.is_published ? '#34d399' : '#f87171',
                          }}
                        >
                          {proj.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {proj.verified_dates}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '12px' }}>
                        {proj.title}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '6px', lineHeight: 1.5 }}>
                        {proj.summary}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {proj.tech_stack.split(',').map((t: string, i: number) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.06)',
                            }}
                          >
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                      <button
                        onClick={() => {
                          setEditingProject(proj);
                          setIsProjectModalOpen(true);
                        }}
                        style={{
                          fontSize: '0.82rem',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id, proj.title)}
                        style={{
                          fontSize: '0.82rem',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: CERTIFICATES ================= */}
          {activeTab === 'certificates' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Certificate Manager (AI-Assisted)</h2>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
                    Upload credentials, let AI extract metadata drafts, review, and approve publication.
                  </p>
                </div>
                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="btn-primary"
                  style={{ gap: '6px' }}
                >
                  <Sparkles size={16} />
                  <span>AI Certificate Draft</span>
                </button>
              </div>

              {certificates.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <Award size={48} style={{ color: '#fbbf24', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Certificates Stored Yet</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '480px', margin: '8px auto 20px' }}>
                    Click &apos;AI Certificate Draft&apos; to upload an image or PDF. The AI assistant extracts verified fields into an editable draft for your approval.
                  </p>
                  <button onClick={() => setIsCertModalOpen(true)} className="btn-secondary">
                    Add Your First Certificate
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {certificates.map((cert) => (
                    <div key={cert.id} className="glass-panel" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: cert.is_published ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: cert.is_published ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {cert.is_published ? 'PUBLISHED' : 'DRAFT (UNPUBLISHED)'}
                        </span>
                        {cert.needs_review && (
                          <span style={{ fontSize: '0.7rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} />
                            <span>Needs Verification</span>
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '12px' }}>{cert.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Issuer: {cert.issuer}</p>
                      {cert.credential_id && (
                        <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>ID: {cert.credential_id}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB: PROFILE & SOCIAL ================= */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '680px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px' }}>Profile & Social Links</h2>
              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Owner Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.owner_name}
                    onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(10, 16, 40, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Headline / Title
                  </label>
                  <input
                    type="text"
                    value={settings.headline}
                    onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(10, 16, 40, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                    Biography / About
                  </label>
                  <textarea
                    rows={4}
                    value={settings.bio}
                    onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(10, 16, 40, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}
                  />
                </div>

                <div style={{ borderTop: '1px solid rgba(56, 189, 248, 0.1)', paddingTop: '18px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Social & Contact URLs (Optional)</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>GitHub URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={settings.github_url || ''}
                        onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(10, 16, 40, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>LinkedIn URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/..."
                        value={settings.linkedin_url || ''}
                        onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(10, 16, 40, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Instagram URL</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={settings.instagram_url || ''}
                        onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(10, 16, 40, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>Contact Email</label>
                      <input
                        type="email"
                        placeholder="elgin@domain.com"
                        value={settings.contact_email || ''}
                        onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(10, 16, 40, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: 'fit-content' }}>
                  <Save size={16} />
                  <span>Save Profile Changes</span>
                </button>
              </form>
            </div>
          )}

          {/* ================= TAB: SETTINGS & THEMES ================= */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '680px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px' }}>Global Defaults & Mascot</h2>
              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                    Global Default Theme (for new visitors)
                  </label>
                  <select
                    value={settings.default_theme}
                    onChange={(e) => setSettings({ ...settings, default_theme: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(10, 16, 40, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}
                  >
                    <option value="space">Space (Solar-System Experience)</option>
                    <option value="professional">Professional (Developer Studio Dark)</option>
                    <option value="study">Study (Minimal Futuristic Glass)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                    Iris AI Mascot Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.iris_name}
                    onChange={(e) => setSettings({ ...settings, iris_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(10, 16, 40, 0.8)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                    Custom Website Logo (Upload/Change)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    style={{ fontSize: '0.85rem', color: '#94a3b8' }}
                  />
                  {settings.logo_url && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Current logo active</span>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary" style={{ width: 'fit-content', marginTop: '10px' }}>
                  <Save size={16} />
                  <span>Update Theme & Mascot Defaults</span>
                </button>
              </form>
            </div>
          )}

          {/* ================= TAB: SECURITY & SESSIONS ================= */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Active Sessions & Devices</h2>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
                    View and manage all browsers and phones authenticated into your owner account.
                  </p>
                </div>
                {sessions.length > 1 && (
                  <button onClick={handleRevokeSessions} style={{ color: '#f87171', fontSize: '0.82rem', padding: '8px 14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)' }}>
                    Revoke Other Devices
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="glass-panel"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <Laptop size={22} style={{ color: s.is_current ? '#00f0ff' : '#94a3b8' }} />
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                          {s.is_current ? 'Current Active Device' : 'Authenticated Device'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          IP: {s.ip_address} • Last Active: {new Date(s.last_active_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {s.is_current && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff' }}>
                        THIS DEVICE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: EDIT / ADD PROJECT ================= */}
      {isProjectModalOpen && editingProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '620px',
              width: '100%',
              padding: '30px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '18px' }}>
              {editingProject.id ? 'Edit Project' : 'Create New Project'}
            </h3>

            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  Summary / Short Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.summary}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Technologies (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="HTML, CSS, JS, Node"
                    value={editingProject.tech_stack}
                    onChange={(e) => setEditingProject({ ...editingProject, tech_stack: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Verified Dates / Hackathon Badge
                  </label>
                  <input
                    type="text"
                    placeholder="SIH Journey / 2024"
                    value={editingProject.verified_dates}
                    onChange={(e) => setEditingProject({ ...editingProject, verified_dates: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  Project Cover Visual
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'projectCover')}
                  style={{ fontSize: '0.8rem', color: '#94a3b8' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="pubCheck"
                  checked={!!editingProject.is_published}
                  onChange={(e) => setEditingProject({ ...editingProject, is_published: e.target.checked ? 1 : 0 })}
                />
                <label htmlFor="pubCheck" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Publish on public website
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '18px' }}>
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: AI CERTIFICATE DRAFT ================= */}
      {isCertModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: '#00f0ff' }} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>AI Certificate Assistant</h3>
              </div>
              <button onClick={() => setIsCertModalOpen(false)} style={{ color: '#94a3b8', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '18px' }}>
              Upload a certificate document or paste certificate text. The AI extracts a draft without publishing. You must verify and approve before it appears publicly.
            </p>

            <div style={{ background: 'rgba(10, 16, 40, 0.8)', padding: '16px', borderRadius: '8px', border: '1px dashed rgba(56, 189, 248, 0.3)', marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#00f0ff', marginBottom: '6px' }}>
                Upload Certificate Document (PDF or Image)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e, 'certFile')}
                style={{ fontSize: '0.8rem', color: '#94a3b8' }}
              />
              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  Or Paste Certificate Text / OCR Output
                </label>
                <textarea
                  rows={2}
                  placeholder="Paste text from certificate here for instant AI draft parsing..."
                  value={certRawText}
                  onChange={(e) => setCertRawText(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#070b18', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                />
              </div>

              <button
                type="button"
                onClick={handleExtractCertificate}
                disabled={isExtractingCert}
                className="btn-primary"
                style={{ marginTop: '12px', fontSize: '0.85rem', padding: '6px 14px' }}
              >
                {isExtractingCert ? 'Extracting Metadata...' : 'Run AI Extraction Draft'}
              </button>
            </div>

            <form onSubmit={handleSaveCertificate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Certificate Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={certForm.title}
                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={certForm.issuer}
                    onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Issue Date / Month
                  </label>
                  <input
                    type="text"
                    value={certForm.issue_date}
                    onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    Credential ID / Code
                  </label>
                  <input
                    type="text"
                    value={certForm.credential_id}
                    onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                  Skills Verified
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, Machine Learning"
                  value={certForm.skills_verified}
                  onChange={(e) => setCertForm({ ...certForm, skills_verified: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0a1028', border: '1px solid rgba(56, 189, 248, 0.2)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  id="certPub"
                  checked={certForm.is_published}
                  onChange={(e) => setCertForm({ ...certForm, is_published: e.target.checked })}
                />
                <label htmlFor="certPub" style={{ fontSize: '0.85rem', fontWeight: 700, color: certForm.is_published ? '#34d399' : '#94a3b8' }}>
                  I have verified this certificate. Publish to public portfolio.
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsCertModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Certificate Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
