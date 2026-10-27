import React, { useEffect, useState, useRef } from 'react';
import { isReducedMotionPreferred } from '../config/animations';

/**
 * CustomCursor - Luxury dynamic cursor with smooth tracking and bloom effect
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [cursorText, setCursorText] = useState('');
  
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable for pointer:fine devices (desktop mice, trackpads) and when reduced-motion is not requested
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer || isReducedMotionPreferred()) return;

    setEnabled(true);

    const handleMouseMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };

      // Check if target or parent is clickable
      const target = e.target;
      const interactive = target.closest('a, button, input, select, textarea, [role="button"], .cursor-pointer, .interactive-hover');
      
      if (interactive) {
        setIsHovered(true);
        const customText = interactive.getAttribute('data-cursor-text') || '';
        setCursorText(customText);
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => {
      pos.current = { x: -100, y: -100 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    // RAF smooth animation loop for ring lerp
    let animId;
    const render = () => {
      // Lerp ring towards mouse position
      const ease = 0.18;
      ringPos.current.x += (pos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * ease;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* Inner precise dot */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-camel-500 transition-opacity duration-200 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Outer luxury ring / magnetic bloom */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 rounded-full border border-camel-500/70 dark:border-camel-400/80 transition-[width,height,margin,background-color,border-color] duration-300 ease-out flex items-center justify-center backdrop-blur-[0.5px] ${
          isHovered
            ? 'w-14 h-14 -ml-7 -mt-7 bg-camel-500/10 border-camel-500 dark:border-camel-400 scale-100'
            : isClicked
            ? 'w-6 h-6 -ml-3 -mt-3 bg-camel-500/25 border-camel-600'
            : 'w-8 h-8 -ml-4 -mt-4 bg-transparent border-camel-500/40'
        }`}
      >
        {cursorText && (
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-camel-600 dark:text-camel-300">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
