import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

/**
 * Footer - Ultra-Minimalist Editorial Split Footer
 * 
 * Rules:
 * - Left half is spacious and empty, featuring ONLY the bespoke brand logo.
 * - Text cut in half: only 4 essential navigation/concierge links on the right half.
 * - Zero administrative links exposed.
 * - Understated luxury copyright.
 */
export default function Footer({ onOpenSizeGuide }) {
  return (
    <footer className="bg-black text-neutral-300 border-t border-neutral-900 transition-colors select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-14 sm:py-20">
        
        {/* Split Grid: Left Half Just Logo, Right Half Half the Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-12 border-b border-neutral-900">
          
          {/* Left Half: Purely Spacious with ONLY Brand Logo */}
          <div className="lg:col-span-7 flex items-start">
            <BrandLogo size="lg" />
          </div>

          {/* Right Half: Condensed Essential Links (Half the Text) */}
          <div className="lg:col-span-5 flex flex-wrap gap-x-12 gap-y-6 text-xs uppercase tracking-widest font-bold">
            <div>
              <p className="text-[#A6865A] dark:text-[#E6D3B3] mb-3 font-mono">Couture</p>
              <ul className="space-y-2.5 text-neutral-400 font-medium normal-case tracking-normal text-sm">
                <li>
                  <Link to="/shop" className="hover:text-white transition">
                    Collection
                  </Link>
                </li>
                <li>
                  <Link to="/story" className="hover:text-white transition">
                    Atelier Story
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[#A6865A] dark:text-[#E6D3B3] mb-3 font-mono">Assistance</p>
              <ul className="space-y-2.5 text-neutral-400 font-medium normal-case tracking-normal text-sm">
                <li>
                  <Link to="/track" className="hover:text-white transition text-[#E6D3B3] font-bold">
                    Track Consignment
                  </Link>
                </li>
                <li>
                  <a
                    href="https://wa.me/923001234567"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition"
                  >
                    WhatsApp Concierge
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[#A6865A] dark:text-[#E6D3B3] mb-3 font-mono">Contact</p>
              <ul className="space-y-2.5 text-neutral-400 font-medium normal-case tracking-normal text-sm">
                <li>
                  <a href="tel:+923001234567" className="hover:text-white transition">
                    +92 300 1234567
                  </a>
                </li>
                <li>
                  <a href="mailto:concierge@zaytounatelier.com" className="hover:text-white transition">
                    concierge@zaytounatelier.com
                  </a>
                </li>
                <li className="text-neutral-500 text-xs font-mono">
                  Gulberg III, Lahore
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Clean Minimalist Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-3">
          <p>© {new Date().getFullYear()} ZAYTOUN ATELIER. All rights reserved.</p>
          <p className="text-neutral-600">Pure Slow Luxury • Pakistan</p>
        </div>

      </div>
    </footer>
  );
}
