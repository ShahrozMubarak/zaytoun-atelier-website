import { useRef, useEffect } from 'react';
import { isReducedMotionPreferred } from '../config/animations';

/**
 * useMagnetic - Little Motion Experiment 002: Magnetic Attraction
 * Gently pulls the button towards the cursor on hover and springs back smoothly on leave.
 */
export function useMagnetic(intensity = 0.22) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isReducedMotionPreferred()) return;

    // Only apply on fine pointer devices (desktop mice / trackpads)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease';

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * intensity;
      const y = (e.clientY - (rect.top + rect.height / 2)) * intensity;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = 'translate3d(0px, 0px, 0px)';
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return ref;
}

export default useMagnetic;
