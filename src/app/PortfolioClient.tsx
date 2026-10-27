'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import ThemeBackground from '@/components/ThemeBackground';
import CustomCursor, { CursorStyle } from '@/components/CustomCursor';
import PortfolioSections from '@/components/PortfolioSections';

const SpaceSolarSystem = dynamic(() => import('@/components/SpaceSolarSystem'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 50%, #060d26 0%, #02040d 100%)',
        color: '#38bdf8',
        gap: '16px',
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: '3px solid rgba(56, 189, 248, 0.25)',
          borderTopColor: '#38bdf8',
          animation: 'spin 1s linear infinite',
        }}
      />
      <div style={{ fontSize: '0.92rem', fontWeight: 600, letterSpacing: '0.04em' }}>
        Entering Elgin&apos;s Solar System…
      </div>
    </div>
  ),
});
const IrisAssistant = dynamic(() => import('@/components/IrisAssistant'), { ssr: false });

interface PortfolioClientProps {
  initialSettings: any;
  projects: any[];
  skills: any[];
  education: any[];
  certificates: any[];
}

export default function PortfolioClient({
  initialSettings,
  projects,
  skills,
  education,
  certificates,
}: PortfolioClientProps) {
  const [theme, setTheme] = useState<'space' | 'professional' | 'study'>(
    (initialSettings?.default_theme as any) || 'space'
  );
  const [cursor, setCursor] = useState<CursorStyle>(
    (initialSettings?.selected_cursor as CursorStyle) || 'cosmic'
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  // Sync theme and cursor on initial client mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('elgin_theme') as any;
      const activeTheme = (savedTheme && ['space', 'professional', 'study'].includes(savedTheme)) ? savedTheme : theme;
      setTheme(activeTheme);
      document.documentElement.setAttribute('data-theme', activeTheme);
      document.body.setAttribute('data-theme', activeTheme);

      const savedCursor = localStorage.getItem('elgin_cursor') as any;
      if (savedCursor && ['minimal', 'cosmic', 'precision', 'aura', 'glass', 'pointer'].includes(savedCursor)) {
        setCursor(savedCursor);
      }
    } catch {
      // Fallback for restricted storage environments
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
  }, []); // Run once on client mount

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setIsScrolledPastHero(true);
      } else {
        setIsScrolledPastHero(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleThemeChange = (newTheme: 'space' | 'professional' | 'study') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('elgin_theme', newTheme);
    } catch {}
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const handleCursorChange = (newCursor: CursorStyle) => {
    setCursor(newCursor);
    try {
      localStorage.setItem('elgin_cursor', newCursor);
    } catch {}
  };

  const handleSelectCelestialNode = (category: string) => {
    setActiveCategory(category);
    if (category === 'bharat-yatra' || category === 'projects') {
      const el = document.getElementById('projects');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (category === 'skills') {
      const el = document.getElementById('skills');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (category === 'certificates') {
      const el = document.getElementById('certificates');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (category === 'about' || category === 'journey') {
      const el = document.getElementById('about');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (category === 'contact') {
      const el = document.getElementById('contact');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bharatYatra = projects.find((p) => p.slug === 'bharat-yatra') || projects[0];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Dynamic Animated Canvas for the Selected Theme */}
      <ThemeBackground theme={theme} />

      {/* Hardware-accelerated Desktop Custom Cursor */}
      <CustomCursor styleType={cursor} />

      {/* Navigation Bar: Permanently accessible across all themes with theme selector */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5000,
          pointerEvents: 'auto',
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        <Navbar
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          currentCursor={cursor}
          onCursorChange={handleCursorChange}
          ownerName={initialSettings?.owner_name || 'Elgin'}
          logoUrl={initialSettings?.logo_url}
        />
      </div>

      <main>
        {/* If Space Theme: Display the exact reference-matched Space Solar System scene */}
        {theme === 'space' && (
          <section
            id="home"
            style={{
              position: 'relative',
              width: '100%',
              height: '100vh',
              minHeight: '740px',
              overflow: 'hidden',
              background: 'transparent',
            }}
          >
            <SpaceSolarSystem
              onSelectCategory={handleSelectCelestialNode}
              activeCategory={activeCategory}
              bharatYatraProject={bharatYatra}
              projects={projects}
              certificates={certificates}
              skills={skills}
              ownerName={initialSettings?.owner_name || 'Elgin'}
              currentTheme={theme}
              onThemeChange={handleThemeChange}
            />
          </section>
        )}

        {/* Unified Portfolio Content Sections (Projects, Certificates, Skills, Journey/About, Contact) */}
        <PortfolioSections
          theme={theme}
          projects={projects}
          skills={skills}
          education={education}
          certificates={certificates}
          settings={initialSettings}
        />
      </main>

      {/* Iris Mascot Widget & Safe Dual-Personality AI Chat - Always active and accessible */}
      <IrisAssistant
        theme={theme}
        irisDisplayName={initialSettings?.iris_name || 'Iris'}
        ownerName={initialSettings?.owner_name || 'Elgin'}
        hideFloatingTrigger={false}
      />
    </div>
  );
}
