import React, { useState, useEffect } from 'react';

/**
 * ScrollProgressBar - Thin luxury scroll progress bar at the very top of the viewport
 */
export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-olive-700 via-camel-500 to-olive-600 dark:from-camel-400 dark:via-camel-300 dark:to-camel-500 transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(198,159,111,0.6)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
