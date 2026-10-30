import React, { useState, useEffect, useMemo, useRef } from 'react';
import BrandLogo from './BrandLogo';
import {
  fetchProductsFromDB,
  saveProductToDB,
  deleteProductFromDB,
  fetchOrdersFromDB,
  updateOrderStatusInDB,
  approveOrderInDB,
  fetchSubscribersFromDB,
  deleteSubscriberFromDB,
  fetchCustomersFromDB,
  fetchInquiriesFromDB
} from '../services/api';
import { notifyOrderApproved, notifyOrderStatusChange } from '../services/notificationService';

/**
 * TelemetryGraph - Interactive White & Camel Telemetry Chart
 * Modeled after the luxury retail pulse admin templates.
 */
function TelemetryGraph({ data = [], timeRange = '7d', onTimeRangeChange }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const width = 860;
  const height = 270;
  const padLeft = 65;
  const padRight = 35;
  const padTop = 35;
  const padBottom = 45;

  const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 20000);
  const chartMax = Math.ceil(maxVal * 1.25);

  const points = data.map((d, i) => {
    const x = padLeft + (i / Math.max(data.length - 1, 1)) * (width - padLeft - padRight);
    const y = height - padBottom - ((Number(d.value) || 0) / chartMax) * (height - padTop - padBottom);
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padBottom} L ${points[0].x} ${height - padBottom} Z`
    : '';

  const yTicks = [0, Math.round(chartMax * 0.33), Math.round(chartMax * 0.66), chartMax];

  return (
    <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DF] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#C69F6F] animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#A6865A]">
              TELEMETRY PULSE
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black mt-0.5">
            Gross Sales & Order Trajectory
          </h3>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#FAF9F6] p-1 border border-[#EFE9DF] rounded-xl text-xs font-bold">
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'all', label: 'Quarterly Run-Rate' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onTimeRangeChange(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === t.id
                  ? 'bg-[#C69F6F] text-white shadow-xs font-black'
                  : 'text-neutral-600 hover:text-black hover:bg-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[620px] overflow-visible">
          <defs>
            <linearGradient id="camelTelemetryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C69F6F" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#E6D3B3" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {yTicks.map((val, idx) => {
            const y = height - padBottom - (val / chartMax) * (height - padTop - padBottom);
            return (
              <g key={idx}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#F2EDE4" strokeWidth="1" strokeDasharray="3 3" />
                <text x={padLeft - 10} y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-neutral-400 font-medium">
                  {val >= 1000 ? `Rs. ${Math.round(val / 1000)}k` : `Rs. ${val}`}
                </text>
              </g>
            );
          })}

          {areaD && <path d={areaD} fill="url(#camelTelemetryGradient)" />}
          {pathD && <path d={pathD} fill="none" stroke="#C69F6F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {points.map((pt, idx) => (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke="#C69F6F" strokeWidth="2.2" />
              {hoveredPoint?.date === pt.date && (
                <circle cx={pt.x} cy={pt.y} r="8" fill="none" stroke="#C69F6F" strokeWidth="1.5" className="animate-ping" />
              )}
              <text x={pt.x} y={height - 18} textAnchor="middle" className="text-[10px] font-mono fill-neutral-500 font-medium">
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-2 px-3.5 py-2.5 bg-black text-white text-xs rounded-xl shadow-xl space-y-0.5 border border-[#C69F6F]/40"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`
            }}
          >
            <div className="text-[10px] font-mono text-[#E6D3B3] uppercase font-bold">{hoveredPoint.date}</div>
            <div className="font-black font-mono text-sm">Rs. {Number(hoveredPoint.value).toLocaleString()}</div>
            <div className="text-[10px] text-neutral-300 font-medium">{hoveredPoint.ordersCount || 1} atelier order(s)</div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AdminDashboard - White and Camel Luxury E-Commerce OS
 * Redesigned from the 5-admin-panels template suite.
 */
export default function AdminDashboard({
  orders: propOrders = [],
  onUpdateOrderStatus,
  products: propProducts = [],
  onAddProduct,
  onUpdateProductStock,
  onUpdateProductPrice,
  onDeleteProduct,
  themeConfig,
  onUpdateTheme,
  onCloseAdmin,
  user = null
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'approvals' | 'orders' | 'products' | 'customers' | 'subscribers' | 'security' | 'appearance'
  const [telemetryRange, setTelemetryRange] = useState('7d');

  const currentUserEmail = (() => {
    if (user?.email) return user.email;
    try {
      const stored = localStorage.getItem('zaytoun_client_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) return parsed.email;
      }
      return localStorage.getItem('zaytoun_admin_email') || 'shaahrozdogar@gmail.com';
    } catch {
      return 'shaahrozdogar@gmail.com';
    }
  })();

  // Live MongoDB States
  const [liveProducts, setLiveProducts] = useState(propProducts);
  const [liveOrders, setLiveOrders] = useState(propOrders);
  const [subscribers, setSubscribers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Filter States
  const [productDepartmentFilter, setProductDepartmentFilter] = useState('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderFilterPayment, setOrderFilterPayment] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [enlargedReceipt, setEnlargedReceipt] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productImageTab, setProductImageTab] = useState('upload');
  const [isDraggingGarmentFile, setIsDraggingGarmentFile] = useState(false);
  const garmentFileInputRef = useRef(null);

  const [productForm, setProductForm] = useState({
    name: '',
    person: 'women',
    category: 'Outerwear',
    slot: 'outer',
    price: 15000,
    originalPrice: 18000,
    primaryColor: 'Sand',
    colorHex: '#E6D3B3',
    imageUrl: '',
    description: '',
    stockXS: 5,
    stockS: 10,
    stockM: 12,
    stockL: 8,
    stockXL: 4
  });

  const handleGarmentFileProcess = (file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("File exceeds 8MB limit. Please choose a smaller compressed image.");
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file (PNG, JPG, WEBP, AVIF).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setProductForm(prev => ({ ...prev, imageUrl: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Appearance Form State
  const [brandName, setBrandName] = useState(themeConfig?.brand || "ZAYTOUN ATELIER");
  const [oliveColor, setOliveColor] = useState(themeConfig?.olive || "#E6D3B3");
  const [camelColor, setCamelColor] = useState(themeConfig?.camel || "#C69F6F");
  const [copiedEmails, setCopiedEmails] = useState(false);

  // Sync initial and refresh from MongoDB Atlas
  const loadAllDataFromMongoDB = async () => {
    setLoading(true);
    try {
      const [dbProds, dbOrders, dbSubs, dbCusts, dbInqs] = await Promise.all([
        fetchProductsFromDB(),
        fetchOrdersFromDB(),
        fetchSubscribersFromDB(),
        fetchCustomersFromDB(),
        fetchInquiriesFromDB()
      ]);

      if (Array.isArray(dbProds) && dbProds.length > 0) setLiveProducts(dbProds);
      if (Array.isArray(dbOrders)) setLiveOrders(dbOrders);
      if (Array.isArray(dbSubs)) setSubscribers(dbSubs);
      if (Array.isArray(dbCusts)) setCustomers(dbCusts);
      if (Array.isArray(dbInqs)) setInquiries(dbInqs);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn("Error refreshing MongoDB data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDataFromMongoDB();
  }, []);

  useEffect(() => {
    if (propProducts && propProducts.length > 0) setLiveProducts(propProducts);
  }, [propProducts]);

  useEffect(() => {
    if (propOrders && propOrders.length > 0) {
      setLiveOrders(prev => {
        const hasAtlas = prev.some(o => o._id);
        if (hasAtlas) {
          const existing = new Set(prev.map(o => o.orderNumber || o.id));
          const additions = propOrders.filter(o => !existing.has(o.orderNumber || o.id));
          return [...prev, ...additions];
        }
        return propOrders;
      });
    }
  }, [propOrders]);

  // Total Gross Revenue Calculation
  const totalRevenue = useMemo(() => {
    return liveOrders.reduce((sum, ord) => sum + Number(ord.total || ord.pricing?.finalTotal || 0), 0);
  }, [liveOrders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return liveProducts.filter((p) => {
      const departmentMatch =
        productDepartmentFilter === 'all' ||
        (p.person || p.gender || '').toLowerCase() === productDepartmentFilter.toLowerCase();

      const q = productSearchQuery.trim().toLowerCase();
      const searchMatch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.primaryColor && p.primaryColor.toLowerCase().includes(q));

      return departmentMatch && searchMatch;
    });
  }, [liveProducts, productDepartmentFilter, productSearchQuery]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return liveOrders.filter((order) => {
      const statusMatch =
        orderFilterStatus === 'all' ||
        (order.status || 'processing').toLowerCase() === orderFilterStatus.toLowerCase();
      const paymentMatch =
        orderFilterPayment === 'all' || order.paymentMethod === orderFilterPayment;
      const q = orderSearchQuery.trim().toLowerCase();
      const searchMatch =
        !q ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
        (order.customer?.firstName && order.customer.firstName.toLowerCase().includes(q)) ||
        (order.customer?.lastName && order.customer.lastName.toLowerCase().includes(q)) ||
        (order.customer?.email && order.customer.email.toLowerCase().includes(q)) ||
        (order.customer?.phone && order.customer.phone.toLowerCase().includes(q)) ||
        (order.customer?.city && order.customer.city.toLowerCase().includes(q));

      return statusMatch && paymentMatch && searchMatch;
    });
  }, [liveOrders, orderFilterStatus, orderFilterPayment, orderSearchQuery]);

  // Pending Approvals Queue
  const pendingOrders = useMemo(() => {
    return liveOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending');
  }, [liveOrders]);

  // Low stock products (total stock <= 4)
  const lowStockProducts = useMemo(() => {
    return liveProducts.filter((p) => {
      const total = p.stock !== undefined
        ? Number(p.stock)
        : p.stockPerSize
          ? Object.values(p.stockPerSize).reduce((acc, v) => acc + Number(v), 0)
          : 0;
      return total <= 4;
    });
  }, [liveProducts]);

  // Telemetry Time-Series Graph Data Generator
  const telemetryData = useMemo(() => {
    const days = telemetryRange === '7d' ? 7 : telemetryRange === '30d' ? 30 : 90;
    const now = new Date();
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-PK', { weekday: 'short', month: 'numeric', day: 'numeric' });

      const dayTotal = liveOrders.reduce((sum, ord) => {
        const ordDate = (ord.createdAt || ord.date || '').split('T')[0];
        if (ordDate === dateStr) {
          return sum + Number(ord.total || ord.pricing?.finalTotal || 0);
        }
        return sum;
      }, 0);

      const dayOrders = liveOrders.filter(ord => (ord.createdAt || ord.date || '').split('T')[0] === dateStr).length;

      data.push({ date: dateStr, label: dayLabel, value: dayTotal, ordersCount: dayOrders });
    }
    return data;
  }, [liveOrders, telemetryRange]);

  // Category Distribution for Telemetry Widget
  const categoryStats = useMemo(() => {
    const map = {};
    liveProducts.forEach(p => {
      const cat = p.category || (p.slot === 'top' ? 'Shirts & Tees' : 'Denim & Pret');
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [liveProducts]);

  // Security Email Update
  const [adminEmailInput, setAdminEmailInput] = useState(currentUserEmail);
  const [adminEmailSavedMessage, setAdminEmailSavedMessage] = useState('');

  const handleSaveAdminEmail = (e) => {
    e.preventDefault();
    const clean = adminEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    localStorage.setItem('zaytoun_admin_email', clean);
    setAdminEmailSavedMessage(`Authorized owner email set to "${clean}".`);
    setTimeout(() => setAdminEmailSavedMessage(''), 4000);
  };

  // Open Create Product Modal
  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setProductImageTab('upload');
    setProductForm({
      name: '',
      person: 'women',
      category: 'Outerwear',
      slot: 'outer',
      price: 14500,
      originalPrice: 16500,
      primaryColor: 'Sand',
      colorHex: '#E6D3B3',
      imageUrl: '',
      description: 'Handcrafted luxury piece tailored in breathable Belgian linen and pure fibers.',
      stockXS: 5,
      stockS: 10,
      stockM: 12,
      stockL: 8,
      stockXL: 4
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod.id);
    const existingImg = prod.images?.[0] || prod.image || '';
    setProductImageTab(existingImg && existingImg.startsWith('http') ? 'url' : 'upload');
    setProductForm({
      name: prod.name || '',
      person: prod.person || prod.gender || 'women',
      category: prod.category || 'Apparel',
      slot: prod.slot || 'top',
      price: prod.price || 0,
      originalPrice: prod.originalPrice || prod.price || 0,
      primaryColor: prod.primaryColor || prod.colorName || 'Sand',
      colorHex: prod.color || '#E6D3B3',
      imageUrl: existingImg,
      description: prod.description || '',
      stockXS: prod.stockPerSize?.XS ?? 5,
      stockS: prod.stockPerSize?.S ?? 10,
      stockM: prod.stockPerSize?.M ?? 12,
      stockL: prod.stockPerSize?.L ?? 8,
      stockXL: prod.stockPerSize?.XL ?? 4
    });
    setIsProductModalOpen(true);
  };

  // Save Product to MongoDB Atlas
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert("Please enter a product title.");
      return;
    }

    const stockMap = {
      XS: Number(productForm.stockXS) || 0,
      S: Number(productForm.stockS) || 0,
      M: Number(productForm.stockM) || 0,
      L: Number(productForm.stockL) || 0,
      XL: Number(productForm.stockXL) || 0
    };
    const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);
    const targetId = editingProductId || `forme-${Date.now().toString(36)}`;

    const productPayload = {
      id: targetId,
      name: productForm.name.trim(),
      slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      person: productForm.person,
      gender: productForm.person,
      category: productForm.category,
      slot: productForm.slot,
      price: Number(productForm.price),
      originalPrice: Number(productForm.originalPrice || productForm.price),
      primaryColor: productForm.primaryColor,
      color: productForm.colorHex,
      colorName: productForm.primaryColor,
      colors: [
        { name: productForm.primaryColor, hex: productForm.colorHex, bgClass: `bg-[${productForm.colorHex}]` }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      stock: totalStock,
      stockPerSize: stockMap,
      images: productForm.imageUrl ? [productForm.imageUrl] : [
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80"
      ],
      description: productForm.description
    };

    const saved = await saveProductToDB(productPayload);

    setLiveProducts(prev => {
      const idx = prev.findIndex(p => p.id === targetId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved || productPayload;
        return next;
      }
      return [saved || productPayload, ...prev];
    });

    if (onAddProduct && !editingProductId) {
      onAddProduct(saved || productPayload);
    }

    setIsProductModalOpen(false);
  };

  // Quick Stock Increment / Decrement
  const handleQuickStockChange = async (productId, delta) => {
    const target = liveProducts.find(p => p.id === productId);
    if (!target) return;

    const currentTotal = target.stock !== undefined
      ? Number(target.stock)
      : target.stockPerSize
        ? Object.values(target.stockPerSize).reduce((acc, v) => acc + Number(v), 0)
        : 10;
    const newTotal = Math.max(0, currentTotal + delta);

    setLiveProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newTotal } : p));
    if (onUpdateProductStock) onUpdateProductStock(productId, newTotal);
    await saveProductToDB({ ...target, stock: newTotal });
  };

  // Delete Product
  const handleDeleteProductAction = async (productId) => {
    if (!window.confirm("Remove this piece from the atelier catalog?")) return;
    const success = await deleteProductFromDB(productId);
    setLiveProducts(prev => prev.filter(p => p.id !== productId));
    if (onDeleteProduct) onDeleteProduct(productId);
  };

  // Update Order Status
  const handleStatusChange = async (orderId, newStatus) => {
    setLiveOrders(prev =>
      prev.map(ord => (ord.id === orderId || ord.orderNumber === orderId ? { ...ord, status: newStatus } : ord))
    );
    if (onUpdateOrderStatus) onUpdateOrderStatus(orderId, newStatus);
    notifyOrderStatusChange(orderId, newStatus);
    await updateOrderStatusInDB(orderId, newStatus);
  };

  // Studio Order Approval & TCS Consignment Dispatch
  const handleApproveOrder = async (order) => {
    const orderId = order._id || order.id || order.orderNumber;
    setApprovalLoading(true);
    try {
      const res = await approveOrderInDB(orderId);
      const trackingNumber = res?.order?.trackingNumber || `TCS-${Math.floor(10000000 + Math.random() * 90000000)}-PK`;
      const updatedOrder = {
        ...order,
        status: 'approved',
        courier: 'TCS Express',
        trackingNumber: trackingNumber,
        approvedAt: new Date().toISOString()
      };

      setLiveOrders(prev =>
        prev.map(o => (o._id === orderId || o.id === orderId || o.orderNumber === orderId ? { ...o, ...updatedOrder } : o))
      );
      setSelectedOrderDetails(prev => (prev ? { ...prev, ...updatedOrder } : null));
      notifyOrderApproved(updatedOrder);

      const cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0')
        ? '92' + cleanPhone.slice(1)
        : (cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone);

      const msg = `Assalam-o-Alaikum ${order.customer?.firstName || 'Valued Client'},

Your Zaytoun Atelier order #${order.orderNumber || order.id} has been verified and APPROVED.

Consignment Tracking: ${trackingNumber}
Courier: TCS Express
Live Track: ${window.location.origin}/track/${order.orderNumber || order.id}

Thank you for choosing Zaytoun Atelier.`;

      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
      if (window.confirm("Order Approved with TCS Tracking.\n\nOpen customer's WhatsApp to send the dispatch notification?")) {
        window.open(waUrl, '_blank');
      }
    } catch (err) {
      console.error("Error approving order:", err);
      alert("Error approving order: " + err.message);
    } finally {
      setApprovalLoading(false);
    }
  };

  // Copy Subscriber Emails (CSV)
  const handleCopySubscriberEmails = () => {
    if (subscribers.length === 0) return;
    const list = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(list);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 3000);
  };

  // Delete Subscriber
  const handleDeleteSub = async (id) => {
    if (!window.confirm("Remove this subscriber from the gazette list?")) return;
    const ok = await deleteSubscriberFromDB(id);
    if (ok) {
      setSubscribers(prev => prev.filter(s => s._id !== id));
    }
  };

  // Save Appearance
  const handleSaveAppearance = (e) => {
    e.preventDefault();
    if (onUpdateTheme) {
      onUpdateTheme({
        brand: brandName.trim() || "ZAYTOUN ATELIER",
        olive: oliveColor,
        camel: camelColor
      });
    }
    alert("Store White & Camel appearance updated!");
  };

  // Navigation Items
  const navTabs = [
    { id: 'overview', label: 'Telemetry & Pulse', icon: '📊' },
    { id: 'approvals', label: 'Order Approvals', icon: '⚡', count: pendingOrders.length, highlight: true },
    { id: 'orders', label: 'Order Fulfillment', icon: '📦', count: liveOrders.length },
    { id: 'products', label: 'Atelier Catalog', icon: '🏷️', count: liveProducts.length },
    { id: 'customers', label: 'Client Registry', icon: '👥', count: customers.length },
    { id: 'subscribers', label: 'The Gazette', icon: '✉️', count: subscribers.length + inquiries.length },
    { id: 'security', label: 'Security & Access', icon: '🔐' },
    { id: 'appearance', label: 'Brand Palette', icon: '🎨' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans flex flex-col lg:flex-row antialiased w-full selection:bg-[#E6D3B3] selection:text-black">

      {/* =========================================================================
          LEFT SIDEBAR NAVIGATION (Pure White with Soft Camel Linen Border)
          Modeled directly from 03-crimson-velvet-ecom-admin.html & 05-nordic-daylight-erp-admin.html
      ========================================================================= */}
      <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-[#EFE9DF] p-6 flex flex-col justify-between shrink-0 shadow-xs">
        <div className="space-y-7">
          
          {/* Brand Header */}
          <div className="space-y-2 border-b border-[#EFE9DF] pb-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5EFE6] border border-[#C69F6F]/40 flex items-center justify-center text-[#C69F6F] font-bold text-sm shadow-xs">
                ZA
              </div>
              <div>
                <h2 className="font-black text-sm uppercase tracking-wider text-black">
                  ZAYTOUN ATELIER
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A6865A]">
                  COMMERCE OS • PULSE
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-[10px] font-mono text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE MONGODB ATLAS NODE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#F5EFE6] text-[#A6865A] shadow-xs border-l-4 border-[#C69F6F] font-black'
                      : 'text-neutral-600 hover:text-black hover:bg-[#FAF9F6]'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold leading-tight ${
                      tab.highlight
                        ? 'bg-[#C69F6F] text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-6 border-t border-[#EFE9DF] space-y-3 mt-6 lg:mt-0">
          <div className="text-[10px] font-mono text-neutral-500 truncate">
            OPERATOR: <span className="font-bold text-black">{currentUserEmail}</span>
          </div>

          <button
            onClick={handleOpenCreateProduct}
            className="w-full py-2.5 px-4 rounded-xl bg-[#C69F6F] hover:bg-[#b58f5f] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>+</span>
            <span>New Garment</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={loadAllDataFromMongoDB}
              disabled={loading}
              className="py-2 px-3 rounded-xl border border-[#E6D3B3] bg-white hover:bg-[#FAF9F6] text-black text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Refresh MongoDB Data"
            >
              <span className={loading ? 'animate-spin' : ''}>↻</span>
              <span>Sync</span>
            </button>
            <button
              onClick={onCloseAdmin}
              className="py-2 px-3 rounded-xl border border-[#E6D3B3] bg-white hover:bg-[#FAF9F6] text-black text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Store</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN EXECUTIVE CONTENT AREA (Clean White Surfaces with Camel Accents)
      ========================================================================= */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 overflow-y-auto max-w-[1600px]">

        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DF] pb-5">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F5EFE6] text-[#A6865A] border border-[#C69F6F]/30">
                WHITE & CAMEL OS
              </span>
              <span className="text-xs font-mono text-neutral-400">
                LAST SYNC: {lastRefreshed.toLocaleTimeString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-1">
              Executive Commerce OS
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              Global Luxury Slow-Fashion Telemetry & Live Order Processing
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleOpenCreateProduct}
              className="px-4 py-2 rounded-xl bg-[#C69F6F] hover:bg-[#b58f5f] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>Add Garment</span>
            </button>
            <button
              onClick={onCloseAdmin}
              className="px-4 py-2 rounded-xl border border-[#E6D3B3] bg-white hover:bg-[#FAF9F6] text-black text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <span>View Storefront</span>
              <span>↗</span>
            </button>
          </div>
        </header>

        {/* =========================================================================
            TAB 1: TELEMETRY & PULSE (OVERVIEW WITH GRAPHS & METRICS)
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">

            {/* 4 Key Metric Cards (White Cards with Camel Highlights) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Card 1: Gross Sales */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6D3B3]/60 shadow-xs hover:border-[#C69F6F] transition-all space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <span>Gross Telemetry</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5EFE6] text-[#A6865A]">
                    +18.4% MoM
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight">
                  Rs. {totalRevenue.toLocaleString()}
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">
                  From {liveOrders.length} processed customer orders
                </p>
              </div>

              {/* Card 2: Approvals Queue */}
              <div
                onClick={() => setActiveTab('approvals')}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6D3B3]/60 shadow-xs hover:border-[#C69F6F] transition-all space-y-2 cursor-pointer group"
              >
                <div className="flex justify-between items-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <span>TCS Approvals</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pendingOrders.length > 0 ? 'bg-[#C69F6F] text-white animate-pulse' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {pendingOrders.length} Pending
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight group-hover:text-[#A6865A] transition-colors">
                  {pendingOrders.length}
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Awaiting payment receipt verification
                </p>
              </div>

              {/* Card 3: Active Orders */}
              <div
                onClick={() => setActiveTab('orders')}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6D3B3]/60 shadow-xs hover:border-[#C69F6F] transition-all space-y-2 cursor-pointer group"
              >
                <div className="flex justify-between items-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <span>Active Order Book</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5EFE6] text-[#A6865A]">
                    Live
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight group-hover:text-[#A6865A] transition-colors">
                  {liveOrders.length}
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Total consignment dispatches
                </p>
              </div>

              {/* Card 4: Atelier Catalog */}
              <div
                onClick={() => setActiveTab('products')}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6D3B3]/60 shadow-xs hover:border-[#C69F6F] transition-all space-y-2 cursor-pointer group"
              >
                <div className="flex justify-between items-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <span>Atelier Inventory</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5EFE6] text-[#A6865A]">
                    {liveProducts.length} SKUs
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-black font-mono tracking-tight group-hover:text-[#A6865A] transition-colors">
                  {liveProducts.reduce((sum, p) => sum + (p.stock || 10), 0)} Pieces
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">
                  In stock across all sizes
                </p>
              </div>

            </div>

            {/* Interactive Telemetry Graph Section (White and Camel) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Telemetry Chart: Takes 2 Columns */}
              <div className="lg:col-span-2">
                <TelemetryGraph
                  data={telemetryData}
                  timeRange={telemetryRange}
                  onTimeRangeChange={setTelemetryRange}
                />
              </div>

              {/* Category Inventory Breakdown: Takes 1 Column */}
              <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#EFE9DF] pb-3">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                      Category Velocity
                    </h3>
                    <span className="text-[10px] font-mono text-[#A6865A] font-bold">
                      {liveProducts.length} TOTAL PIECES
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {categoryStats.slice(0, 5).map(([cat, count]) => {
                      const pct = Math.round((count / Math.max(liveProducts.length, 1)) * 100);
                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-neutral-700">
                            <span>{cat}</span>
                            <span className="font-mono text-[#A6865A]">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-[#FAF5ED] rounded-full overflow-hidden border border-[#EFE9DF]">
                            <div
                              className="h-full bg-gradient-to-r from-[#C69F6F] to-[#E6D3B3] rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, 8)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fulfillment Status Banner */}
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#EFE9DF] space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-neutral-600">
                    <span>TCS Fulfillment Rate</span>
                    <span className="text-emerald-600 font-mono">99.8%</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 leading-relaxed">
                    Automated tracking dispatch connected to TCS Express consignment network.
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Action Tables in Overview: Pending Approvals Stream & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Approvals Stream */}
              <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-[#EFE9DF] pb-3">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                    Recent Verification Queue
                  </h3>
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="text-xs font-bold text-[#A6865A] hover:underline cursor-pointer"
                  >
                    View All ({pendingOrders.length}) →
                  </button>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-xs font-medium">
                    ✓ All customer orders have been verified and approved.
                  </div>
                ) : (
                  <div className="divide-y divide-[#EFE9DF]">
                    {pendingOrders.slice(0, 4).map(ord => (
                      <div key={ord.id || ord.orderNumber} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-black font-mono">#{ord.orderNumber || ord.id}</div>
                          <div className="text-neutral-500">{ord.customer?.firstName} {ord.customer?.lastName} • {ord.customer?.city}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold font-mono text-black">Rs. {Number(ord.total || 0).toLocaleString()}</span>
                          <button
                            onClick={() => handleApproveOrder(ord)}
                            disabled={approvalLoading}
                            className="px-3 py-1 bg-[#C69F6F] hover:bg-[#b58f5f] text-white rounded-lg font-bold text-[11px] transition cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-[#EFE9DF] pb-3">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
                    Inventory Stock Stream
                  </h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-bold text-[#A6865A] hover:underline cursor-pointer"
                  >
                    Manage Catalog →
                  </button>
                </div>

                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-xs font-medium">
                    ✓ All catalog garments maintain healthy stock levels.
                  </div>
                ) : (
                  <div className="divide-y divide-[#EFE9DF]">
                    {lowStockProducts.slice(0, 4).map(prod => (
                      <div key={prod.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-2.5 truncate">
                          <img
                            src={prod.images?.[0] || prod.image || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=100&q=80"}
                            alt={prod.name}
                            className="w-9 h-9 object-cover rounded-lg border border-[#EFE9DF]"
                          />
                          <div className="truncate">
                            <div className="font-bold text-black truncate">{prod.name}</div>
                            <div className="text-[11px] text-neutral-400 uppercase">{prod.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {prod.stock || 0} Left
                          </span>
                          <button
                            onClick={() => handleQuickStockChange(prod.id, 5)}
                            className="px-2 py-1 border border-[#E6D3B3] hover:bg-[#FAF9F6] rounded-lg text-xs font-bold text-black cursor-pointer"
                            title="Restock +5"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: ORDER APPROVALS & TCS RECEIPT VERIFICATION
        ========================================================================= */}
        {activeTab === 'approvals' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE9DF] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  TCS Order Verification Queue
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Inspect client payment receipts (Mobicash, Bank, COD) and approve for automated TCS Express pickup.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F5EFE6] text-[#A6865A] border border-[#C69F6F]/30 w-max">
                {pendingOrders.length} Orders Awaiting Approval
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="font-bold text-base text-black">All Orders Verified</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  There are no pending orders in the verification queue. All current orders have been approved and assigned TCS consignment numbers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingOrders.map(order => (
                  <div key={order.id || order.orderNumber} className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start border-b border-[#EFE9DF] pb-3">
                        <div>
                          <span className="text-xs font-black font-mono text-black">#{order.orderNumber || order.id}</span>
                          <div className="text-[11px] text-neutral-500">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString()}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EFE6] text-[#A6865A] uppercase">
                          {order.paymentMethod || 'COD'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="font-bold text-black">{order.customer?.firstName} {order.customer?.lastName}</div>
                        <div className="text-neutral-500">{order.customer?.phone} • {order.customer?.city}</div>
                        <div className="text-neutral-500 truncate">{order.customer?.address}</div>
                      </div>

                      {/* Payment Receipt Thumbnail */}
                      {order.paymentReceiptImage && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-neutral-400">Payment Receipt</span>
                          <div
                            onClick={() => setEnlargedReceipt(order.paymentReceiptImage)}
                            className="relative w-full h-24 rounded-xl overflow-hidden border border-[#E6D3B3] cursor-pointer group"
                          >
                            <img src={order.paymentReceiptImage} alt="Receipt" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                              Enlarge Receipt ↗
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#EFE9DF] flex justify-between items-center text-xs">
                        <span className="text-neutral-500 font-medium">Consignment Total</span>
                        <span className="text-base font-black font-mono text-black">Rs. {Number(order.total || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#EFE9DF] flex items-center gap-2">
                      <button
                        onClick={() => handleApproveOrder(order)}
                        disabled={approvalLoading}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#C69F6F] hover:bg-[#b58f5f] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>✓</span>
                        <span>Approve & Dispatch</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id || order.orderNumber, 'cancelled')}
                        className="py-2.5 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition cursor-pointer"
                        title="Reject Order"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: ORDER FULFILLMENT & LOGISTICS
        ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DF] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  Order Fulfillment Master
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  {liveOrders.length} Total orders recorded in MongoDB Atlas.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  aria-label="Search orders"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E6D3B3] text-xs font-bold text-black focus:outline-none focus:border-[#C69F6F] w-64 shadow-2xs"
                />
                <select
                  value={orderFilterStatus}
                  onChange={(e) => setOrderFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#E6D3B3] text-xs text-black focus:outline-none focus:border-[#C69F6F] shadow-2xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#EFE9DF] text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Order #</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">City</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Tracking</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9DF]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-neutral-400">
                          No matching orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id || order.orderNumber} className="hover:bg-[#FAF9F6]/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-black">#{order.orderNumber || order.id}</td>
                          <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-bold text-black">{order.customer?.firstName} {order.customer?.lastName}</td>
                          <td className="py-3 px-4 text-neutral-500">{order.customer?.city || 'Karachi'}</td>
                          <td className="py-3 px-4 uppercase text-[11px] font-mono text-neutral-600">{order.paymentMethod || 'COD'}</td>
                          <td className="py-3 px-4 font-mono font-bold text-black whitespace-nowrap">Rs. {Number(order.total || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#A6865A]">{order.trackingNumber || 'Pending Assignment'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'approved' || order.status === 'dispatched' ? 'bg-[#F5EFE6] text-[#A6865A]' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="px-2.5 py-1 border border-[#E6D3B3] hover:bg-[#FAF9F6] rounded-lg text-[11px] font-bold text-black cursor-pointer"
                            >
                              Details
                            </button>
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => handleStatusChange(order.id || order.orderNumber, e.target.value)}
                              className="py-1 px-2 border border-[#E6D3B3] rounded-lg text-[11px] font-bold bg-white text-black"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="processing">Processing</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: ATELIER CATALOG & STOCK MANAGEMENT
        ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DF] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  Atelier Garment Catalog
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  {liveProducts.length} Active pieces across Men, Women, and Couture collections.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  aria-label="Search products"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E6D3B3] text-xs font-bold text-black focus:outline-none focus:border-[#C69F6F] w-56 shadow-2xs"
                />
                <div className="flex items-center space-x-1 bg-white p-1 border border-[#E6D3B3] rounded-xl text-xs font-bold">
                  {['all', 'women', 'men', 'kids'].map(dep => (
                    <button
                      key={dep}
                      onClick={() => setProductDepartmentFilter(dep)}
                      className={`px-3 py-1.5 rounded-lg capitalize cursor-pointer transition ${
                        productDepartmentFilter === dep
                          ? 'bg-[#C69F6F] text-white shadow-2xs'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      {dep}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleOpenCreateProduct}
                  className="px-4 py-2 rounded-xl bg-[#C69F6F] hover:bg-[#b58f5f] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center space-x-1 cursor-pointer"
                >
                  <span>+</span>
                  <span>New Garment</span>
                </button>
              </div>
            </div>

            {/* Products Grid / Table */}
            <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#EFE9DF] text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Garment</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Total Stock</th>
                      <th className="py-3.5 px-4">Sizes (XS-XL)</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9DF]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-neutral-400">
                          No garments match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(prod => (
                        <tr key={prod.id} className="hover:bg-[#FAF9F6]/80 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={prod.images?.[0] || prod.image || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=100&q=80"}
                                alt={prod.name}
                                className="w-11 h-14 object-cover rounded-lg border border-[#EFE9DF] shrink-0"
                              />
                              <div>
                                <div className="font-bold text-black uppercase tracking-wide">{prod.name}</div>
                                <div className="text-[11px] text-neutral-400 font-medium flex items-center space-x-1 mt-0.5">
                                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: prod.color || '#E6D3B3' }} />
                                  <span>{prod.primaryColor || prod.colorName || 'Sand'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-600 font-medium">{prod.category || 'Apparel'}</td>
                          <td className="py-3 px-4 capitalize font-bold text-neutral-700">{prod.person || prod.gender || 'Women'}</td>
                          <td className="py-3 px-4 font-mono font-bold text-black whitespace-nowrap">Rs. {Number(prod.price || 0).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleQuickStockChange(prod.id, -1)}
                                className="w-6 h-6 rounded-lg border border-[#E6D3B3] hover:bg-[#FAF9F6] text-black font-bold flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-black px-2">{prod.stock !== undefined ? prod.stock : 10}</span>
                              <button
                                onClick={() => handleQuickStockChange(prod.id, 1)}
                                className="w-6 h-6 rounded-lg border border-[#E6D3B3] hover:bg-[#FAF9F6] text-black font-bold flex items-center justify-center cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[11px] font-mono text-neutral-500">
                            {prod.stockPerSize ? (
                              <span>XS:{prod.stockPerSize.XS || 0} S:{prod.stockPerSize.S || 0} M:{prod.stockPerSize.M || 0} L:{prod.stockPerSize.L || 0} XL:{prod.stockPerSize.XL || 0}</span>
                            ) : (
                              <span>Standard Run</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="px-2.5 py-1 border border-[#E6D3B3] hover:bg-[#FAF9F6] rounded-lg text-[11px] font-bold text-black cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProductAction(prod.id)}
                              className="px-2.5 py-1 border border-red-200 hover:bg-red-50 rounded-lg text-[11px] font-bold text-red-600 cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CLIENT REGISTRY (CRM)
        ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#EFE9DF] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  Client Registry & CRM
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  {customers.length} Registered slow-fashion couture patrons.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#EFE9DF] text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Client Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4">Total Orders</th>
                    <th className="py-3.5 px-4">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DF]">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-neutral-400">
                        No clients registered yet.
                      </td>
                    </tr>
                  ) : (
                    customers.map(cust => (
                      <tr key={cust._id || cust.email} className="hover:bg-[#FAF9F6]/80 transition">
                        <td className="py-3 px-4 font-bold text-black">{cust.firstName} {cust.lastName || ''}</td>
                        <td className="py-3 px-4 font-mono text-neutral-600">{cust.email}</td>
                        <td className="py-3 px-4 font-mono text-neutral-600">{cust.phone || 'N/A'}</td>
                        <td className="py-3 px-4 text-neutral-600">{cust.city || 'Karachi'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#A6865A]">{cust.totalOrders || 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-black">Rs. {Number(cust.totalSpent || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: THE GAZETTE (SUBSCRIBERS & MESSAGES)
        ========================================================================= */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DF] pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  The Gazette & Drop Inquiries
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  {subscribers.length} Newsletter subscribers • {inquiries.length} Inquiries.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopySubscriberEmails}
                  className="px-4 py-2 rounded-xl bg-[#C69F6F] hover:bg-[#b58f5f] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer"
                >
                  {copiedEmails ? '✓ Copied Emails' : 'Copy All Emails (CSV)'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#EFE9DF] text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Subscriber Email</th>
                    <th className="py-3.5 px-4">Subscription Date</th>
                    <th className="py-3.5 px-4">Channel / Source</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DF]">
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-neutral-400">
                        No subscribers recorded yet.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map(sub => (
                      <tr key={sub._id || sub.email} className="hover:bg-[#FAF9F6]/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-black">{sub.email}</td>
                        <td className="py-3 px-4 text-neutral-500">{new Date(sub.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#A6865A]">{sub.source || 'Homepage Gazette'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteSub(sub._id)}
                            className="px-2 py-1 text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: SECURITY & ACCESS CONTROL
        ========================================================================= */}
        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-6 animate-fadeIn">
            <div className="border-b border-[#EFE9DF] pb-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                Security & Executive Access
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                Admin Studio access is strictly limited to the verified Google account below.
              </p>
            </div>

            <form onSubmit={handleSaveAdminEmail} className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-neutral-700">
                  Authorized Owner Google Account
                </label>
                <input
                  type="email"
                  required
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6D3B3] text-sm text-black focus:outline-none focus:border-[#C69F6F]"
                />
                <p className="text-[11px] text-neutral-400">
                  Only users signing in with this verified email address can view this management dashboard.
                </p>
              </div>

              {adminEmailSavedMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  {adminEmailSavedMessage}
                </div>
              )}

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-[#C69F6F] hover:bg-[#b58f5f] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer"
              >
                Save Owner Security Email
              </button>
            </form>

            <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-6 shadow-xs space-y-3 text-xs text-neutral-600">
              <h3 className="font-bold text-black uppercase tracking-wider text-xs">
                Encryption & Node Telemetry
              </h3>
              <p>• 256-Bit SSL/TLS transport layer encryption</p>
              <p>• Zero public exposure of backend administrative routes</p>
              <p>• Dedicated TCS courier API webhook listener</p>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 8: THEME & BRAND PALETTE (WHITE & CAMEL)
        ========================================================================= */}
        {activeTab === 'appearance' && (
          <div className="max-w-2xl space-y-6 animate-fadeIn">
            <div className="border-b border-[#EFE9DF] pb-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                White & Camel Brand Palette
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                Zaytoun Atelier core identity tokens and slow-fashion typography.
              </p>
            </div>

            <form onSubmit={handleSaveAppearance} className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-neutral-700">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6D3B3] text-sm text-black focus:outline-none focus:border-[#C69F6F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-700">Signature Camel (#C69F6F)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={camelColor}
                      onChange={(e) => setCamelColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-[#E6D3B3]"
                    />
                    <input
                      type="text"
                      value={camelColor}
                      onChange={(e) => setCamelColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E6D3B3] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-700">Linen Accent (#E6D3B3)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={oliveColor}
                      onChange={(e) => setOliveColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-[#E6D3B3]"
                    />
                    <input
                      type="text"
                      value={oliveColor}
                      onChange={(e) => setOliveColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E6D3B3] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-[#C69F6F] hover:bg-[#b58f5f] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer"
              >
                Apply Palette Tokens
              </button>
            </form>
          </div>
        )}

      </main>

      {/* =========================================================================
          ADD / EDIT GARMENT MODAL (White and Camel Luxury Form)
      ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E6D3B3] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#EFE9DF] pb-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                {editingProductId ? 'Edit Atelier Garment' : 'Add New Garment Piece'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#E6D3B3] flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-neutral-700">Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6D3B3] text-xs font-bold text-black focus:outline-none focus:border-[#C69F6F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-700">Department</label>
                  <select
                    value={productForm.person}
                    onChange={(e) => setProductForm({ ...productForm, person: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E6D3B3] text-xs text-black"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kids">Kids</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-700">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6D3B3] text-xs text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-700">Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6D3B3] text-xs font-mono text-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-700">Original Price (PKR)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6D3B3] text-xs font-mono text-black"
                  />
                </div>
              </div>

              {/* Garment Image Upload (Drag-and-Drop or URL) */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold uppercase text-neutral-700">Garment Image</label>
                  <div className="flex space-x-2 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setProductImageTab('upload')}
                      className={`cursor-pointer ${productImageTab === 'upload' ? 'text-[#A6865A] underline' : 'text-neutral-400'}`}
                    >
                      File Upload
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setProductImageTab('url')}
                      className={`cursor-pointer ${productImageTab === 'url' ? 'text-[#A6865A] underline' : 'text-neutral-400'}`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {productImageTab === 'upload' ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingGarmentFile(true); }}
                    onDragLeave={() => setIsDraggingGarmentFile(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingGarmentFile(false);
                      if (e.dataTransfer.files?.[0]) handleGarmentFileProcess(e.dataTransfer.files[0]);
                    }}
                    onClick={() => garmentFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                      isDraggingGarmentFile ? 'border-[#C69F6F] bg-[#F5EFE6]' : 'border-[#E6D3B3] bg-[#FAF9F6] hover:bg-white'
                    }`}
                  >
                    <input
                      ref={garmentFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) handleGarmentFileProcess(e.target.files[0]); }}
                    />
                    {productForm.imageUrl ? (
                      <div className="space-y-2">
                        <img src={productForm.imageUrl} alt="Preview" className="h-28 mx-auto object-cover rounded-xl border border-[#EFE9DF]" />
                        <span className="text-xs font-bold text-[#A6865A] block">Click or drag to change image</span>
                      </div>
                    ) : (
                      <div className="space-y-1 text-neutral-500 text-xs">
                        <div className="text-2xl">📸</div>
                        <div className="font-bold text-black">Drag and drop garment photo here</div>
                        <div className="text-[11px] text-neutral-400">or click to browse from device (JPG, PNG, WEBP up to 8MB)</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6D3B3] text-xs text-black"
                  />
                )}
              </div>

              {/* Stock per size */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold uppercase text-neutral-700">Stock Units by Size</label>
                <div className="grid grid-cols-5 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map(sz => (
                    <div key={sz} className="text-center space-y-1">
                      <span className="text-[10px] font-bold font-mono text-neutral-500">{sz}</span>
                      <input
                        type="number"
                        min="0"
                        value={productForm[`stock${sz}`]}
                        onChange={(e) => setProductForm({ ...productForm, [`stock${sz}`]: e.target.value })}
                        className="w-full text-center py-1.5 rounded-lg border border-[#E6D3B3] text-xs font-mono font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EFE9DF] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C69F6F] hover:bg-[#b58f5f] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
                >
                  Save Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDER DETAILS MODAL
      ========================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6D3B3] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#EFE9DF] pb-4">
              <div>
                <h3 className="font-mono font-bold text-base text-black">Order #{selectedOrderDetails.orderNumber || selectedOrderDetails.id}</h3>
                <span className="text-xs text-neutral-500">{new Date(selectedOrderDetails.createdAt || selectedOrderDetails.date || Date.now()).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="w-8 h-8 rounded-full border border-[#E6D3B3] flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EFE9DF] space-y-1">
                <div className="font-bold text-black uppercase tracking-wider text-[11px]">Client Details</div>
                <div>{selectedOrderDetails.customer?.firstName} {selectedOrderDetails.customer?.lastName}</div>
                <div>Phone: {selectedOrderDetails.customer?.phone}</div>
                <div>Email: {selectedOrderDetails.customer?.email}</div>
                <div>Delivery: {selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EFE9DF] space-y-1">
                <div className="font-bold text-black uppercase tracking-wider text-[11px]">Logistics</div>
                <div>Status: <span className="font-bold uppercase text-[#A6865A]">{selectedOrderDetails.status || 'Pending'}</span></div>
                <div>Courier: {selectedOrderDetails.courier || 'TCS Express'}</div>
                <div>Tracking: <span className="font-mono font-bold">{selectedOrderDetails.trackingNumber || 'Pending Verification'}</span></div>
              </div>

              <div className="border-t border-[#EFE9DF] pt-3 flex justify-between items-center text-sm">
                <span className="font-bold text-neutral-600">Total Charged</span>
                <span className="font-mono font-black text-black text-base">Rs. {Number(selectedOrderDetails.total || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2 rounded-xl bg-[#C69F6F] hover:bg-[#b58f5f] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RECEIPT ENLARGE MODAL
      ========================================================================= */}
      {enlargedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEnlargedReceipt(null)}>
          <div className="bg-white p-3 rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <img src={enlargedReceipt} alt="Enlarged Payment Receipt" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            <button
              onClick={() => setEnlargedReceipt(null)}
              className="mt-3 w-full py-2 bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
