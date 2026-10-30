import React, { useRef } from 'react';

/**
 * SymbioteButton - Little Motion Exp 003: Ultra-Sophisticated Venom Tether
 * 
 * Recreates the organic venom/symbiote attaching animation:
 * - 16 liquid tendril strings stretching from button perimeter to pointer
 * - Deep obsidian/pitch black venom strings are the core foundation
 * - Interwoven with fine atelier camel silk filaments (#C69F6F)
 * - Finished with a rare royal sapphire specular filament (#2563EB)
 * - Multi-stage cubic Bezier curves with organic inertia and fluid wave harmonics
 * - 4 floating satellite liquid beads tracking along tension vectors
 * - Viscous squash & stretch physics on click
 */
const VENOM_TENDRILS = [
  // 1. Muscular Core Venom Trunk (Deep Pitch Black)
  { id: 'core-trunk', strokeWidth: 5.0, opacity: 1.0, anchorRatioX: 0.50, anchorOffsetY: 0, cp1Ratio: 0.28, cp1OffY: -4, cp2Ratio: 0.72, cp2OffY: 6, color: '#09090B' },
  
  // 2. Upper Muscular Branch (Deep Obsidian Black)
  { id: 'up-muscle-1', strokeWidth: 3.6, opacity: 0.92, anchorRatioX: 0.38, anchorOffsetY: -10, cp1Ratio: 0.25, cp1OffY: -18, cp2Ratio: 0.68, cp2OffY: -12, color: '#0B0B0E' },
  
  // 3. Upper Secondary Branch (Pitch Black)
  { id: 'up-muscle-2', strokeWidth: 2.6, opacity: 0.85, anchorRatioX: 0.64, anchorOffsetY: -8, cp1Ratio: 0.32, cp1OffY: -28, cp2Ratio: 0.74, cp2OffY: -20, color: '#121216' },
  
  // 4. Upper Tensile String (Charcoal Obsidian)
  { id: 'up-tensile-1', strokeWidth: 1.9, opacity: 0.78, anchorRatioX: 0.24, anchorOffsetY: -12, cp1Ratio: 0.20, cp1OffY: -36, cp2Ratio: 0.62, cp2OffY: -26, color: '#1A1A20' },
  
  // 5. Upper Whisker Thread (Fine Black Filament)
  { id: 'up-whisker-1', strokeWidth: 1.1, opacity: 0.65, anchorRatioX: 0.16, anchorOffsetY: -14, cp1Ratio: 0.18, cp1OffY: -46, cp2Ratio: 0.58, cp2OffY: -34, color: '#27272E' },
  
  // 6. Upper Gossamer Micro-Fiber (Fluid Black)
  { id: 'up-micro-1', strokeWidth: 0.75, opacity: 0.55, anchorRatioX: 0.76, anchorOffsetY: -11, cp1Ratio: 0.35, cp1OffY: -40, cp2Ratio: 0.80, cp2OffY: -18, color: '#3F3F46' },
  
  // 7. Lower Muscular Branch (Deep Obsidian Black)
  { id: 'dn-muscle-1', strokeWidth: 3.8, opacity: 0.92, anchorRatioX: 0.42, anchorOffsetY: 10, cp1Ratio: 0.26, cp1OffY: 20, cp2Ratio: 0.70, cp2OffY: 14, color: '#0B0B0E' },
  
  // 8. Lower Secondary Branch (Pitch Black)
  { id: 'dn-muscle-2', strokeWidth: 2.7, opacity: 0.85, anchorRatioX: 0.70, anchorOffsetY: 8, cp1Ratio: 0.34, cp1OffY: 30, cp2Ratio: 0.76, cp2OffY: 22, color: '#121216' },
  
  // 9. Lower Tensile String (Charcoal Obsidian)
  { id: 'dn-tensile-1', strokeWidth: 2.0, opacity: 0.78, anchorRatioX: 0.82, anchorOffsetY: 12, cp1Ratio: 0.22, cp1OffY: 38, cp2Ratio: 0.64, cp2OffY: 28, color: '#1A1A20' },
  
  // 10. Lower Whisker Thread (Fine Black Filament)
  { id: 'dn-whisker-1', strokeWidth: 1.2, opacity: 0.65, anchorRatioX: 0.88, anchorOffsetY: 14, cp1Ratio: 0.18, cp1OffY: 48, cp2Ratio: 0.60, cp2OffY: 36, color: '#27272E' },
  
  // 11. Lower Gossamer Micro-Fiber (Fluid Black)
  { id: 'dn-micro-1', strokeWidth: 0.75, opacity: 0.55, anchorRatioX: 0.28, anchorOffsetY: 11, cp1Ratio: 0.36, cp1OffY: 42, cp2Ratio: 0.82, cp2OffY: 20, color: '#3F3F46' },
  
  // 12. Mid-Body Lateral Tendril (Viscous Black Webbing)
  { id: 'mid-lateral-1', strokeWidth: 1.4, opacity: 0.70, anchorRatioX: 0.48, anchorOffsetY: -3, cp1Ratio: 0.40, cp1OffY: -14, cp2Ratio: 0.65, cp2OffY: 10, color: '#18181D' },
  
  // 13. Mid-Body Lateral Tendril (Viscous Black Webbing)
  { id: 'mid-lateral-2', strokeWidth: 1.4, opacity: 0.70, anchorRatioX: 0.54, anchorOffsetY: 3, cp1Ratio: 0.38, cp1OffY: 14, cp2Ratio: 0.66, cp2OffY: -10, color: '#18181D' },
  
  // 14. Primary Camel Silk Thread (Atelier Heritage Woven Thread)
  { id: 'camel-silk-primary', strokeWidth: 1.5, opacity: 0.88, anchorRatioX: 0.32, anchorOffsetY: 5, cp1Ratio: 0.30, cp1OffY: -12, cp2Ratio: 0.70, cp2OffY: 8, color: '#C69F6F' },
  
  // 15. Secondary Camel Silk Filament (Subtle Warm Luxury Accent)
  { id: 'camel-silk-secondary', strokeWidth: 0.9, opacity: 0.75, anchorRatioX: 0.62, anchorOffsetY: -6, cp1Ratio: 0.35, cp1OffY: 16, cp2Ratio: 0.75, cp2OffY: -8, color: '#DFBE99' },
  
  // 16. Rare Royal Sapphire Specular Glint (Rare touch of blue reflecting moonlight on black venom)
  { id: 'sapphire-specular', strokeWidth: 1.25, opacity: 0.92, anchorRatioX: 0.56, anchorOffsetY: -2, cp1Ratio: 0.28, cp1OffY: 18, cp2Ratio: 0.74, cp2OffY: -14, color: '#2563EB' }
];

export default function SymbioteButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  containerClassName = '',
  theme = 'dark', // 'dark' | 'camel' | 'light'
  title = '',
  ariaLabel = '',
  id
}) {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const dropletRef = useRef(null);
  const sat1Ref = useRef(null);
  const sat2Ref = useRef(null);
  const sat3Ref = useRef(null);
  const sat4Ref = useRef(null);
  const pathRefs = useRef([]);

  const handlePointerMove = (e) => {
    if (disabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (e.pointerType === 'touch') return;

    const container = containerRef.current;
    const button = buttonRef.current;
    const dot = dropletRef.current;
    if (!container || !button || !dot) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    // Fluid Main Droplet positioning with organic shape
    dot.style.opacity = '1';
    dot.style.left = `${x - 8}px`;
    dot.style.top = `${y - 8}px`;

    // Satellite beads tracking along elastic tension lines
    if (sat1Ref.current) {
      sat1Ref.current.style.opacity = '0.9';
      sat1Ref.current.style.left = `${cx + (x - cx) * 0.42 - 3}px`;
      sat1Ref.current.style.top = `${cy + (y - cy) * 0.42 - 3}px`;
    }
    if (sat2Ref.current) {
      sat2Ref.current.style.opacity = '0.85';
      sat2Ref.current.style.left = `${cx + (x - cx) * 0.68 - 2}px`;
      sat2Ref.current.style.top = `${cy + (y - cy) * 0.68 - 2}px`;
    }
    if (sat3Ref.current) {
      // Camel Silk Satellite Pearl
      sat3Ref.current.style.opacity = '0.9';
      sat3Ref.current.style.left = `${cx + (x - cx) * 0.28 - 2}px`;
      sat3Ref.current.style.top = `${cy + (y - cy) * 0.28 - 2}px`;
    }
    if (sat4Ref.current) {
      // Rare Royal Sapphire Satellite Spark
      sat4Ref.current.style.opacity = '0.95';
      sat4Ref.current.style.left = `${cx + (x - cx) * 0.84 - 1.5}px`;
      sat4Ref.current.style.top = `${cy + (y - cy) * 0.84 - 1.5}px`;
    }

    // Dynamic Cubic Bezier curves for all 16 venom tendrils
    pathRefs.current.forEach((path, i) => {
      if (!path) return;
      const cfg = VENOM_TENDRILS[i];
      if (!cfg) return;

      const startX = w * cfg.anchorRatioX;
      const startY = cy + cfg.anchorOffsetY;

      // Organic Cubic Bezier control points for liquid spring tension
      const cp1X = startX + (x - startX) * cfg.cp1Ratio;
      const cp1Y = startY + (y - startY) * 0.35 + cfg.cp1OffY;

      const cp2X = startX + (x - startX) * cfg.cp2Ratio;
      const cp2Y = startY + (y - startY) * 0.70 + cfg.cp2OffY;

      path.setAttribute(
        'd',
        `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x} ${y}`
      );
    });

    // Magnetic button translation with organic viscous resistance
    button.style.transform = `translate(${(x - cx) * 0.08}px, ${(y - cy) * 0.08}px)`;
  };

  const handlePointerLeave = () => {
    const button = buttonRef.current;
    const dot = dropletRef.current;

    if (dot) dot.style.opacity = '0';
    if (sat1Ref.current) sat1Ref.current.style.opacity = '0';
    if (sat2Ref.current) sat2Ref.current.style.opacity = '0';
    if (sat3Ref.current) sat3Ref.current.style.opacity = '0';
    if (sat4Ref.current) sat4Ref.current.style.opacity = '0';

    pathRefs.current.forEach((p) => {
      if (p) p.setAttribute('d', '');
    });
    if (button) button.style.transform = '';
  };

  const handleClick = (e) => {
    const button = buttonRef.current;
    if (button && !disabled) {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        button.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.18, 0.80)' },
            { transform: 'scale(0.92, 1.15)' },
            { transform: 'scale(1.05, 0.97)' },
            { transform: 'scale(1)' }
          ],
          {
            duration: 650,
            easing: 'cubic-bezier(0.2, 1.6, 0.4, 1)'
          }
        );
      }
    }
    if (onClick) onClick(e);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative inline-flex items-center justify-center isolate overflow-visible select-none ${containerClassName}`}
    >
      {/* Ultra-Sophisticated Multi-Tendril Venom SVG Canvas (16 Organic Tendrils) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
      >
        {VENOM_TENDRILS.map((t, idx) => (
          <path
            key={t.id}
            ref={(el) => (pathRefs.current[idx] = el)}
            stroke={t.color}
            strokeWidth={t.strokeWidth}
            opacity={t.opacity}
            fill="none"
            strokeLinecap="round"
            className="transition-opacity duration-150"
          />
        ))}
      </svg>

      {/* Floating Symbiote Main Cursor Droplet with Obsidian & Sapphire Sheen */}
      <div
        ref={dropletRef}
        className="absolute w-4 h-4 pointer-events-none opacity-0 transition-opacity duration-200 z-30 rounded-[58%_42%_63%_37%]"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #3B82F6 0%, #1D4ED8 18%, #08080B 72%)',
          boxShadow: '0 3px 12px rgba(0,0,0,0.55), 0 0 10px rgba(37,99,235,0.5)'
        }}
      />

      {/* Satellite Fluid Bead 1 (Mid-Flight Obsidian Tension) */}
      <div
        ref={sat1Ref}
        className="absolute w-2 h-2 pointer-events-none opacity-0 transition-opacity duration-200 z-28 rounded-full"
        style={{
          backgroundColor: '#09090B',
          boxShadow: '0 1px 4px rgba(0,0,0,0.5)'
        }}
      />

      {/* Satellite Fluid Bead 2 (Viscous Pitch Black Bead) */}
      <div
        ref={sat2Ref}
        className="absolute w-1.5 h-1.5 pointer-events-none opacity-0 transition-opacity duration-200 z-28 rounded-full"
        style={{
          backgroundColor: '#121216',
          boxShadow: '0 1px 3px rgba(0,0,0,0.45)'
        }}
      />

      {/* Satellite Fluid Bead 3 (Camel Silk Micro-Pearl) */}
      <div
        ref={sat3Ref}
        className="absolute w-1.5 h-1.5 pointer-events-none opacity-0 transition-opacity duration-200 z-28 rounded-full"
        style={{
          backgroundColor: '#C69F6F',
          boxShadow: '0 0 6px rgba(198,159,111,0.6)'
        }}
      />

      {/* Satellite Fluid Bead 4 (Rare Royal Sapphire Spark) */}
      <div
        ref={sat4Ref}
        className="absolute w-1.5 h-1.5 pointer-events-none opacity-0 transition-opacity duration-200 z-28 rounded-full"
        style={{
          backgroundColor: '#2563EB',
          boxShadow: '0 0 7px rgba(37,99,235,0.75)'
        }}
      />

      {/* Button */}
      <button
        ref={buttonRef}
        type={type}
        id={id}
        disabled={disabled}
        onClick={handleClick}
        title={title}
        aria-label={ariaLabel || title}
        className={`relative z-10 transition-[background-color,border-color,color,box-shadow] duration-200 cursor-pointer disabled:cursor-not-allowed ${className}`}
      >
        {children}
      </button>
    </div>
  );
}
