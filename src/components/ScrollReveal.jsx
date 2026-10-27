import React, { useRef, useEffect, useState } from 'react';
import { isReducedMotionPreferred, ANIMATION_CONFIG } from '../config/animations';

/**
 * ScrollReveal - Smooth viewport reveal container with staggered delays and 15% trigger threshold
 */
export default function ScrollReveal({
  children,
  delay = 0,
  distance = 32,
  duration = 0.75,
  className = "",
  as: Component = "div"
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isReducedMotionPreferred()) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: ANIMATION_CONFIG.scrollReveal.threshold || 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const el = ref.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  const style = isReducedMotionPreferred()
    ? {}
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'opacity, transform'
      };

  return (
    <Component ref={ref} className={className} style={style}>
      {children}
    </Component>
  );
}
