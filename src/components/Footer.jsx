import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer - Minimalist Split Luxury Footer
 * Left Half: Iconic Brand Monogram & Philosophy
 * Right Half: Essential Navigation & Client Concierge
 * Zero administrative or studio links exposed.
 */
export default function Footer({ onOpenSizeGuide }) {
  return (
    <footer className="bg-black text-neutral-300 border-t border-neutral-800 transition-colors select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        
        {/* Split Grid: Left Half Brand, Right Half Direct Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-12 border-b border-neutral-800">
          
          {/* Left Half: Brand Identity (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#E6D3B3] text-black flex items-center justify-center font-black text-lg tracking-tight shadow-sm transition-transform group-hover:scale-105">
                Z
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-editorial text-2xl sm:text-3xl font-black tracking-[0.24em] text-white uppercase">
                  ZAYTOUN
                </span>
                <span className="text-xs font-bold tracking-[0.38em] text-[#E6D3B3] uppercase mt-1">
                  ATELIER
                </span>
              </div>
            </Link>

            <p className="text-sm text-neutral-400 max-w-md leading-relaxed font-normal">
              Slow luxury handcrafted in Pakistan. Ring-spun denim, heavyweight tees, and artisanal tailored pieces engineered to endure seasons.
            </p>

            <div className="flex items-center space-x-2 text-xs font-bold text-[#E6D3B3] tracking-widest uppercase">
              <span>Lahore</span>
              <span>•</span>
              <span>Karachi</span>
              <span>•</span>
              <span>Islamabad</span>
            </div>
          </div>

          {/* Right Half: Simple Essential Links (6 Cols) */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-2 gap-8 text-sm">
            
            {/* Column 1: Collection */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#E6D3B3]">
                Collection
              </h4>
              <ul className="space-y-2.5 text-neutral-400 font-medium">
                <li>
                  <Link to="/shop?cat=men" className="hover:text-white transition">
                    Men's Apparel
                  </Link>
                </li>
                <li>
                  <Link to="/shop?cat=women" className="hover:text-white transition">
                    Women's Pret
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-white transition">
                    All Pieces
                  </Link>
                </li>
                <li>
                  <Link to="/story" className="hover:text-white transition">
                    Atelier Story
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Client Concierge */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#E6D3B3]">
                Concierge
              </h4>
              <ul className="space-y-2.5 text-neutral-400 font-medium">
                <li>
                  <Link to="/track" className="hover:text-white transition text-[#E6D3B3] font-bold">
                    Track Consignment
                  </Link>
                </li>
                <li>
                  <button onClick={onOpenSizeGuide} className="hover:text-white transition text-left">
                    Size & Fitting Guide
                  </button>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition">
                    Concierge Desk
                  </Link>
                </li>
                <li>
                  <a
                    href="https://wa.me/923001234567"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition inline-flex items-center space-x-1.5"
                  >
                    <span>WhatsApp Concierge</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Clean Bottom Copyright Bar - Zero Administrative Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} ZAYTOUN ATELIER. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span>Nationwide Express Logistics (TCS &amp; Leopards)</span>
            <span>•</span>
            <span>SSL Secured</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
