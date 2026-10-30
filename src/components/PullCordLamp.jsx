import React, { useState } from 'react';

/**
 * PullCordLamp - Little Motion Exp 001: Pull-cord Lamp
 * 
 * Recreates the physical table/atelier lamp with pull cord to toggle Dark/Light mode.
 * Styled in Zaytoun's White, Brass, and Camel luxury palette (#C69F6F, #E6D3B3).
 */
export default function PullCordLamp({
  theme = 'light',
  onToggleTheme,
  className = '',
  compact = false
}) {
  const [isPulling, setIsPulling] = useState(false);
  const isLit = theme !== 'dark';

  const handlePullCord = (e) => {
    e.stopPropagation();
    setIsPulling(true);
    setTimeout(() => setIsPulling(false), 350);

    if (onToggleTheme) {
      onToggleTheme();
    }
  };

  if (compact) {
    // Compact Navbar Edition: Precision 40px luxury icon lamp with pull bead
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none group cursor-pointer ${className}`}
        onClick={handlePullCord}
        title={`Atelier Lamp: Click to switch to ${isLit ? 'Dark' : 'Light'} Mode`}
        aria-label="Toggle Dark or Light Mode with Atelier Lamp"
        role="button"
        tabIndex={0}
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Subtle Ambient Light Glow */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-500 blur-sm pointer-events-none ${
              isLit ? 'bg-[#F2EDCF]/80 dark:bg-transparent scale-125 opacity-90' : 'opacity-0 scale-75'
            }`}
          />

          {/* Precision Mini Lamp SVG */}
          <svg className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
            {/* Lamp Shade (Camel & Brass) */}
            <path
              d="M7 11C7 6.5 9 4 12 4C15 4 17 6.5 17 11H7Z"
              className={isLit ? 'fill-[#C69F6F] stroke-[#8C6A3E]' : 'fill-[#3A332C] stroke-[#5A4E40]'}
              strokeWidth="1.2"
            />
            {/* Shade Lower Rim */}
            <ellipse
              cx="12"
              cy="11"
              rx="5"
              ry="1.2"
              className={isLit ? 'fill-[#FFF6AE]' : 'fill-[#241F1A]'}
            />
            {/* Stem */}
            <line
              x1="12"
              y1="12.2"
              x2="12"
              y2="18.5"
              stroke={isLit ? '#A6865A' : '#71717A'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Base */}
            <ellipse
              cx="12"
              cy="19"
              rx="4"
              ry="1.2"
              className={isLit ? 'fill-[#C69F6F] stroke-[#8C6A3E]' : 'fill-[#241F1A] stroke-[#5A4E40]'}
              strokeWidth="1"
            />
            {/* Hanging Cord Chain & Bead */}
            <g
              className={`transition-transform duration-200 origin-top group-hover:animate-wiggle ${
                isPulling ? 'translate-y-1' : ''
              }`}
            >
              <line
                x1="14.5"
                y1="11.5"
                x2="14.5"
                y2="16.5"
                stroke={isLit ? '#8C6A3E' : '#A1A1AA'}
                strokeWidth="1"
                strokeDasharray="1 1"
              />
              <circle
                cx="14.5"
                cy="17"
                r="1.2"
                className={isLit ? 'fill-[#C69F6F]' : 'fill-[#D4D4D8]'}
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }

  // Full-size interactive Atelier Lamp
  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center p-3 select-none ${className}`}
    >
      <style>{`
        @keyframes cordWiggle {
          20%, 60% { transform: rotate(12deg); }
          40%, 80% { transform: rotate(-12deg); }
        }
        .cord-pull-wiggle:hover {
          animation: cordWiggle 1.4s ease-in-out infinite;
        }
      `}</style>

      <div className="relative w-[130px] h-[155px] flex items-center justify-center">
        {/* Warm Ambient Radial Halo Glow */}
        <div
          className={`absolute top-12 inset-x-0 h-24 rounded-full pointer-events-none transition-opacity duration-500 blur-xl ${
            isLit ? 'opacity-100 bg-[#FFFAB1]/35' : 'opacity-0'
          }`}
        />

        {/* Lamp Shade */}
        <div
          className={`absolute top-4 left-1/2 -translate-x-1/2 w-[86px] h-[52px] rounded-t-[50px] transition-colors duration-500 z-10 shadow-md ${
            isLit
              ? 'bg-gradient-to-r from-[#A6865A] via-[#C69F6F] to-[#8C6A3E]'
              : 'bg-gradient-to-r from-[#241F1A] via-[#3A332C] to-[#1C1814]'
          }`}
        >
          {/* Bottom Rim of Shade */}
          <div
            className={`absolute -bottom-1.5 inset-x-1 h-3 rounded-full transition-colors duration-500 ${
              isLit ? 'bg-[#FFF6AE] shadow-[0_4px_16px_#FFF092]' : 'bg-[#181512]'
            }`}
          />
        </div>

        {/* Lamp Brass Stem */}
        <div
          className={`absolute top-16 left-1/2 -translate-x-1/2 w-2 h-16 rounded-full transition-colors duration-500 ${
            isLit
              ? 'bg-gradient-to-r from-[#8C6A3E] via-[#C69F6F] to-[#6E5330]'
              : 'bg-gradient-to-r from-[#2B2620] via-[#3A332C] to-[#1F1B17]'
          }`}
        />

        {/* Lamp Weighted Circular Base */}
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[76px] h-3.5 rounded-full transition-colors duration-500 shadow-md ${
            isLit
              ? 'bg-gradient-to-b from-[#C69F6F] to-[#8C6A3E]'
              : 'bg-gradient-to-b from-[#3A332C] to-[#1A1613]'
          }`}
        />

        {/* Interactive Hanging Pull-Cord Button */}
        <button
          type="button"
          onClick={handlePullCord}
          aria-label="Toggle dark/light theme with pull cord"
          aria-pressed={isLit}
          className={`cord-pull-wiggle absolute left-[88px] top-[48px] w-7 h-16 bg-transparent p-0 border-0 flex flex-col items-center justify-end z-20 cursor-pointer origin-top transition-all duration-150 active:scale-y-125 focus:outline-none`}
        >
          {/* Vertical Beaded Chain */}
          <div
            className={`w-[1px] h-9 transition-colors duration-300 ${
              isLit ? 'bg-[#8C6A3E]' : 'bg-[#71717A]'
            }`}
            style={{
              backgroundImage: isLit
                ? 'radial-gradient(circle, #C69F6F 1px, transparent 1px)'
                : 'radial-gradient(circle, #A1A1AA 1px, transparent 1px)',
              backgroundSize: '2px 4px'
            }}
          />
          {/* Hanging Brass Acorn Drop Bead */}
          <span
            className={`w-2.5 h-4 rounded-full transition-colors duration-300 shadow-sm ${
              isLit ? 'bg-[#C69F6F] border border-[#8C6A3E]' : 'bg-[#52525B] border border-[#3F3F46]'
            }`}
          />
        </button>
      </div>

      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mt-1">
        {isLit ? 'LIGHT MODE' : 'DARK MODE'} (PULL CORD)
      </span>
    </div>
  );
}
