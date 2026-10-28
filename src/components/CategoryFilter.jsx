import React from 'react';

export const GENDER_FILTERS = [
  { id: "all", label: "All Items" },
  { id: "men", label: "Men's Collection" },
  { id: "women", label: "Women's Collection" }
];

export const SLOT_FILTERS = [
  { id: "all", label: "All Categories" },
  { id: "jeans", label: "Jeans & Denim" },
  { id: "tee", label: "T-Shirts" },
  { id: "shirt", label: "Shirts" },
  { id: "trouser", label: "Trousers" }
];

export default function CategoryFilter({
  activeGender = "all",
  onSelectGender,
  activeSlot = "all",
  onSelectSlot,
  totalCount = 0
}) {
  return (
    <div className="py-6 border-b border-neutral-200 dark:border-onyx-800 space-y-4">
      
      {/* Top Row: Gender Collection Tabs + Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Main Gender Tabs: All | Men | Women */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {GENDER_FILTERS.map((g) => {
            const isActive = activeGender === g.id;
            return (
              <button
                key={g.id}
                onClick={() => onSelectGender(g.id)}
                className={`px-5 py-2 rounded-none text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'bg-white dark:bg-onyx-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-onyx-800 border border-neutral-300 dark:border-onyx-800'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Counter and Status */}
        <div className="flex items-center space-x-3 text-xs text-neutral-500 font-medium">
          <span>
            Showing <strong className="text-black dark:text-white font-bold">{totalCount}</strong> pieces
          </span>
          <div className="flex items-center space-x-1.5 pl-3 border-l border-neutral-300 dark:border-onyx-800">
            <span className="w-2 h-2 rounded-none bg-emerald-600"></span>
            <span className="text-[11px] font-mono text-black dark:text-white font-semibold uppercase">In Stock</span>
          </div>
        </div>

      </div>

      {/* Sub-Row: Garment Slot Category Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mr-1">
          Category:
        </span>
        {SLOT_FILTERS.map((s) => {
          const isActive = activeSlot === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSlot(s.id)}
              className={`px-3 py-1 rounded-none text-[11px] font-bold uppercase transition ${
                isActive
                  ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-onyx-900 border border-neutral-200 dark:border-onyx-800'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}
