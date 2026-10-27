'use client';

import React, { useEffect, useState, useRef } from 'react';

export type CursorStyle = 'minimal' | 'cosmic' | 'precision' | 'aura' | 'glass' | 'pointer';

interface CustomCursorProps {
  styleType: CursorStyle;
}

export default function CustomCursor({ styleType }: CustomCursorProps) {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isPointerFine = useRef(false);

  useEffect(() => {
    // Only enable on desktop pointer devices with motion allowed
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isFine || prefersReducedMotion) {
      return;
    }

    isPointerFine.current = true;
    setMounted(true);
    document.body.classList.add('cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      setVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('a, button, input, textarea, select, [role="button"]');
        setIsHovered(!!interactive);
      }
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let frameId: number;
    const animate = () => {
      // Smooth lerp for outer ring/follower
      const lerpSpeed = styleType === 'minimal' ? 0.35 : styleType === 'aura' ? 0.14 : 0.22;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpSpeed;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpSpeed;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(frameId);
    };
  }, [styleType]);

  if (!mounted || !visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999999,
        overflow: 'hidden',
      }}
    >
      {/* 1. MINIMAL DOT STYLE */}
      {styleType === 'minimal' && (
        <>
          <div
            ref={dotRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '8px',
              height: '8px',
              marginLeft: '-4px',
              marginTop: '-4px',
              borderRadius: '50%',
              backgroundColor: isHovered ? 'var(--accent-cyan)' : 'var(--text-primary)',
              boxShadow: '0 0 6px rgba(0, 0, 0, 0.3)',
              transition: 'background-color 0.15s ease, transform 0.05s linear',
            }}
          />
          <div
            ref={ringRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: isHovered ? '32px' : '20px',
              height: isHovered ? '32px' : '20px',
              marginLeft: isHovered ? '-16px' : '-10px',
              marginTop: isHovered ? '-16px' : '-10px',
              borderRadius: '50%',
              border: '1.5px solid var(--accent-cyan)',
              opacity: isHovered ? 0.8 : 0.35,
              transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease, opacity 0.2s ease',
            }}
          />
        </>
      )}

      {/* 2. COSMIC STAR STYLE */}
      {styleType === 'cosmic' && (
        <>
          <div
            ref={dotRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '12px',
              height: '12px',
              marginLeft: '-6px',
              marginTop: '-6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 4-point cross star */}
            <div
              style={{
                position: 'absolute',
                width: '10px',
                height: '2px',
                background: '#00f0ff',
                boxShadow: '0 0 8px #00f0ff',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '2px',
                height: '10px',
                background: '#00f0ff',
                boxShadow: '0 0 8px #00f0ff',
              }}
            />
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 0 6px #ffffff',
              }}
            />
          </div>
          <div
            ref={ringRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: isHovered ? '44px' : '28px',
              height: isHovered ? '44px' : '28px',
              marginLeft: isHovered ? '-22px' : '-14px',
              marginTop: isHovered ? '-22px' : '-14px',
              borderRadius: '50%',
              border: '1px dashed #00f0ff',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 75%)',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.35)',
              transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease',
            }}
          />
        </>
      )}

      {/* 3. PRECISION GEOMETRIC RETICLE */}
      {styleType === 'precision' && (
        <>
          <div
            ref={dotRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '4px',
              marginLeft: '-2px',
              marginTop: '-2px',
              backgroundColor: '#f59e0b',
              borderRadius: '1px',
              boxShadow: '0 0 8px #f59e0b',
            }}
          />
          <div
            ref={ringRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: isHovered ? '34px' : '24px',
              height: isHovered ? '34px' : '24px',
              marginLeft: isHovered ? '-17px' : '-12px',
              marginTop: isHovered ? '-17px' : '-12px',
              border: '1px solid #f59e0b',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.35)',
              borderRadius: '3px',
              transform: 'rotate(45deg)',
              transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease',
            }}
          />
        </>
      )}

      {/* 4. SOFT GLOWING AURA */}
      {styleType === 'aura' && (
        <>
          <div
            ref={dotRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '6px',
              marginLeft: '-3px',
              marginTop: '-3px',
              borderRadius: '50%',
              backgroundColor: '#a855f7',
              boxShadow: '0 0 10px #a855f7',
            }}
          />
          <div
            ref={ringRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: isHovered ? '56px' : '40px',
              height: isHovered ? '56px' : '40px',
              marginLeft: isHovered ? '-28px' : '-20px',
              marginTop: isHovered ? '-28px' : '-20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(0, 240, 255, 0.15) 60%, transparent 80%)',
              filter: 'blur(3px)',
              boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)',
              transition: 'width 0.25s ease, height 0.25s ease, margin 0.25s ease',
            }}
          />
        </>
      )}

      {/* 5. GLASS LENS */}
      {styleType === 'glass' && (
        <>
          <div
            ref={dotRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '4px',
              marginLeft: '-2px',
              marginTop: '-2px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
            }}
          />
          <div
            ref={ringRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: isHovered ? '46px' : '32px',
              height: isHovered ? '46px' : '32px',
              marginLeft: isHovered ? '-23px' : '-16px',
              marginTop: isHovered ? '-23px' : '-16px',
              borderRadius: '50%',
              border: '1.5px solid rgba(56, 189, 248, 0.65)',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15), inset 0 0 8px rgba(255, 255, 255, 0.3)',
              transition: 'width 0.2s ease, height 0.2s ease, margin 0.2s ease',
            }}
          />
        </>
      )}

      {/* 6. MODERN SLEEK POINTER */}
      {styleType === 'pointer' && (
        <div
          ref={dotRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '24px',
            height: '24px',
            transformOrigin: 'top left',
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              fill: isHovered ? 'var(--accent-cyan)' : 'var(--bg-surface)',
              transition: 'fill 0.15s ease',
            }}
          >
            <polygon points="3 3 10 21 13 13 21 10 3 3" />
          </svg>
        </div>
      )}
    </div>
  );
}
