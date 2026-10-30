import React, { useRef, useEffect } from 'react';

/**
 * SymbioteButton - Little Motion Exp 003: Symbiote Tether
 * 
 * Recreates the dynamic fluid SVG quadratic bezier tethers stretching and latching
 * to the cursor on proximity, with droplet tracking and organic squash/stretch click animation.
 */
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
  const pathRefs = useRef([]);

  // Determine stroke color based on theme
  const getColors = () => {
    switch (theme) {
      case 'camel':
        return {
          stroke: '#C69F6F',
          droplet: '#C69F6F'
        };
      case 'light':
        return {
          stroke: '#2F4939',
          droplet: '#2F4939'
        };
      case 'dark':
      default:
        return {
          stroke: 'currentColor',
          droplet: 'currentColor'
        };
    }
  };

  const { stroke, droplet } = getColors();

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
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Position droplet
    dot.style.opacity = '1';
    dot.style.left = `${x - 7}px`;
    dot.style.top = `${y - 7}px`;

    // Dynamic bezier curves extending from center of button to pointer
    const spacing = Math.min(35, rect.width * 0.25);
    pathRefs.current.forEach((path, i) => {
      if (path) {
        const offset = (i - 1) * spacing;
        const curveY = (i - 1) * 16;
        path.setAttribute(
          'd',
          `M${cx + offset} ${cy} Q${cx + (x - cx) * 0.6} ${cy + curveY} ${x} ${y}`
        );
      }
    });

    // Magnetic button translation
    button.style.transform = `translate(${(x - cx) * 0.08}px, ${(y - cy) * 0.08}px)`;
  };

  const handlePointerLeave = () => {
    const button = buttonRef.current;
    const dot = dropletRef.current;
    if (dot) dot.style.opacity = '0';
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
            { transform: 'scale(1.15, 0.8)' },
            { transform: 'scale(0.94, 1.12)' },
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
      {/* SVG Tendril Threads */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
        style={{ color: stroke }}
      >
        <path
          ref={(el) => (pathRefs.current[0] = el)}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          className="opacity-70 dark:opacity-85"
        />
        <path
          ref={(el) => (pathRefs.current[1] = el)}
          stroke="currentColor"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          className="opacity-90 dark:opacity-100"
        />
        <path
          ref={(el) => (pathRefs.current[2] = el)}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          className="opacity-60 dark:opacity-75"
        />
      </svg>

      {/* Floating Symbiote Cursor Droplet */}
      <div
        ref={dropletRef}
        className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 transition-opacity duration-200 z-30 rounded-[55%_45%_60%_40%]"
        style={{
          backgroundColor: droplet === 'currentColor' ? 'black' : droplet,
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
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
