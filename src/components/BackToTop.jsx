import React, { useEffect, useState } from 'react';
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => { const f = () => setShow(window.scrollY > 700); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"
      className={`btn-press fixed bottom-6 right-24 z-40 w-12 h-12 rounded-xl bg-white dark:bg-[#1A1613] border border-[#D8CEBF] dark:border-[#382F26] text-[#1C1612] dark:text-white hover:border-[#9A6E3E] shadow-lg grid place-items-center transition-all duration-500 cursor-pointer ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
    </button>
  );
}
