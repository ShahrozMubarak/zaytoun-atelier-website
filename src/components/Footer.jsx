import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer - Simplified, elegant luxury footer.
 * Clean 3-column layout adhering strictly to Zaytoun's Olive, Camel, Linen & Onyx palette.
 */
export default function Footer({ onOpenSizeGuide }) {
  return (
    <footer className="bg-onyx-950 text-linen-200 border-t-2 border-olive-800 transition-colors">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        
        {/* Simple 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 pb-10 border-b border-onyx-800">
          
          {/* Brand & Ethos (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <Link to="/" className="inline-flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-none bg-olive-500"></span>
              <span className="font-editorial text-2xl font-bold tracking-tight text-linen-50 uppercase">
                ZAYTOUN & CO.
              </span>
              <span className="w-2.5 h-2.5 rounded-none bg-camel-500"></span>
            </Link>
            
            <p className="text-xs text-linen-400 max-w-sm leading-relaxed font-light">
              Slow luxury handcrafted in Lahore. Woven in organic Belgian linen, pure Grade-A Mongolian camel cashmere, and handspun raw silk.
            </p>

            <div className="pt-1">
              <span className="text-[11px] font-mono text-camel-400 tracking-wider uppercase">
                Olive Green • Desert Camel • Onyx • Linen
              </span>
            </div>
          </div>

          {/* Direct Navigation (4 cols) */}
          <div className="md:col-span-4 space-y-2.5 text-xs">
            <h4 className="font-bold text-linen-50 uppercase tracking-wider text-[11px] text-camel-400">
              Explore
            </h4>
            <ul className="space-y-2 text-linen-300">
              <li><Link to="/shop" className="hover:text-camel-300 transition">Complete Collection</Link></li>
              <li><Link to="/shop?cat=women" className="hover:text-camel-300 transition">Women's Pret</Link></li>
              <li><Link to="/shop?cat=men" className="hover:text-camel-300 transition">Men's Collection</Link></li>
              <li><Link to="/story" className="hover:text-camel-300 transition">Atelier Story & Philosophy</Link></li>
              <li><Link to="/track" className="hover:text-camel-300 transition text-camel-300 font-semibold">Track Consignment (TCS / Leopards)</Link></li>
            </ul>
          </div>

          {/* Concierge & Assistance (3 cols) */}
          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="font-bold text-linen-50 uppercase tracking-wider text-[11px] text-camel-400">
              Concierge
            </h4>
            <ul className="space-y-2 text-linen-300">
              <li>
                <button onClick={onOpenSizeGuide} className="hover:text-camel-300 transition text-left">
                  Size & Fitting Guide
                </button>
              </li>
              <li><Link to="/contact" className="hover:text-camel-300 transition">14-Day Free Exchange Policy</Link></li>
              <li>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noreferrer"
                  className="text-olive-400 hover:text-olive-300 font-bold inline-flex items-center space-x-1"
                >
                  <span>💬 WhatsApp Concierge</span>
                </a>
              </li>
              <li className="text-linen-400 text-[11px]">Direct Support: 0300 1234567</li>
            </ul>
          </div>

        </div>

        {/* Clean Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-linen-400 gap-3">
          <p>© {new Date().getFullYear()} ZAYTOUN & CO. All rights reserved. Crafted in Lahore, Pakistan.</p>
          
          <div className="flex items-center space-x-3 text-[11px] font-mono text-linen-400">
            <span>256-Bit SSL Atelier Checkout</span>
            <span>•</span>
            <span>Insured Nationwide Delivery</span>
            <span>•</span>
            <Link to="/admin" className="hover:text-camel-400 transition underline underline-offset-4 opacity-70 hover:opacity-100">
              Staff Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
