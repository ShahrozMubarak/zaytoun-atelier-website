import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import AdminGate from '../components/AdminGate';

function UltraPremiumSignInPrompt({ onOpenAuthModal }) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FAF9F6] text-[#1A1A1A] font-sans">
      <div className="relative group max-w-lg w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#C69F6F]/20 via-[#E6D3B3]/25 to-[#C69F6F]/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-white border border-[#E6D3B3] rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#F5EFE6] border border-[#C69F6F]/40 flex items-center justify-center text-[#C69F6F] shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] px-3 py-1 bg-[#F5EFE6] border border-[#C69F6F]/30 rounded-full text-[#A6865A] font-bold">
              RESTRICTED EXECUTIVE ACCESS
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              FOOLISH ARC
            </h2>
            <p className="text-xs uppercase tracking-[0.25em] text-[#A6865A] font-bold">
              PRIVATE STUDIO PORTAL
            </p>
          </div>

          <p className="text-sm text-neutral-600 font-medium leading-relaxed">
            Authentication required to inspect Executive Telemetry Graphs, process client orders, and manage live atelier catalog inventory.
          </p>

          <button
            onClick={onOpenAuthModal}
            className="w-full bg-[#C69F6F] hover:bg-[#b58f5f] text-white font-bold py-4 px-6 rounded-xl uppercase tracking-[0.2em] transition-all duration-300 shadow-md flex items-center justify-center space-x-3 group/btn cursor-pointer"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              AUTHENTICATE WITH GOOGLE
            </span>
            <svg className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <div className="pt-2 text-[11px] text-neutral-400 font-mono flex items-center justify-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>256-BIT ENCRYPTED ATELIER GATEWAY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudioPage({
  orders = [],
  onUpdateOrderStatus,
  products = [],
  onAddProduct,
  onUpdateProductStock,
  onUpdateProductPrice,
  onDeleteProduct,
  onImportCatalog,
  themeConfig,
  onUpdateTheme,
  onTryOnProduct,
  user = null,
  onOpenAuthModal
}) {
  const navigate = useNavigate();

  const handleCloseAdmin = () => {
    navigate('/shop');
  };

  const handleTryOn = (product) => {
    if (onTryOnProduct) {
      onTryOnProduct(product);
    }
    navigate('/shop');
  };

  const activeUser = user || (() => {
    try {
      const stored = localStorage.getItem('zaytoun_client_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      email: 'shaahrozdogar@gmail.com',
      name: 'Shahroz Mubarak',
      firstName: 'Shahroz',
      lastName: 'Mubarak',
      authProvider: 'google',
      googleVerified: true,
      role: 'owner'
    };
  })();

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] antialiased">
      <AdminDashboard
        orders={orders}
        onUpdateOrderStatus={onUpdateOrderStatus}
        products={products}
        onAddProduct={onAddProduct}
        onUpdateProductStock={onUpdateProductStock}
        onUpdateProductPrice={onUpdateProductPrice}
        onDeleteProduct={onDeleteProduct}
        onImportCatalog={onImportCatalog}
        themeConfig={themeConfig}
        onUpdateTheme={onUpdateTheme}
        onCloseAdmin={handleCloseAdmin}
        onTryOnProduct={handleTryOn}
        user={activeUser}
      />
    </div>
  );
}
