import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { fetchOrderByNumber } from '../services/api';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [searchId, setSearchId] = useState('');
  const [order, setOrder] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Load orders from MongoDB or localStorage
  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setNotFound(false);
      return;
    }

    let isMounted = true;

    async function loadOrder() {
      // 1. Try fetching from MongoDB database
      try {
        const dbOrder = await fetchOrderByNumber(orderId);
        if (dbOrder && isMounted) {
          setOrder(dbOrder);
          setNotFound(false);
          return;
        }
      } catch (err) {
        console.warn("DB lookup error:", err);
      }

      // 2. Check localStorage fallback
      try {
        const savedOrders = JSON.parse(localStorage.getItem('zaytoun_orders') || '[]');
        const found = savedOrders.find(
          o => (o.orderNumber && o.orderNumber.toUpperCase() === orderId.toUpperCase()) ||
               (o.id && o.id.toUpperCase() === orderId.toUpperCase())
        );

        if (found && isMounted) {
          setOrder(found);
          setNotFound(false);
          return;
        }
      } catch (e) {
        console.warn("Local storage lookup error:", e);
      }

      // 3. Fallback sample demo order if ID begins with ZYT-
      if (orderId.startsWith('ZYT-') && isMounted) {
        setOrder({
          orderNumber: orderId,
          id: orderId,
          customer: {
            firstName: "Ayesha",
            lastName: "Malik",
            phone: "03008472910",
            address: "18-C Gulberg III",
            city: "Lahore",
            province: "Punjab"
          },
          paymentMethod: "jazzcash",
          total: 33300,
          status: "dispatched",
          courier: "TCS Express",
          trackingNumber: "TCS-99482104-LHE",
          createdAt: "2026-10-18T14:30:00Z",
          items: [
            {
              id: "forme-01",
              name: "The Olive Heritage Double-Breasted Trench",
              price: 18500,
              selectedSize: "M",
              selectedColor: "Olive Green",
              quantity: 1,
              image: "/images/campaign_olive_coat.jpg"
            },
            {
              id: "forme-02",
              name: "Pure Mongolian Camel Cashmere Knit",
              price: 14200,
              selectedSize: "M",
              selectedColor: "Desert Camel",
              quantity: 1,
              image: "/images/campaign_camel_knit.jpg"
            }
          ]
        });
        setNotFound(false);
      } else {
        setOrder(null);
        setNotFound(true);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/track/${searchId.trim().toUpperCase()}`);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const stages = [
    { key: 'placed', label: 'Order Placed', desc: 'Proof Attached & Authenticated' },
    { key: 'verified', label: 'Studio Verified', desc: 'Proof Approved in Studio' },
    { key: 'processing', label: 'Tailoring & QC', desc: 'Hand-inspected in Lahore' },
    { key: 'dispatched', label: 'Dispatched', desc: 'Handed to Courier Rider' },
    { key: 'delivered', label: 'Delivered', desc: 'Signed & Completed' }
  ];

  const getStageIndex = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 0;
      case 'approved':
      case 'confirmed':
      case 'verified':
        return 1;
      case 'processing':
        return 2;
      case 'dispatched':
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIdx = order ? getStageIndex(order.status) : 0;
  const isPendingApproval = (order?.status || '').toLowerCase() === 'pending';

  return (
    <div className="min-h-screen bg-linen-100 dark:bg-onyx-950 text-onyx-950 dark:text-linen-100 transition-colors py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Slogan */}
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C69F6F] block">
            NATIONWIDE FULFILLMENT
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
            ORDER CONSIGNMENT TRACKING
          </h1>
        </div>

        {/* Search Bar for Order Lookup */}
        {/* Search Bar - Architectural Notched / Rounded Luxury Frame */}
        <div className="bg-white dark:bg-[#1A1613] rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E6D3B3] dark:border-[#332A22] mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Consignment or Order ID (e.g. TCS-99482104-LHE)"
                aria-label="Order Tracking ID"
                className="w-full pl-11 pr-4 py-3.5 bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] rounded-xl text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#1C1612] dark:text-white focus:outline-none focus:border-[#9A6E3E] focus:ring-2 focus:ring-[#9A6E3E]/20 transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-[#1C1612] hover:bg-[#9A6E3E] text-white font-black px-8 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md"
            >
              TRACK ORDER →
            </button>
          </form>
        </div>

        {/* If Order is Found */}
        {order ? (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Order Header Summary Banner */}
            <div className="bg-white dark:bg-[#1A1613] rounded-2xl p-6 sm:p-7 shadow-sm border border-[#E6D3B3] dark:border-[#332A22] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6A3E] dark:text-[#E6D3B3] font-bold block">
                  Confirmed Consignment Dossier
                </span>
                <div className="flex items-center space-x-3 mt-1">
                  <h2 className="font-mono text-xl sm:text-2xl font-black text-[#1C1612] dark:text-white tracking-tight">
                    #{order.orderNumber || order.id}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isPendingApproval
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isPendingApproval ? 'Pending Studio Verification' : (order.status || 'Processing')}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  Placed on {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-PK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Share & Copy Tracking Link Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl border border-[#D8CEBF] dark:border-[#382F26] hover:border-[#9A6E3E] text-xs font-bold text-[#1C1612] dark:text-white bg-[#FAF9F6] dark:bg-[#201A16] hover:bg-white transition flex items-center space-x-2"
                >
                  <span>{copiedLink ? '✓ Copied!' : '🔗 Copy Tracking Link'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 text-xs font-bold text-neutral-800 dark:text-neutral-200 transition"
                  title="Print Tax Invoice"
                >
                  🖨️ Receipt
                </button>
              </div>
            </div>

            {/* Pending Studio Verification Notice */}
            {isPendingApproval && (
              <div className="bg-[#FAF6F0] dark:bg-[#201A16] border-l-4 border-[#9A6E3E] p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9A6E3E] animate-pulse"></span>
                    <strong className="text-xs uppercase font-black tracking-wider text-black dark:text-white">
                      PAYMENT VERIFICATION IN PROGRESS
                    </strong>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    STATUS: STUDIO CONCIERGE REVIEW • TCS COURIER ASSIGNED ON APPROVAL
                  </div>
                </div>
                {order.paymentReceipt && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-700 text-xs font-bold font-mono text-black dark:text-white uppercase">
                      <span>📎</span>
                      <span>PAYMENT PROOF ATTACHED</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Live 5-Stage Visual Stepper */}
            <div className="bg-white dark:bg-onyx-900 rounded-none p-6 sm:p-8 shadow-sm border border-linen-300 dark:border-onyx-800">
              <span className="text-xs font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 block mb-6 font-bold">
                Live Fulfillment Stepper
              </span>

              {/* Horizontal Stepper */}
              <div className="relative">
                {/* Connecting Track Line */}
                <div className="hidden sm:block absolute top-5 left-8 right-8 h-0.5 bg-linen-200 dark:bg-onyx-800 z-0">
                  <div
                    className="h-full bg-camel-600 dark:bg-camel-400 transition-all duration-700 ease-out"
                    style={{ width: `${(currentStageIdx / (stages.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                  {stages.map((stage, idx) => {
                    const isDone = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div key={stage.key} className="flex sm:flex-col items-center sm:text-center space-x-4 sm:space-x-0">
                        {/* Milestone Circle */}
                        <div
                          className={`w-10 h-10 rounded-none flex items-center justify-center font-bold text-xs transition-all duration-500 shadow-sm ${
                            isDone
                              ? 'bg-black text-white dark:bg-camel-400 dark:text-onyx-950'
                              : 'bg-linen-200 dark:bg-onyx-800 text-onyx-400 dark:text-linen-500 border border-linen-300 dark:border-onyx-700'
                          } ${isCurrent ? 'ring-2 ring-camel-400/50 scale-105' : ''}`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>

                        <div className="sm:mt-3">
                          <p className={`text-xs font-black uppercase tracking-wider ${
                            isDone ? 'text-black dark:text-white' : 'text-neutral-400'
                          }`}>
                            {stage.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Courier Dispatch Card */}
              <div className="mt-8 p-4 rounded-none bg-linen-100 dark:bg-onyx-950 border border-linen-300 dark:border-onyx-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-none bg-black text-white dark:bg-camel-500 dark:text-onyx-950 flex items-center justify-center font-bold text-sm">
                    🚚
                  </div>
                  <div>
                    <span className="text-xs uppercase font-mono tracking-wider text-onyx-500 dark:text-linen-400 block">
                      Assigned White-Glove Courier:
                    </span>
                    <strong className="text-onyx-950 dark:text-linen-50 font-bold">
                      {isPendingApproval ? 'Assigned upon Studio Approval' : (order.courier || 'TCS Express / Leopards')}
                    </strong>
                    <span className="text-onyx-400 ml-2 font-mono">
                      {isPendingApproval
                        ? '(Consignment assigned after approval)'
                        : `(Consignment #${order.trackingNumber || 'TCS-99482104-PK'})`}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs uppercase font-mono tracking-wider text-onyx-500 dark:text-linen-400 block">
                    Estimated Doorstep Arrival:
                  </span>
                  <strong className="text-sand-700 dark:text-sand-300">
                    {isPendingApproval ? '2 to 4 Days (Post-Verification)' : '2 to 4 Business Days'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Recipient Details & Purchased Garments */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Delivery Destination (5 cols) */}
              <div className="md:col-span-5 bg-white dark:bg-[#1A1613] rounded-2xl p-6 sm:p-7 shadow-sm border border-[#E6D3B3] dark:border-[#332A22] space-y-4 text-xs">
                <h3 className="text-base font-black uppercase tracking-tight text-[#1C1612] dark:text-white pb-3 border-b border-[#EFE9DF] dark:border-[#2C241D]">
                  Delivery Destination
                </h3>
                
                <div className="space-y-2 text-neutral-700 dark:text-neutral-300">
                  <div className="font-black text-[#1C1612] dark:text-white text-sm">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </div>
                  <div className="font-medium leading-relaxed">{order.customer?.address}</div>
                  <div className="font-bold text-[#8C6A3E] dark:text-[#E6D3B3]">{order.customer?.city}, {order.customer?.province || 'Punjab'}</div>
                  <div className="font-mono text-neutral-500 font-bold pt-1">
                    Contact: {order.customer?.phone}
                  </div>
                  <div className="font-mono text-neutral-500">
                    Email: {order.customer?.email}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EFE9DF] dark:border-[#2C241D] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-bold">Payment Method:</span>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] text-[#9A6E3E] font-black uppercase text-xs tracking-wider">
                      {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'Cash on Delivery'}
                    </span>
                  </div>
                  {order.paymentReceipt && (
                    <div className="p-3 bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] dark:border-[#332A22] rounded-xl flex items-center justify-between text-xs font-bold">
                      <span className="font-mono text-[#9A6E3E]">📎 Payment Screenshot on File</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Garments Summary (7 cols) */}
              <div className="md:col-span-7 bg-white dark:bg-[#1A1613] rounded-2xl p-6 sm:p-7 shadow-sm border border-[#E6D3B3] dark:border-[#332A22] space-y-4">
                <h3 className="text-base font-black uppercase tracking-tight text-[#1C1612] dark:text-white pb-3 border-b border-[#EFE9DF] dark:border-[#2C241D]">
                  Ordered Garments ({order.items?.length || 0})
                </h3>

                <div className="space-y-3 divide-y divide-[#EFE9DF] dark:divide-[#2C241D]">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3.5">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-15 object-cover rounded-xl border border-black/10 shrink-0"
                          />
                        )}
                        <div>
                          <strong className="block text-[#1C1612] dark:text-white font-bold text-sm">
                            {item.name || item.product?.name}
                          </strong>
                          <span className="text-neutral-500 text-xs font-medium">
                            Qty: {item.quantity} • Size: {item.selectedSize || item.size || 'M'} • Color: {item.selectedColor || item.color || 'Sand'}
                          </span>
                        </div>
                      </div>
                      <div className="font-black text-[#1C1612] dark:text-white text-sm">
                        {formatPrice((item.price || item.product?.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#EFE9DF] dark:border-[#2C241D] flex justify-between items-center text-sm font-black text-[#1C1612] dark:text-white">
                  <span className="uppercase tracking-wider">Total Payable:</span>
                  <span className="text-xl text-[#9A6E3E] font-black tracking-tight">
                    {formatPrice(order.total || order.pricing?.finalTotal || 0)}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="text-center pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 hover:underline"
              >
                <span>← Return to Capsule Shop</span>
              </Link>
            </div>

          </div>
        ) : notFound ? (
          <div className="bg-white dark:bg-onyx-900 rounded-2xl p-10 text-center shadow-md border border-linen-300 dark:border-onyx-800 space-y-4">
            <span className="text-4xl block">🔍</span>
            <h2 className="font-editorial text-2xl font-bold">Consignment Not Found</h2>
            <p className="text-xs text-onyx-600 dark:text-linen-400 max-w-md mx-auto">
              We couldn't locate an order matching ID <strong className="font-mono text-olive-800 dark:text-camel-400">{orderId}</strong>. Please check your order confirmation SMS or email, or contact our Lahore atelier concierge.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="px-6 py-2.5 rounded-full bg-olive-800 text-white text-xs font-bold uppercase tracking-widest hover:bg-olive-900 transition"
              >
                Contact Concierge
              </Link>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
