import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';

/** Press "/" or Ctrl/Cmd+K to search the catalogue. Enter opens the first match. */
export default function SearchOverlay({ products = [], onSelect }) {
  const { formatPrice } = useCurrency();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const input = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const typing = /input|textarea/i.test(e.target.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { if (open) { setQ(''); setTimeout(() => input.current?.focus(), 30); } }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? products.filter(p => `${p.name} ${p.category} ${p.primaryColor}`.toLowerCase().includes(s)) : products).slice(0, 8);
  }, [q, products]);
  const pick = (p) => { setOpen(false); onSelect?.(p); };

  return (
    <>
      <button onClick={() => setOpen(true)} title="Quick Search (⌘K or /)" aria-label="Search" className="btn-press fixed bottom-6 left-6 z-40 w-12 h-12 rounded-xl bg-[#1C1612] hover:bg-[#9A6E3E] text-white shadow-xl grid place-items-center hover:scale-105 transition-all cursor-pointer">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M20 20l-3.5-3.5" /></svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4 bg-onyx-950/70 backdrop-blur-md animate-fadeIn" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl rounded-3xl bg-linen-50 dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 shadow-2xl overflow-hidden animate-pop" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <input ref={input} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && results[0] && pick(results[0])}
                aria-label="Search collection" className="w-full px-6 py-5 text-base sm:text-lg font-bold uppercase tracking-wider bg-transparent outline-none border-b border-linen-200 dark:border-onyx-800 text-onyx-950 dark:text-linen-100" />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-onyx-400 dark:text-linen-500 font-mono">
                <span>ESC</span>
              </div>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto divide-y divide-linen-200/50 dark:divide-onyx-800/50">
              {results.map(p => (
                <li key={p.id}>
                  <button onClick={() => pick(p)} className="w-full flex items-center gap-4 px-6 py-3.5 text-left hover:bg-linen-100 dark:hover:bg-onyx-800 transition">
                    <img src={p.images?.[0]} alt="" className="w-12 h-14 object-cover rounded-lg bg-linen-200 dark:bg-onyx-800" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium text-sm sm:text-base truncate text-onyx-950 dark:text-linen-100">{p.name}</span>
                      <span className="text-[11px] uppercase tracking-wider text-onyx-500 dark:text-linen-400">{p.category} • {p.primaryColor}</span>
                    </div>
                    <span className="font-editorial text-sm font-semibold text-camel-700 dark:text-camel-400">{formatPrice(p.price)}</span>
                  </button>
                </li>
              ))}
              {!results.length && <li className="px-6 py-8 text-center text-onyx-500 dark:text-linen-400 text-sm">No garments found matching &ldquo;{q}&rdquo;</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

