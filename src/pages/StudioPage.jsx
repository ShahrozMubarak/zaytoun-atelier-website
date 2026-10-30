import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import AdminGate from '../components/AdminGate';

function UltraPremiumSignInPrompt({ onOpenAuthModal }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-stone-950 via-neutral-900 to-stone-950 text-stone-100">
      <div className="relative group max-w-lg w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-600/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-stone-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 font-semibold">
              RESTRICTED EXECUTIVE ACCESS
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif tracking-widest text-stone-100">
              ZAYTOUN ATELIER
            </h2>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-medium">
              PRIVATE STUDIO PORTAL
            </p>
          </div>

          <p className="text-sm text-stone-400 font-light leading-relaxed">
            Authentication required to inspect 3D Executive Analytics, process client orders, and manage live atelier catalog inventory.
          </p>

          <button
            onClick={onOpenAuthModal}
            className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-[1px] focus:outline-none transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-amber-500/10"
          >
            <div className="w-full bg-stone-950 hover:bg-stone-900/90 rounded-[11px] py-4 px-6 transition-all duration-300 flex items-center justify-center space-x-3 group/btn">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 group-hover/btn:text-amber-200">
                AUTHENTICATE WITH GOOGLE
              </span>
              <svg className="w-4 h-4 text-amber-400 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>

          <div className="pt-2 text-[11px] text-stone-500 font-mono flex items-center justify-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>256-BIT ENCRYPTED ATELIER GATEWAY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Executive3DAnalytics({ orders = [], products = [] }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  const totalRevenue = orders.reduce((acc, o) => {
    const val = Number(o.total || o.totalAmount || o.price || 0);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const totalOrders = orders.length;
  const totalProducts = products.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statusCounts = orders.reduce((acc, o) => {
    const st = (o.status || 'Pending').toLowerCase();
    const key = st.includes('ship') ? 'Shipped' : st.includes('deliver') ? 'Delivered' : st.includes('process') ? 'Processing' : st.includes('cancel') ? 'Cancelled' : 'Pending';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 });

  const statusCategories = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const categoryMap = products.reduce((acc, p) => {
    const cat = p.category || 'Couture';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryMap).length > 0 
    ? Object.entries(categoryMap) 
    : [['Outerwear', 4], ['Suits', 3], ['Couture', 5], ['Accessories', 2]];

  const maxCategoryCount = Math.max(...categoryEntries.map(([, c]) => c), 1);

  const chartPoints = orders.length > 0 ? orders.map((o, idx) => {
    const rev = Number(o.total || o.totalAmount || o.price || 150);
    return { x: idx, rev };
  }) : [
    { x: 0, rev: 450 },
    { x: 1, rev: 890 },
    { x: 2, rev: 1200 },
    { x: 3, rev: 950 },
    { x: 4, rev: 1850 },
    { x: 5, rev: 2400 },
    { x: 6, rev: 3100 }
  ];

  const maxRev = Math.max(...chartPoints.map(p => p.rev), 100);
  const svgWidth = 600;
  const svgHeight = 180;
  
  const mappedPoints = chartPoints.map((p, i) => {
    const x = (i / Math.max(chartPoints.length - 1, 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - 20 - (p.rev / maxRev) * (svgHeight - 40);
    return { x, y, rev: p.rev };
  });

  const svgPathD = mappedPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const svgAreaD = `${svgPathD} L ${mappedPoints[mappedPoints.length - 1]?.x || svgWidth - 20} ${svgHeight - 10} L ${mappedPoints[0]?.x || 20} ${svgHeight - 10} Z`;

  return (
    <div className="mb-10 p-6 sm:p-8 bg-stone-900/95 border border-amber-500/30 rounded-3xl shadow-2xl text-stone-100 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-amber-400">
              EXECUTIVE INTELLIGENCE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-100 mt-1">
            3D Executive Analytics
          </h2>
        </div>
        <div className="text-right sm:text-right text-xs text-stone-400 font-mono">
          <span>LIVE DATA ENGINE</span> • <span className="text-amber-400 font-semibold">{totalOrders} ORDERS / {totalProducts} PRODUCTS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            transform: hoveredCard === 1 
              ? 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.03)' 
              : 'perspective(1000px) rotateX(6deg) rotateY(-4deg)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="relative group bg-gradient-to-br from-stone-800/90 via-stone-900/90 to-stone-950/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/10 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition duration-500"></div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-amber-400/90 mb-1">
            Total Revenue
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-stone-100 font-bold tracking-wide">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-3">
            <span>Gross Sales</span>
            <span className="text-emerald-400 font-mono font-medium">↑ Live</span>
          </div>
        </div>

        <div
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            transform: hoveredCard === 2 
              ? 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.03)' 
              : 'perspective(1000px) rotateX(6deg) rotateY(4deg)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="relative group bg-gradient-to-br from-stone-800/90 via-stone-900/90 to-stone-950/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/10 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition duration-500"></div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-amber-400/90 mb-1">
            Total Orders
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-stone-100 font-bold tracking-wide">
            {totalOrders}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-3">
            <span>Processed</span>
            <span className="text-amber-400 font-mono font-medium">{statusCounts.Pending} Pending</span>
          </div>
        </div>

        <div
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            transform: hoveredCard === 3 
              ? 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.03)' 
              : 'perspective(1000px) rotateX(-6deg) rotateY(-4deg)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="relative group bg-gradient-to-br from-stone-800/90 via-stone-900/90 to-stone-950/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/10 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition duration-500"></div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-amber-400/90 mb-1">
            Catalog Products
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-stone-100 font-bold tracking-wide">
            {totalProducts}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-3">
            <span>Active Collection</span>
            <span className="text-amber-400 font-mono font-medium">{categoryEntries.length} Categories</span>
          </div>
        </div>

        <div
          onMouseEnter={() => setHoveredCard(4)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            transform: hoveredCard === 4 
              ? 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.03)' 
              : 'perspective(1000px) rotateX(-6deg) rotateY(4deg)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="relative group bg-gradient-to-br from-stone-800/90 via-stone-900/90 to-stone-950/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/10 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition duration-500"></div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-amber-400/90 mb-1">
            Avg Order Value
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-stone-100 font-bold tracking-wide">
            ${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-3">
            <span>Per Transaction</span>
            <span className="text-amber-300 font-mono font-medium">AOV</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 bg-stone-950/80 border border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-200">
                Revenue Trajectory Graph
              </h3>
              <p className="text-xs text-stone-500">
                Dynamic linear curve computed from active atelier sales
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-md">
              SVG VECTOR
            </span>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[0.2, 0.5, 0.8].map((ratio, i) => (
                <line
                  key={i}
                  x1="20"
                  y1={svgHeight * ratio}
                  x2={svgWidth - 20}
                  y2={svgHeight * ratio}
                  stroke="#332d29"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              <path d={svgAreaD} fill="url(#goldGradient)" />
              <path d={svgPathD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {mappedPoints.map((pt, i) => (
                <g key={i} className="group/pt cursor-pointer">
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#1c1917" stroke="#fbbf24" strokeWidth="2.5" className="transition-all duration-300 group-hover/pt:r-7" />
                  <title>{`Order #${i + 1}: $${pt.rev.toLocaleString()}`}</title>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-200">
              Order Status Breakdown
            </h3>
            <div className="space-y-3">
              {statusCategories.map(st => {
                const cnt = statusCounts[st] || 0;
                const pct = totalOrders > 0 ? Math.round((cnt / totalOrders) * 100) : 0;
                return (
                  <div key={st} className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-300 font-medium">
                      <span>{st}</span>
                      <span className="font-mono text-amber-400">{cnt} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max(pct, cnt > 0 ? 8 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-200">
              Category Distribution
            </h3>
            <div className="space-y-3">
              {categoryEntries.map(([cat, count]) => {
                const pct = Math.round((count / Math.max(totalProducts, 1)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-300 font-medium">
                      <span>{cat}</span>
                      <span className="font-mono text-amber-400">{count} items ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-stone-400 via-amber-400 to-amber-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max((count / maxCategoryCount) * 100, 10)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
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
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  if (!activeUser) {
    return <UltraPremiumSignInPrompt onOpenAuthModal={onOpenAuthModal} />;
  }

  return (
    <AdminGate user={activeUser} onOpenAuthModal={onOpenAuthModal}>
      <div className="min-h-screen bg-stone-950 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Executive3DAnalytics orders={orders} products={products} />
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
    </AdminGate>
  );
}
