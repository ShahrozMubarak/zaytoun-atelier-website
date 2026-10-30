import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';

/**
 * Footer - Luxury Camel Signature Editorial Split Footer
 * Theme: Pure Camel (#C69F6F / #B58E5C) with high-contrast espresso & ivory typography.
 */
export default function Footer({ onOpenSizeGuide }) {
  const location = useLocation();

  if (location.pathname.startsWith('/studio') || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#C69F6F] text-[#1C1612] border-t border-[#B58E5C] select-none transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-14 sm:py-20">
        
        {/* Split Grid: Left Half Just Logo & Heritage, Right Half Condensed Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-12 border-b border-[#B58E5C]/70">
          
          {/* Left Half: Purely Spacious with FOOLISH ARC Logo Suite */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-4">
            <BrandLogo size="lg" />
            <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#3D2916] max-w-sm">
              Architectural Slow Luxury • Crafted from 100% Ring-Spun Cotton & European Flax Linen
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-[10px] bg-[#1C1612] text-white px-3 py-1 font-mono font-black uppercase tracking-widest rounded-full">
                NEW YORK
              </span>
              <span className="text-[10px] bg-[#FAF8F5] text-[#1C1612] px-3 py-1 font-mono font-black uppercase tracking-widest rounded-full border border-[#B58E5C]">
                SINCE 1988
              </span>
            </div>
          </div>

          {/* Right Half: Condensed Essential Links */}
          <div className="lg:col-span-5 flex flex-wrap gap-x-12 gap-y-6 text-xs uppercase tracking-widest font-black">
            <div>
              <p className="text-[#1C1612] mb-3 font-mono font-extrabold uppercase tracking-[0.2em] underline decoration-[#9A6E3E] underline-offset-4">
                Couture
              </p>
              <ul className="space-y-2.5 text-[#2C1F13] font-bold normal-case tracking-normal text-sm">
                <li>
                  <Link to="/shop" className="hover:text-white transition">
                    Collection
                  </Link>
                </li>
                <li>
                  <Link to="/shop?cat=women" className="hover:text-white transition">
                    Women's Pret
                  </Link>
                </li>
                <li>
                  <Link to="/shop?cat=men" className="hover:text-white transition">
                    Men's Denim
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-white transition font-black underline">
                    Admin Studio
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[#1C1612] mb-3 font-mono font-extrabold uppercase tracking-[0.2em] underline decoration-[#9A6E3E] underline-offset-4">
                Assistance
              </p>
              <ul className="space-y-2.5 text-[#2C1F13] font-bold normal-case tracking-normal text-sm">
                <li>
                  <Link to="/track" className="hover:text-white transition font-black">
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
                <li>
                  <span className="text-xs font-mono font-bold text-[#473320]">
                    TCS Express Insured
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[#1C1612] mb-3 font-mono font-extrabold uppercase tracking-[0.2em] underline decoration-[#9A6E3E] underline-offset-4">
                Contact
              </p>
              <ul className="space-y-2.5 text-[#2C1F13] font-bold normal-case tracking-normal text-sm">
                <li>
                  <a href="tel:+923001234567" className="hover:text-white transition">
                    +92 300 1234567
                  </a>
                </li>
                <li>
                  <a href="mailto:concierge@foolisharc.com" className="hover:text-white transition">
                    concierge@foolisharc.com
                  </a>
                </li>
                <li className="text-[#473320] text-xs font-mono font-bold">
                  Gulberg III, Lahore
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Clean Minimalist Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#3D2916] font-mono gap-3 font-bold">
          <p>© {new Date().getFullYear()} FOOLISH ARC. All rights reserved.</p>
          <p className="text-[#2C1F13]">NEW YORK • LAHORE • PARIS</p>
        </div>

      </div>
    </footer>
  );
}
