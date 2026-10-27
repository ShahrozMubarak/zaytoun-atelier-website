/**
 * Central Animation Configuration for ZAYTOUN & CO.
 * Tweak all durations, easings, curves, and staggered offsets in one single location.
 */

export const ANIMATION_CONFIG = {
  // Timing Durations (in seconds)
  durations: {
    instant: 0.15,
    fast: 0.25,
    normal: 0.45,
    slow: 0.75,
    editorial: 1.1,
    preloader: 1.4,
  },

  // Easing Bezier Curves
  easings: {
    // High-end luxury smooth ease-out
    luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // Balanced UI transition
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    // Snappy entrance
    expoOut: 'cubic-bezier(0.19, 1, 0.22, 1)',
    // Magnetic pull & bounce
    magnetic: 'cubic-bezier(0.33, 1, 0.68, 1)',
    // Gentle hover float
    hover: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Scroll Reveal Settings
  scrollReveal: {
    threshold: 0.15,
    distanceY: '32px',
    duration: 0.7,
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    staggerDelay: 0.08,
  },

  // 3D Model Scroll Scrub Thresholds
  modelScrub: {
    scrollRange: 1400, // px of scroll range for feature tour
    steps: [
      { progress: 0.0, orbit: '0deg 75deg 105%', title: 'Overview', desc: 'Crafted from breathable Belgian linen-cotton twill with organic drape.' },
      { progress: 0.3, orbit: '25deg 65deg 85%', title: 'Hand-Tailored Collar & Sleeve', desc: 'Sculptural puff sleeve silhouette with double-needle reinforcement.' },
      { progress: 0.6, orbit: '180deg 75deg 90%', title: 'Structured Reverse Drape', desc: 'Concealed storm flaps and artisanal horn button fastenings.' },
      { progress: 0.9, orbit: '315deg 80deg 95%', title: 'Hand-Finished Hemline', desc: 'Reinforced bottom seam with blind stitch detailing for longevity.' },
    ]
  }
};

/**
 * Check if the user's OS has requested reduced motion
 */
export function isReducedMotionPreferred() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
