'use client';

import React, { useEffect, useRef } from 'react';

interface ThemeBackgroundProps {
  theme: 'space' | 'professional' | 'study';
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  depth: 'fg' | 'mg' | 'bg';
  speedY: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayOffset: number;
  opacity: number;
  isCrystal: boolean;
  branchCount: number;
}

export default function ThemeBackground({ theme }: ThemeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ================= 1. REALISTIC VISIBLE SNOWFLAKES FOR PROFESSIONAL THEME =================
    // Varied sizes (1.6px to 6.8px), 3 depth tiers, realistic dendritic crystals, frosted contrast
    const snowCount = Math.min(160, Math.max(90, Math.floor(width / 11)));
    const snowflakes: Snowflake[] = Array.from({ length: snowCount }, (_, i) => {
      const tier: 'fg' | 'mg' | 'bg' = i % 4 === 0 ? 'fg' : i % 2 === 0 ? 'mg' : 'bg';
      const radius =
        tier === 'fg'
          ? Math.random() * 2.6 + 3.8 // Foreground: 3.8px - 6.4px (clearly visible!)
          : tier === 'mg'
          ? Math.random() * 1.5 + 2.2 // Midground: 2.2px - 3.7px
          : Math.random() * 1.1 + 1.4; // Background: 1.4px - 2.5px

      const speedY =
        tier === 'fg'
          ? Math.random() * 1.2 + 1.6 // Noticeable gentle snowfall
          : tier === 'mg'
          ? Math.random() * 0.8 + 1.0
          : Math.random() * 0.5 + 0.6;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        depth: tier,
        speedY,
        swaySpeed: Math.random() * 0.003 + 0.0018,
        swayAmplitude: tier === 'fg' ? Math.random() * 2.2 + 1.4 : Math.random() * 1.4 + 0.7,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: tier === 'fg' ? 0.96 : tier === 'mg' ? 0.86 : 0.72,
        isCrystal: i % 5 === 0, // 20% are 6-point dendritic crystals
        branchCount: 6,
      };
    });

    // ================= 2. COSMIC PARTICLES FOR SPACE THEME =================
    const spaceCount = Math.min(150, Math.floor(width / 9));
    const spaceStars = Array.from({ length: spaceCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.4 + 0.8,
      speedX: (Math.random() - 0.5) * 0.28,
      speedY: (Math.random() - 0.5) * 0.28,
      opacity: Math.random() * 0.7 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.45 ? '#e0f2fe' : Math.random() > 0.5 ? '#a855f7' : '#00f0ff',
    }));

    // ================= 3. WARM LIBRARY SUNBEAM MOTES FOR STUDY THEME =================
    const studyCount = Math.min(55, Math.floor(width / 24));
    const studyMotes = Array.from({ length: studyCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3.4 + 1.8,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: -(Math.random() * 0.38 + 0.16), // Floating gently upward in library sunbeam
      opacity: Math.random() * 0.5 + 0.25,
      pulseSpeed: Math.random() * 0.015 + 0.006,
    }));

    let isDocumentVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // ─── 1. PROFESSIONAL THEME: CONTINUOUS REALISTIC HIGH-VISIBILITY SNOWFALL ───
      if (theme === 'professional') {
        const now = Date.now();

        for (let i = 0; i < snowflakes.length; i++) {
          const flake = snowflakes[i];

          if (!prefersReducedMotion) {
            flake.y += flake.speedY;
            flake.x += Math.sin(now * flake.swaySpeed + flake.swayOffset) * flake.swayAmplitude;

            // Continuous seamless top-to-bottom wrap-around
            if (flake.y > height + 20) {
              flake.y = -18;
              flake.x = Math.random() * width;
            }
            if (flake.x < -20) flake.x = width + 20;
            if (flake.x > width + 20) flake.x = -20;
          }

          ctx.save();

          if (flake.isCrystal && flake.radius > 2.8) {
            // Realistic 6-Point Dendritic Snowflake Crystal
            ctx.translate(flake.x, flake.y);

            // Frosted cerulean shadow so snow crystal pops against white
            ctx.shadowColor = 'rgba(40, 85, 145, 0.48)';
            ctx.shadowBlur = 5;

            // Main 6 branches with dendritic ticks
            ctx.strokeStyle = `rgba(75, 120, 180, ${flake.opacity})`;
            ctx.lineWidth = flake.depth === 'fg' ? 1.4 : 1.1;

            const armLen = flake.radius * 1.5;
            for (let a = 0; a < 3; a++) {
              ctx.rotate(Math.PI / 3);
              ctx.beginPath();
              ctx.moveTo(-armLen, 0);
              ctx.lineTo(armLen, 0);
              ctx.stroke();

              // Side branch ticks
              const tickOffset = armLen * 0.55;
              const tickLen = armLen * 0.35;
              ctx.beginPath();
              ctx.moveTo(tickOffset, 0);
              ctx.lineTo(tickOffset + tickLen * 0.6, tickLen * 0.7);
              ctx.moveTo(tickOffset, 0);
              ctx.lineTo(tickOffset + tickLen * 0.6, -tickLen * 0.7);

              ctx.moveTo(-tickOffset, 0);
              ctx.lineTo(-tickOffset - tickLen * 0.6, tickLen * 0.7);
              ctx.moveTo(-tickOffset, 0);
              ctx.lineTo(-tickOffset - tickLen * 0.6, -tickLen * 0.7);
              ctx.stroke();
            }

            // Opaque snowy center core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, flake.radius * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Fluffy circular snowflake with frosted contrast on clean white
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);

            // Soft slate-blue shadow for crisp contrast against white
            ctx.shadowColor = 'rgba(50, 95, 155, 0.42)';
            ctx.shadowBlur = flake.depth === 'fg' ? 6 : 4;

            // Gradient: pure snowy white center, frosted light ice-blue edge
            const grad = ctx.createRadialGradient(
              flake.x - flake.radius * 0.25,
              flake.y - flake.radius * 0.25,
              flake.radius * 0.15,
              flake.x,
              flake.y,
              flake.radius
            );
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.65, 'rgba(242, 248, 255, 0.98)');
            grad.addColorStop(1, `rgba(165, 195, 225, ${flake.opacity})`);

            ctx.fillStyle = grad;
            ctx.fill();

            // Crisp outer frosted ice boundary rim for 100% visible definition
            ctx.strokeStyle = `rgba(95, 140, 190, ${flake.opacity * 0.68})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // ─── 2. SPACE THEME: ACTIVE TWINKLING STARFIELD ───
      else if (theme === 'space') {
        for (let i = 0; i < spaceStars.length; i++) {
          const p = spaceStars[i];
          if (!prefersReducedMotion) {
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
          }

          p.opacity += Math.sin(Date.now() * p.pulseSpeed) * 0.009;
          const clampedOpacity = Math.max(0.25, Math.min(0.98, p.opacity));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle =
            p.color === '#e0f2fe'
              ? `rgba(224, 242, 254, ${clampedOpacity})`
              : p.color === '#00f0ff'
              ? `rgba(0, 240, 255, ${clampedOpacity * 0.92})`
              : `rgba(168, 85, 247, ${clampedOpacity * 0.85})`;

          if (p.size > 1.8) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        }
      }

      // ─── 3. STUDY THEME: WARM FLOATING LIBRARY SUNBEAM MOTES ───
      else if (theme === 'study') {
        ctx.shadowBlur = 0;
        for (let i = 0; i < studyMotes.length; i++) {
          const m = studyMotes[i];
          if (!prefersReducedMotion) {
            m.x += m.speedX;
            m.y += m.speedY;

            if (m.y < -14) {
              m.y = height + 14;
              m.x = Math.random() * width;
            }
            if (m.x < -14) m.x = width + 14;
            if (m.x > width + 14) m.x = -14;
          }

          m.opacity += Math.sin(Date.now() * m.pulseSpeed) * 0.006;
          const clampedOpacity = Math.max(0.2, Math.min(0.6, m.opacity));

          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx.shadowColor = 'rgba(217, 119, 6, 0.4)';
          ctx.shadowBlur = 6;
          ctx.fillStyle = `rgba(180, 83, 9, ${clampedOpacity})`;
          ctx.fill();
        }
      }

      if (isDocumentVisible && !prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1, // Behind page content (which is zIndex: 10)
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ─── THEME 1: SPACE COSMIC BACKDROP GLOW (MATCHING REFERENCE CINEMATIC NEBULA) ─── */}
      {theme === 'space' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          {/* Deep Space Black/Navy Base Layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 50%, #030822 0%, #020514 55%, #010208 100%)',
            }}
          />

          {/* Top-Left: Vibrant Cyan & Royal Blue Cosmic Gas Cloud */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-8%',
              width: '850px',
              height: '750px',
              borderRadius: '50%',
              background:
                'radial-gradient(ellipse at 35% 35%, rgba(2, 132, 199, 0.32) 0%, rgba(56, 189, 248, 0.18) 32%, rgba(30, 58, 138, 0.10) 58%, transparent 75%)',
              filter: 'blur(75px)',
            }}
          />

          {/* Bottom-Right & Center: Sweeping Magenta, Violet & Crimson Cosmic Nebula Belt */}
          <div
            style={{
              position: 'absolute',
              bottom: '-12%',
              right: '-10%',
              width: '950px',
              height: '850px',
              borderRadius: '50%',
              background:
                'radial-gradient(ellipse at 65% 65%, rgba(217, 70, 239, 0.34) 0%, rgba(168, 85, 247, 0.24) 30%, rgba(225, 29, 72, 0.15) 52%, transparent 75%)',
              filter: 'blur(80px)',
            }}
          />

          {/* Bottom-Left: Fiery Amber / Radiant Orange Stardust Cloud */}
          <div
            style={{
              position: 'absolute',
              bottom: '-15%',
              left: '12%',
              width: '780px',
              height: '680px',
              borderRadius: '50%',
              background:
                'radial-gradient(ellipse at 40% 70%, rgba(249, 115, 22, 0.28) 0%, rgba(236, 72, 153, 0.18) 35%, rgba(147, 51, 234, 0.08) 60%, transparent 75%)',
              filter: 'blur(75px)',
            }}
          />

          {/* Center Solar Glow Halo: Warm Amber Aura behind central Sun */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '620px',
              height: '620px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(234, 88, 12, 0.09) 35%, rgba(67, 56, 202, 0.04) 60%, transparent 75%)',
              filter: 'blur(60px)',
            }}
          />
        </div>
      )}

      {/* ─── THEME 2: PROFESSIONAL CLEAN WHITE CANVAS WITH SUBTLE FROSTED HORIZON ─── */}
      {theme === 'professional' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          {/* Subtle soft cool gradient base so pure white snow and cards stand out */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, #f3f6fa 0%, #f7f9fc 45%, #ffffff 100%)',
            }}
          />
          {/* Soft winter ambient light from top right */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '5%',
              width: '700px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at top right, rgba(2, 132, 199, 0.065) 0%, transparent 65%)',
              filter: 'blur(70px)',
            }}
          />
        </div>
      )}

      {/* ─── THEME 3: STUDY RICH WARM CREAM/BEIGE PARCHMENT & LIBRARY DESK ATMOSPHERE ─── */}
      {theme === 'study' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          {/* Solid rich warm cream / parchment base layer (NEVER WHITE!) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(145deg, #f5ebd8 0%, #ede1cb 40%, #e3d3b7 100%)',
            }}
          />
          {/* Vintage Brass Study Lamp Ambient Glow from Top-Left */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              left: '-12%',
              width: '850px',
              height: '850px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 35%, rgba(245, 185, 75, 0.42) 0%, rgba(225, 145, 45, 0.22) 45%, transparent 75%)',
              filter: 'blur(80px)',
            }}
          />
          {/* Warm Oak Library Ambient Tone at Bottom-Right */}
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: '800px',
              height: '800px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 65% 65%, rgba(215, 165, 95, 0.32) 0%, rgba(180, 125, 65, 0.16) 50%, transparent 75%)',
              filter: 'blur(85px)',
            }}
          />
          {/* Fine library laid parchment ruled texture */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(rgba(150, 90, 25, 0.12) 1.2px, transparent 1.2px)',
              backgroundSize: '32px 32px',
              opacity: 0.85,
            }}
          />
        </div>
      )}

      {/* High-visibility Snowfall / Cosmic Stars / Study Motes Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
