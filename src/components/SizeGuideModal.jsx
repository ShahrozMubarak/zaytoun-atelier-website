import React, { useState } from 'react';

export default function SizeGuideModal({ isOpen, onClose }) {
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'

  if (!isOpen) return null;

  const chartDataInches = [
    { size: "XS", chest: "34 - 36", waist: "28 - 30", hips: "35 - 37", length: "42" },
    { size: "S", chest: "36 - 38", waist: "30 - 32", hips: "37 - 39", length: "43" },
    { size: "M", chest: "38 - 40", waist: "32 - 34", hips: "39 - 41", length: "44" },
    { size: "L", chest: "41 - 43", waist: "35 - 37", hips: "42 - 44", length: "45" },
    { size: "XL", chest: "44 - 46", waist: "38 - 40", hips: "45 - 47", length: "45.5" },
    { size: "XXL", chest: "47 - 49", waist: "41 - 43", hips: "48 - 50", length: "46" }
  ];

  const chartDataCm = [
    { size: "XS", chest: "86 - 91", waist: "71 - 76", hips: "89 - 94", length: "107" },
    { size: "S", chest: "91 - 96", waist: "76 - 81", hips: "94 - 99", length: "109" },
    { size: "M", chest: "96 - 102", waist: "81 - 86", hips: "99 - 104", length: "112" },
    { size: "L", chest: "104 - 109", waist: "89 - 94", hips: "107 - 112", length: "114" },
    { size: "XL", chest: "112 - 117", waist: "96 - 102", hips: "114 - 119", length: "116" },
    { size: "XXL", chest: "119 - 124", waist: "104 - 109", hips: "122 - 127", length: "117" }
  ];

  const currentData = unit === 'in' ? chartDataInches : chartDataCm;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-onyx-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-linen-300 relative fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-linen-300">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-camel-700">Atelier Standard Sizing</span>
            <h3 className="font-editorial text-2xl font-bold text-onyx-950">Apparel Sizing & Measurement Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-onyx-500 hover:text-onyx-950 rounded-full hover:bg-linen-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-onyx-600">
            All measurements represent body measurements unless specified.
          </p>
          <div className="inline-flex bg-[#FAF6F0] p-1 rounded-xl border border-[#D8CEBF]">
            <button
              onClick={() => setUnit('in')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                unit === 'in' ? 'bg-[#1C1612] text-white shadow-sm' : 'text-neutral-700'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                unit === 'cm' ? 'bg-[#1C1612] text-white shadow-sm' : 'text-neutral-700'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Measurement Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-linen-200/80 text-onyx-800 font-bold border-b border-linen-300">
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Chest ({unit})</th>
                <th className="py-2.5 px-3">Waist ({unit})</th>
                <th className="py-2.5 px-3">Hips ({unit})</th>
                <th className="py-2.5 px-3">Length ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linen-200 text-onyx-700 font-medium">
              {currentData.map((row) => (
                <tr key={row.size} className="hover:bg-linen-100 transition">
                  <td className="py-2.5 px-3 font-bold text-olive-800 bg-linen-100/50">{row.size}</td>
                  <td className="py-2.5 px-3">{row.chest}</td>
                  <td className="py-2.5 px-3">{row.waist}</td>
                  <td className="py-2.5 px-3">{row.hips}</td>
                  <td className="py-2.5 px-3">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Measure Guidelines */}
        <div className="mt-6 p-4 rounded-xl bg-linen-100 border border-linen-300 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-onyx-700">
          <div>
            <strong className="text-olive-800 block mb-0.5">1. Chest / Bust:</strong>
            Measure around the fullest part of your chest, keeping the tape level under arms.
          </div>
          <div>
            <strong className="text-olive-800 block mb-0.5">2. Natural Waist:</strong>
            Measure around the narrowest point of your torso, typically above the navel.
          </div>
          <div>
            <strong className="text-olive-800 block mb-0.5">3. Hips & Seat:</strong>
            Stand with feet together and measure around the fullest part of your seat.
          </div>
        </div>

        {/* Exchange Guarantee */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-onyx-500 pt-2 border-t border-linen-200">
          <span>🌿 <strong>Complimentary Size Exchange:</strong> In case the fit isn't perfect, we arrange an instant pickup within 7 days.</span>
          <button
            onClick={onClose}
            className="ml-4 bg-[#1C1612] hover:bg-[#9A6E3E] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-sm active:scale-95"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
}
