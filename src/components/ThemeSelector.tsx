'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Eye, Rocket, Briefcase, BookOpen, Check } from 'lucide-react';
import { CursorStyle } from './CustomCursor';

interface ThemeSelectorProps {
  currentTheme: 'space' | 'professional' | 'study';
  onThemeChange: (theme: 'space' | 'professional' | 'study') => void;
  currentCursor: CursorStyle;
  onCursorChange: (cursor: CursorStyle) => void;
}

export default function ThemeSelector({
  currentTheme,
  onThemeChange,
  currentCursor,
  onCursorChange,
}: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const themes: { id: 'space' | 'professional' | 'study'; label: string; icon: any; desc: string }[] = [
    { id: 'space', label: 'Space', icon: Rocket, desc: 'Interactive 3D solar system' },
    { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Clean recruiter white & snowfall' },
    { id: 'study', label: 'Study', icon: BookOpen, desc: 'Warm cream glassmorphic workspace' },
  ];

  const cursors: { id: CursorStyle; label: string }[] = [
    { id: 'minimal', label: 'Minimal Dot' },
    { id: 'cosmic', label: 'Cosmic Star' },
    { id: 'precision', label: 'Dev Crosshair' },
    { id: 'aura', label: 'Aura Glow' },
    { id: 'glass', label: 'Glass Lens' },
    { id: 'pointer', label: 'Sleek Pointer' },
  ];

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-card)',
          transition: 'var(--transition-smooth)',
        }}
      >
        <Eye size={15} style={{ color: 'var(--accent-cyan)' }} />
        <span>Change View</span>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--accent-gold)',
            textTransform: 'capitalize',
          }}
        >
          {currentTheme}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '290px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-active)',
            boxShadow: 'var(--shadow-card), var(--border-glow)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Select Theme
            </span>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {themes.map((t) => {
                const IconComponent = t.icon;
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onThemeChange(t.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--border-active)' : '1px solid transparent',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <IconComponent size={16} style={{ color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {t.label}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                      </div>
                    </div>
                    {isSelected && <Check size={14} style={{ color: 'var(--accent-cyan)' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cursor Style
            </span>
            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {cursors.map((c) => {
                const isSelected = currentCursor === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onCursorChange(c.id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-card)',
                      border: isSelected ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.label}</span>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
