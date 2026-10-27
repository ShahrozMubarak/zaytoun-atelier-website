import React from 'react';

export const GENDER_FILTERS = [
  { id: "all", label: "All Pieces" },
  { id: "women", label: "Women's Pret" },
  { id: "men", label: "Men's Collection" },
  { id: "kids", label: "Kids Pret" }
];

export const SLOT_FILTERS = [
  { id: "all", label: "All Types" },
  { id: "outer", label: "Outerwear & Coats" },
  { id: "top", label: "Tops & Knits" },
  { id: "bottom", label: "Trousers & Bottoms" },
  { id: "dress", label: "Dresses & Pret" }
];

export default function CategoryFilter({
  activeGender = "all",
  onSelectGender,
  activeSlot = "all",
  onSelectSlot,
  totalCount = 0
}) {
  return (
    <div className="py-6 border-b border-linen-300 dark:border-onyx-800 space-y-4">
      
      {/* Top Row: Gender Collection Tabs + Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Main Gender Tabs: All | Women | Men | Kids */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {GENDER_FILTERS.map((g) => {
            const isActive = activeGender === g.id;
            return (
              <button
                key={g.id}
                onClick={() => onSelectGender(g.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-olive-700 dark:bg-olive-600 text-white shadow-sm'
                    : 'bg-white dark:bg-onyx-900 text-onyx-700 dark:text-linen-300 hover:bg-linen-200 dark:hover:bg-onyx-800 border border-linen-300 dark:border-onyx-800'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Counter and Status */}
        <div className="flex items-center space-x-4 text-xs text-onyx-600 dark:text-linen-300 font-medium">
          <span>
            Showing <strong className="text-onyx-950 dark:text-linen-50 font-bold">{totalCount}</strong> crafted pieces
          </span>
          <div className="flex items-center space-x-1.5 pl-3 border-l border-linen-300 dark:border-onyx-800">
            <span className="w-2 h-2 rounded-full bg-olive-600 animate-pulse"></span>
            <span className="text-[11px] text-olive-800 dark:text-camel-400 font-semibold">Earth Capsule</span>
          </div>
        </div>

      </div>

      {/* Sub-Row: Garment Slot Category Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] uppercase font-bold text-onyx-400 dark:text-linen-500 tracking-wider mr-1">
          Category:
        </span>
        {SLOT_FILTERS.map((s) => {
          const isActive = activeSlot === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectSlot(s.id)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                isActive
                  ? 'bg-camel-500 text-onyx-950 font-bold shadow-xs'
                  : 'text-onyx-600 dark:text-linen-400 hover:text-onyx-950 dark:hover:text-white bg-linen-100 dark:bg-onyx-900 border border-linen-200 dark:border-onyx-800'
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
