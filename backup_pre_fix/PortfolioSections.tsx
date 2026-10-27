'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Globe,
  ExternalLink,
  Code2,
  Calendar,
  Sparkles,
  ChevronRight,
  Award,
  Send,
  Mail,
  CheckCircle2,
  FileText,
  User,
  GraduationCap
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Iris3DCanvas = dynamic(() => import('./Iris3DCanvas'), { ssr: false });

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface PortfolioSectionsProps {
  theme: 'space' | 'professional' | 'study';
  projects: any[];
  skills: any[];
  education: any[];
  certificates: any[];
  settings: any;
  onExploreProject?: (project: any) => void;
}

export default function PortfolioSections({
  theme,
  projects,
  skills,
  education,
  certificates,
  settings,
  onExploreProject,
}: PortfolioSectionsProps) {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const ownerName = settings?.owner_name || 'Elgin';
  const headline = settings?.headline || 'CSE-AI Student | Developer | Problem Solver';
  const bio = settings?.bio || 'Building digital solutions, exploring AI and web technologies, and turning ideas into real-world impact.';

  // Default verified skills if table is fresh
  const displaySkills = skills.length > 0 ? skills : [
    { name: 'JavaScript / TypeScript', category: 'Frontend & Fullstack', proficiency: 90 },
    { name: 'Python', category: 'AI & Backend', proficiency: 88 },
    { name: 'HTML5 & Vanilla CSS', category: 'Core Web', proficiency: 95 },
    { name: 'Node.js & Express', category: 'Backend', proficiency: 85 },
    { name: 'Artificial Intelligence & ML', category: 'AI Foundations', proficiency: 80 },
    { name: 'Git & Version Control', category: 'Developer Tools', proficiency: 86 },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      {/* ===================== HERO SECTION (Professional & Study Themes) ===================== */}
      {theme !== 'space' && (
      <section
        id="home"
        style={{
          paddingTop: '120px',
          paddingBottom: '80px',
        }}
      >
        <div className="container">
          {/* Professional / Study: Two-column layout with Iris mascot on the right */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '60px',
                alignItems: 'center',
                maxWidth: '1100px',
              }}
            >
              {/* Left: Text content */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  animation: 'heroEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
                }}
              >
                <div
                  className={theme === 'professional' ? 'badge badge-cyan' : 'badge badge-gold'}
                  style={{ gap: '6px', alignSelf: 'flex-start' }}
                >
                  <Sparkles size={14} />
                  <span>{theme === 'professional' ? 'Professional Portfolio • Ready for Impact' : 'Academic & Study Workspace'}</span>
                </div>

                <h1
                  style={{
                    fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Hi, I&apos;m{' '}
                  <span
                    style={{
                      background:
                        theme === 'professional'
                          ? 'linear-gradient(135deg, #0284c7, #4f46e5)'
                          : 'linear-gradient(135deg, #b45309, #70478a)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {ownerName}
                  </span>
                </h1>

                <p
                  style={{
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    fontWeight: 600,
                    color: 'var(--accent-gold)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {headline}
                </p>

                <p
                  style={{
                    fontSize: '1rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.75,
                    maxWidth: '560px',
                  }}
                >
                  {bio}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <a href="#projects" className="btn-primary">
                    <span>Explore Projects</span>
                    <ChevronRight size={16} />
                  </a>
                  <a href="#about" className="btn-secondary">
                    <span>About {ownerName}</span>
                  </a>
                </div>

                {/* Quick stat row */}
                <div style={{ display: 'flex', gap: '28px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{projects.length}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Projects</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>SIH</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Smart India Hackathon</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>CSE-AI</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Specialization</div>
                  </div>
                </div>
              </div>

              {/* Right: Iris mascot */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  animation: 'heroEntrance 0.7s 0.15s cubic-bezier(0.16, 1, 0.3, 1) both',
                  flexShrink: 0,
                }}
              >
                {/* Glow backdrop */}
                <div
                  style={{
                    position: 'absolute',
                    width: '260px',
                    height: '260px',
                    borderRadius: '50%',
                    background:
                      theme === 'professional'
                        ? 'radial-gradient(circle, rgba(2, 132, 199, 0.12) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(194, 120, 3, 0.14) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                    zIndex: 0,
                  }}
                />

                {/* Genuine 3D Iris Mascot in Hero */}
                <div
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-iris-chat'));
                    }
                  }}
                  title="Click to chat with Iris!"
                  style={{
                    position: 'relative',
                    width: '240px',
                    height: '250px',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Iris3DCanvas
                    theme={theme}
                    size={230}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-iris-chat'));
                      }
                    }}
                  />
                </div>

                {/* Name tag with Click to Chat */}
                <div
                  className="glass-panel"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-iris-chat'));
                    }
                  }}
                  title="Click to chat with Iris!"
                  style={{
                    padding: '8px 20px',
                    textAlign: 'center',
                    zIndex: 1,
                    cursor: 'pointer',
                    borderColor:
                      theme === 'professional'
                        ? 'rgba(2, 132, 199, 0.35)'
                        : 'rgba(194, 120, 3, 0.35)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span>Iris</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)' }}>
                      Chat 💬
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {theme === 'professional' ? 'Executive AI Assistant' : 'Academic AI Guide'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== PROJECTS SECTION ===================== */}
      <section
        id="projects"
        style={{
          padding: '80px 0',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{ marginBottom: '40px' }}>
            <div className="badge badge-gold" style={{ marginBottom: '10px' }}>
              <Code2 size={13} />
              <span>Verified Work</span>
            </div>
            <h2
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
              }}
            >
              Featured Projects
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Real projects verified and published by {ownerName}.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '28px',
            }}
          >
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedProject(proj)}
              >
                {/* Project Visual Header */}
                <div
                  style={{
                    position: 'relative',
                    height: '220px',
                    width: '100%',
                    background: 'radial-gradient(circle at 50% 50%, #0d1a3a 0%, #050a1a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {proj.cover_image ? (
                    <div style={{ position: 'relative', width: '130px', height: '130px', borderRadius: '50%', overflow: 'hidden' }}>
                      <Image
                        src={proj.cover_image}
                        alt={proj.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <Globe size={64} style={{ color: 'var(--accent-cyan)' }} />
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(0,0,0,0.65)',
                      backdropFilter: 'blur(8px)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--accent-gold)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                    }}
                  >
                    {proj.verified_dates || 'Verified Project'}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {proj.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.92rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      marginTop: '10px',
                      flex: 1,
                    }}
                  >
                    {proj.summary}
                  </p>

                  {/* Tech stack pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
                    {proj.tech_stack.split(',').map((tech: string, i: number) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '16px',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      View Details & Architecture
                    </span>
                    <ExternalLink size={15} style={{ color: 'var(--accent-cyan)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CERTIFICATES SECTION ===================== */}
      <section
        id="certificates"
        style={{
          padding: '80px 0',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{ marginBottom: '40px' }}>
            <div className="badge badge-gold" style={{ marginBottom: '10px' }}>
              <Award size={13} />
              <span>Verified Credentials</span>
            </div>
            <h2
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
              }}
            >
              Certificates & Achievements
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Verified competitive achievements and programming credentials.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {(certificates.length > 0 ? certificates : [
              {
                id: 'cert_python',
                title: 'Python Programming',
                issuer: 'Verified Competency Provider',
                issue_date: 'Nov 2024',
                credential_id: 'PY-2024-ELG',
                skills_verified: 'Python, Algorithms, Data Structures',
              },
              {
                id: 'cert_sih',
                title: 'Smart India Hackathon Finalist',
                issuer: 'Government of India / AICTE',
                issue_date: '2024',
                credential_id: 'SIH-2024-NEV',
                skills_verified: 'Web Engineering, Hackathon Innovation',
              },
            ]).map((cert: any) => (
              <div
                key={cert.id}
                className="glass-panel"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(251, 191, 36, 0.12)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-gold)',
                    }}
                  >
                    <Award size={20} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    {cert.issue_date || 'Verified'}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {cert.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {cert.issuer}
                  </div>
                </div>

                {cert.skills_verified && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Competencies:</strong> {cert.skills_verified}
                  </div>
                )}

                {cert.credential_id && (
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>ID: {cert.credential_id}</span>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Verified Record ✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SKILLS SECTION ===================== */}
      <section
        id="skills"
        style={{
          padding: '80px 0',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{ marginBottom: '40px' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '10px' }}>
              <Code2 size={13} />
              <span>Technical Competencies</span>
            </div>
            <h2
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
              }}
            >
              Skills & Technologies
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Core languages, tools, and technical competencies.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {displaySkills.map((sk: any, i: number) => (
              <div
                key={i}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sk.name}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {sk.proficiency}%
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {sk.category}
                </div>
                {/* Progress track */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '9999px',
                    background: 'var(--bg-surface-hover)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${sk.proficiency}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                      borderRadius: '9999px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ABOUT SECTION ===================== */}
      <section
        id="about"
        style={{
          padding: '80px 0',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div
            className="glass-panel"
            style={{
              padding: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            <div>
              <div className="badge badge-gold" style={{ marginBottom: '14px' }}>
                <User size={13} />
                <span>Biography</span>
              </div>
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.02em',
                }}
              >
                About {ownerName}
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.8,
                  marginTop: '16px',
                }}
              >
                {ownerName} is a Computer Science and Engineering student specializing in Artificial Intelligence. Passionate about software architecture, human-centric interface design, and intelligent automation.
              </p>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.8,
                  marginTop: '12px',
                }}
              >
                Participated in the Smart India Hackathon journey with the <strong style={{ color: 'var(--text-primary)' }}>Bharat Yatra</strong> tourism web platform, driving innovative digital solutions for regional exploration and cultural discovery.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '28px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                Verified Highlights
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Smart India Hackathon Participant & Developer (Bharat Yatra platform)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Computer Science & Engineering — Artificial Intelligence Specialization
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-cyan)', marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Full-stack Web Architecture, Modern CSS Design Systems & API Engineering
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CONTACT SECTION ===================== */}
      <section
        id="contact"
        style={{
          padding: '80px 0',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div
            style={{
              maxWidth: '650px',
              margin: '0 auto',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div className="badge badge-cyan">
              <Mail size={13} />
              <span>Get In Touch</span>
            </div>
            <h2
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.02em',
              }}
            >
              Connect With {ownerName}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
              Interested in collaborating, technical inquiries, or discussing projects? Connect through verified channels:
            </p>

            {/* Social Links (only displays verified configured channels) */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                marginTop: '16px',
                justifyContent: 'center',
              }}
            >
              {settings?.github_url && (
                <a
                  href={settings.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ gap: '8px' }}
                >
                  <GithubIcon size={18} />
                  <span>GitHub</span>
                </a>
              )}

              {settings?.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ gap: '8px' }}
                >
                  <LinkedinIcon size={18} />
                  <span>LinkedIn</span>
                </a>
              )}

              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ gap: '8px' }}
                >
                  <InstagramIcon size={18} />
                  <span>Instagram</span>
                </a>
              )}

              {settings?.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="btn-primary"
                  style={{ gap: '8px' }}
                >
                  <Mail size={18} />
                  <span>Send Email</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '40px 0',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <div className="container">
          <p>© {new Date().getFullYear()} {ownerName}. All rights reserved.</p>
          <p style={{ marginTop: '6px', fontSize: '0.78rem' }}>
            Built with modern web standards • Space, Professional & Study themes • Secured by Owner Authentication
          </p>
        </div>
      </footer>

      {/* ===================== PROJECT DETAILS MODAL ===================== */}
      {selectedProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '680px',
              width: '100%',
              padding: '32px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div className="badge badge-gold">
                <span>{selectedProject.verified_dates || 'Verified Project'}</span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  fontSize: '1.2rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {selectedProject.title}
            </h3>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '16px' }}>
              {selectedProject.description}
            </p>

            <div style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Technologies Used:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {selectedProject.tech_stack.split(',').map((t: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '14px' }}>
              <button onClick={() => setSelectedProject(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
