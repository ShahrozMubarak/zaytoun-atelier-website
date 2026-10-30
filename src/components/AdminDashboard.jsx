import React, { useState, useEffect, useMemo, useRef } from 'react';
import BrandLogo from './BrandLogo';// Executive 3D Analytics Section with Perspective Depth Cards and Dynamic SVG Charts

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

  // Products Tab Filter: 'all' | 'women' | 'men' | 'kids'
  const [productDepartmentFilter, setProductDepartmentFilter] = useState('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Orders Tab Filters
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderFilterPayment, setOrderFilterPayment] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [enlargedReceipt, setEnlargedReceipt] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productImageTab, setProductImageTab] = useState('upload'); // 'upload' (Choose File) | 'url'
  const [isDraggingGarmentFile, setIsDraggingGarmentFile] = useState(false);
  const garmentFileInputRef = useRef(null);

  const [productForm, setProductForm] = useState({
    name: '',
    person: 'women', // 'women' | 'men' | 'kids'
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

  // Handle local garment photo upload from PC or Mobile device
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
  const [linenColor, setLinenColor] = useState(themeConfig?.linen || "#FAF8F5");
  const [onyxColor, setOnyxColor] = useState(themeConfig?.onyx || "#111315");
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

  // Update when parent props change
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

  // Total Revenue Calculation from Orders
  const totalRevenue = useMemo(() => {
    return liveOrders.reduce((sum, ord) => sum + Number(ord.total || ord.pricing?.finalTotal || 0), 0);
  }, [liveOrders]);

  // Filtered Products by Department & Search
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

  // Low Stock Items in Catalog (<= 4 available)
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

  // Pending Orders Queue
  const pendingOrders = useMemo(() => {
    return liveOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending');
  }, [liveOrders]);

  // Order Status Distribution
  const statusStats = useMemo(() => {
    const counts = { pending: 0, approved: 0, processing: 0, dispatched: 0, delivered: 0, cancelled: 0 };
    liveOrders.forEach(o => {
      const st = (o.status || 'pending').toLowerCase();
      if (counts[st] !== undefined) counts[st]++;
      else counts.pending++;
    });
    return counts;
  }, [liveOrders]);

  // Payment Methods Distribution
  const paymentStats = useMemo(() => {
    const counts = { cod: 0, jazzcash: 0, easypaisa: 0, card: 0 };
    liveOrders.forEach(o => {
      const pm = (o.paymentMethod || 'cod').toLowerCase();
      if (counts[pm] !== undefined) counts[pm]++;
      else counts.cod++;
    });
    return counts;
  }, [liveOrders]);

  // 7-Day Revenue Trajectory
  const revenueChartData = useMemo(() => {
    const days = 7;
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

      data.push({ date: dateStr, label: dayLabel, revenue: dayTotal });
    }
    return data;
  }, [liveOrders]);

  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  // SVG Chart Dimensions (Optimized for PC Widescreen & Tablet/Mobile)
  const chartWidth = 1000;
  const chartHeight = 280;
  const paddingX = 50;
  const paddingY = 35;

  const maxChartRevenue = useMemo(() => {
    const maxVal = Math.max(...revenueChartData.map(d => d.revenue), 0);
    return maxVal === 0 ? 50000 : Math.ceil(maxVal * 1.25);
  }, [revenueChartData]);

  const chartPoints = useMemo(() => {
    const usableWidth = chartWidth - paddingX * 2;
    const usableHeight = chartHeight - paddingY * 2;
    const step = usableWidth / (revenueChartData.length - 1 || 1);

    return revenueChartData.map((d, idx) => {
      const x = paddingX + idx * step;
      const y = chartHeight - paddingY - (d.revenue / maxChartRevenue) * usableHeight;
      return { ...d, x, y };
    });
  }, [revenueChartData, maxChartRevenue]);

  const svgPathD = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [chartPoints]);

  const svgAreaD = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const lastX = chartPoints[chartPoints.length - 1].x;
    const firstX = chartPoints[0].x;
    const bottomY = chartHeight - paddingY;
    return `${svgPathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [svgPathD, chartPoints, chartHeight, paddingY]);

  // Security Tab Settings
  const [adminEmailInput, setAdminEmailInput] = useState(() => {
    try {
      return localStorage.getItem('zaytoun_admin_email') || 'shaahrozdogar@gmail.com';
    } catch {
      return 'shaahrozdogar@gmail.com';
    }
  });
  const [adminEmailSavedMessage, setAdminEmailSavedMessage] = useState('');

  const handleSaveAdminEmail = (e) => {
    e.preventDefault();
    const clean = adminEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    localStorage.setItem('zaytoun_admin_email', clean);
    setAdminEmailSavedMessage(`Authorized owner email updated to "${clean}". Studio access is strictly limited to this Google account.`);
    setTimeout(() => setAdminEmailSavedMessage(''), 5000);
  };

  // Open Create Product Modal
  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setProductImageTab('upload');
    setProductForm({
      name: '',
      person: 'women',
      category: 'Women\'s Pret',
      slot: 'top',
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

    // Update in MongoDB
    const saved = await saveProductToDB(productPayload);
    
    // Update local state
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
    alert(`Garment "${productForm.name}" saved successfully.`);
  };

  // Delete Garment
  const handleDeleteProductClick = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the atelier catalog?`)) return;
    
    const success = await deleteProductFromDB(productId);
    setLiveProducts(prev => prev.filter(p => p.id !== productId));
    if (onDeleteProduct) onDeleteProduct(productId);

    if (success) {
      alert("Garment removed from catalog.");
    }
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

  // Studio Order Approval & Live Tracking Activation
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

      // Real System Notification for Order Approval
      notifyOrderApproved(updatedOrder);

      // Compose pre-filled customer WhatsApp alert message
      const cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0')
        ? '92' + cleanPhone.slice(1)
        : (cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone);

      const msg = `Assalam-o-Alaikum ${order.customer?.firstName || 'Valued Client'},

Your Zaytoun Atelier order #${order.orderNumber || order.id} has been verified and APPROVED by our studio concierge.

Consignment Tracking #: ${trackingNumber}
Courier: TCS Express
Live Track: ${window.location.origin}/track/${order.orderNumber || order.id}

Thank you for choosing Zaytoun Atelier craftsmanship.`;

      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;

      if (window.confirm("Order Approved. TCS tracking number generated.\n\nOpen customer's WhatsApp to send the notification now?")) {
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
        brand: brandName.trim() || "ZAYTOUN & CO.",
        olive: oliveColor,
        camel: camelColor,
        linen: linenColor,
        onyx: onyxColor
      });
    }
    alert("Store appearance and palette updated!");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-black dark:text-white font-sans flex flex-col transition-colors w-full overflow-x-hidden">
      
      {/* Website-Style Admin Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-onyx-950 border-b border-neutral-200 dark:border-onyx-800 transition-colors shadow-sm">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-6">
          
          {/* Brand Logo - Same bespoke luxury wordmark & monogram as website */}
          <div className="shrink-0 flex items-center">
            <BrandLogo size="md" />
          </div>

          {/* Simple Text Tabs - Identical style to website navigation links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'approvals', label: 'Approvals', count: pendingOrders.length, highlight: true },
              { id: 'orders', label: 'Orders', count: liveOrders.length },
              { id: 'products', label: 'Catalog', count: liveProducts.length },
              { id: 'customers', label: 'Clients', count: customers.length },
              { id: 'subscribers', label: 'Gazette', count: subscribers.length + inquiries.length },
              { id: 'security', label: 'Security' },
              { id: 'appearance', label: 'Theme' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs sm:text-sm font-bold uppercase tracking-wider transition-all py-1.5 flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'text-black dark:text-[#E6D3B3] border-b-2 border-black dark:border-[#E6D3B3] font-black'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-tight ${
                      tab.highlight
                        ? 'bg-amber-500 text-black'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Clean Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              onClick={handleOpenCreateProduct}
              className="px-3 sm:px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-[#C69F6F] dark:hover:bg-[#b58f5f] dark:text-black text-xs font-bold uppercase tracking-wider rounded-none transition shadow-sm cursor-pointer flex items-center space-x-1.5"
            >
              <span>+</span>
              <span>New Garment</span>
            </button>
            <button
              onClick={loadAllDataFromMongoDB}
              disabled={loading}
              className="p-2 sm:px-2.5 sm:py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-onyx-900 hover:border-black dark:hover:border-white text-black dark:text-white text-xs font-bold uppercase tracking-wider rounded-none transition cursor-pointer flex items-center space-x-1.5"
              title="Sync Live Data"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onCloseAdmin}
              className="px-3 sm:px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-onyx-900 hover:border-black dark:hover:border-white text-black dark:text-white text-xs font-bold uppercase tracking-wider rounded-none transition cursor-pointer flex items-center space-x-1"
            >
              <span>Storefront</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Tab Strip */}
        <div className="lg:hidden border-t border-neutral-200 dark:border-onyx-800 bg-white dark:bg-onyx-950 px-3 sm:px-6 py-2 flex items-center space-x-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'approvals', label: 'Approvals', count: pendingOrders.length, highlight: true },
            { id: 'orders', label: 'Orders', count: liveOrders.length },
            { id: 'products', label: 'Catalog', count: liveProducts.length },
            { id: 'customers', label: 'Clients', count: customers.length },
            { id: 'subscribers', label: 'Gazette', count: subscribers.length + inquiries.length },
            { id: 'security', label: 'Security' },
            { id: 'appearance', label: 'Theme' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap py-1 transition-all flex items-center space-x-1 cursor-pointer ${
                  isActive
                    ? 'text-black dark:text-[#E6D3B3] border-b-2 border-black dark:border-[#E6D3B3] font-black'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold leading-tight ${
                    tab.highlight
                      ? 'bg-amber-500 text-black'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container - PC Wide Screen Optimized */}
      <main className="max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 flex-1 space-y-8">
        
        {/* =========================================================================
            TAB 1: VISUAL ANALYTICS & INTERACTIVE REVENUE GRAPH
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 6 Key Metrics Cards (Responsive PC & Mobile Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
              <div className="p-4 sm:p-5 rounded-none bg-[#F5EDE1] dark:bg-[#201B16] border-2 border-[#C69F6F]/45 shadow-xs hover:border-[#C69F6F] transition-all">
                <span className="text-[11px] font-mono uppercase font-black text-[#8C6D45] dark:text-[#C69F6F] tracking-widest block truncate">
                  Total Sales
                </span>
                <p className="text-lg sm:text-xl xl:text-2xl font-black text-black dark:text-[#E6D3B3] mt-2 font-mono tracking-tight truncate">
                  Rs. {totalRevenue.toLocaleString()}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-none bg-[#F5EDE1] dark:bg-[#201B16] border-2 border-[#C69F6F]/45 shadow-xs hover:border-[#C69F6F] transition-all">
                <span className="text-[11px] font-mono uppercase font-black text-[#8C6D45] dark:text-[#C69F6F] tracking-widest block truncate">
                  Approvals
                </span>
                <p className="text-lg sm:text-xl xl:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight truncate">
                  {pendingOrders.length}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-none bg-[#F5EDE1] dark:bg-[#201B16] border-2 border-[#C69F6F]/45 shadow-xs hover:border-[#C69F6F] transition-all">
                <span className="text-[11px] font-mono uppercase font-black text-[#8C6D45] dark:text-[#C69F6F] tracking-widest block truncate">
                  Orders
                </span>
                <p className="text-lg sm:text-xl xl:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight truncate">
                  {liveOrders.length}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-none bg-[#F5EDE1] dark:bg-[#201B16] border-2 border-[#C69F6F]/45 shadow-xs hover:border-[#C69F6F] transition-all">
                <span className="text-[11px] font-mono uppercase font-black text-[#8C6D45] dark:text-[#C69F6F] tracking-widest block truncate">
                  Catalog
                </span>
                <p className="text-lg sm:text-xl xl:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight truncate">
                  {liveProducts.length}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-none bg-[#F5EDE1] dark:bg-[#201B16] border-2 border-[#C69F6F]/45 shadow-xs hover:border-[#C69F6F] transition-all">
                <span className="text-[11px] font-mono uppercase font-black text-[#8C6D45] dark:text-[#C69F6F] tracking-widest block truncate">
                  Clients
                </span>
                <p className="text-lg sm:text-xl xl:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight truncate">
                  {customers.length}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-none bg-[#F5EDE1] dark:bg-[#201B16] border-2 border-[#C69F6F]/45 shadow-xs hover:border-[#C69F6F] transition-all">
                <span className="text-[11px] font-mono uppercase font-black text-[#8C6D45] dark:text-[#C69F6F] tracking-widest block truncate">
                  Gazette
                </span>
                <p className="text-lg sm:text-xl xl:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight truncate">
                  {subscribers.length}
                </p>
              </div>
            </div>

            {/* Revenue Trajectory Graph (7 Days) - Camel Luxury Container */}
            <div className="p-6 sm:p-8 rounded-none bg-[#FAF4EB] dark:bg-[#1A1713] border-2 border-[#C69F6F]/40 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C69F6F]/30 pb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-[#E6D3B3]">
                    Revenue (Past 7 Days)
                  </h3>
                </div>
                <div className="flex items-center space-x-6 text-xs font-mono">
                  <div>
                    <span className="text-neutral-500 font-bold uppercase text-[11px] tracking-wider">Peak: </span>
                    <strong className="text-black dark:text-[#E6D3B3] font-black font-mono text-sm">Rs. {maxChartRevenue.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-bold uppercase text-[11px] tracking-wider">Average: </span>
                    <strong className="text-black dark:text-[#E6D3B3] font-black font-mono text-sm">
                      Rs. {Math.round(totalRevenue / 7).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="relative w-full overflow-x-auto pt-2">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-64 sm:h-72 lg:h-80 select-none"
                >
                  <defs>
                    <linearGradient id="sandAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E6D3B3" stopOpacity="0.45" />
                      <stop offset="70%" stopColor="#E6D3B3" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#E6D3B3" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const y = paddingY + (chartHeight - paddingY * 2) * (1 - pct);
                    const val = Math.round(maxChartRevenue * pct);
                    return (
                      <g key={idx}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="#E5E7EB"
                          strokeDasharray="4 4"
                          className="dark:stroke-neutral-800"
                        />
                        <text
                          x={paddingX - 6}
                          y={y + 3}
                          textAnchor="end"
                          fontSize="9"
                          fill="#9CA3AF"
                          fontFamily="monospace"
                          fontWeight="700"
                        >
                          {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area Fill Under Curve */}
                  {svgAreaD && (
                    <path
                      d={svgAreaD}
                      fill="url(#sandAreaGrad)"
                    />
                  )}

                  {/* Main Curve Line */}
                  {svgPathD && (
                    <path
                      d={svgPathD}
                      fill="none"
                      stroke="#A6865A"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="dark:stroke-[#E6D3B3]"
                    />
                  )}

                  {/* Interactive Data Points */}
                  {chartPoints.map((pt, idx) => (
                    <g key={idx} className="cursor-pointer group">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredChartPoint?.date === pt.date ? 6 : 4}
                        fill="#A6865A"
                        className="dark:fill-[#E6D3B3] transition-all"
                        stroke="#ffffff"
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredChartPoint(pt)}
                        onMouseLeave={() => setHoveredChartPoint(null)}
                      />
                      {/* Day Label on X Axis */}
                      <text
                        x={pt.x}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6B7280"
                        fontFamily="sans-serif"
                        fontWeight="700"
                      >
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Hover Tooltip Box */}
                {hoveredChartPoint && (
                  <div
                    className="absolute z-10 pointer-events-none bg-black text-white px-3 py-1.5 rounded-none shadow-lg text-xs font-mono border border-[#E6D3B3]"
                    style={{
                      left: `${(hoveredChartPoint.x / chartWidth) * 100}%`,
                      top: `${(hoveredChartPoint.y / chartHeight) * 100 - 30}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="text-[10px] text-[#E6D3B3] font-bold">{hoveredChartPoint.label}</div>
                    <div className="font-bold text-sm">Rs. {hoveredChartPoint.revenue.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>

            {/* FULFILLMENT STATUS & PAYMENT GATEWAYS SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Card 1: Fulfillment Status Distribution (Camel Accent) */}
              <div className="p-6 sm:p-7 rounded-none bg-[#FAF4EB] dark:bg-[#1A1713] border-2 border-[#C69F6F]/40 shadow-sm space-y-4">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-[#E6D3B3]">
                  Order Status Breakdown
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Pending Verification', count: statusStats.pending, color: 'bg-amber-500' },
                    { label: 'Approved & Packed', count: statusStats.approved, color: 'bg-blue-600' },
                    { label: 'Dispatched (In Transit)', count: statusStats.dispatched + statusStats.processing, color: 'bg-indigo-600' },
                    { label: 'Delivered to Client', count: statusStats.delivered, color: 'bg-emerald-600' }
                  ].map((st, idx) => {
                    const total = liveOrders.length || 1;
                    const pct = Math.round((st.count / total) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-black dark:text-white">
                          <span>{st.label}</span>
                          <span className="font-mono font-black">{st.count} orders ({pct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#EAE0D2] dark:bg-onyx-800 rounded-none overflow-hidden">
                          <div
                            className={`h-full ${st.color} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: Payment Gateways Breakdown (Camel Accent) */}
              <div className="p-6 sm:p-7 rounded-none bg-[#FAF4EB] dark:bg-[#1A1713] border-2 border-[#C69F6F]/40 shadow-sm space-y-4">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-[#E6D3B3]">
                  Payment Channels Breakdown
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Cash on Delivery (COD)', count: paymentStats.cod, color: 'bg-neutral-800 dark:bg-neutral-200' },
                    { label: 'JazzCash Wallet', count: paymentStats.jazzcash, color: 'bg-red-600' },
                    { label: 'EasyPaisa Wallet', count: paymentStats.easypaisa, color: 'bg-emerald-600' },
                    { label: 'Credit / Debit Cards', count: paymentStats.card, color: 'bg-[#C69F6F] dark:bg-[#E6D3B3]' }
                  ].map((pm, idx) => {
                    const total = liveOrders.length || 1;
                    const pct = Math.round((pm.count / total) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-black dark:text-white">
                          <span>{pm.label}</span>
                          <span className="font-mono font-black">{pm.count} transactions ({pct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#EAE0D2] dark:bg-onyx-800 rounded-none overflow-hidden">
                          <div
                            className={`h-full ${pm.color} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Low Inventory Alert Banner */}
            {lowStockProducts.length > 0 && (
              <div className="p-4 rounded-none bg-[#F5EDE1] dark:bg-[#221C16] border-2 border-[#C69F6F]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[#8C6D45] dark:text-[#E6D3B3] font-bold">
                  <strong className="uppercase tracking-wider font-black">Low Stock Notice: </strong>
                  <span>{lowStockProducts.length} pieces have 4 or fewer remaining.</span>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="font-black text-black dark:text-[#E6D3B3] underline text-xs uppercase tracking-wider"
                >
                  View in Catalog →
                </button>
              </div>
            )}

            {/* Recent Orders Section (Camel Luxury Container) */}
            <div className="bg-[#FAF4EB] dark:bg-[#1A1713] rounded-none border-2 border-[#C69F6F]/40 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#C69F6F]/30 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-[#E6D3B3]">
                    Recent Orders
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-black uppercase tracking-wider text-black dark:text-[#E6D3B3] hover:underline"
                >
                  View All Orders ({liveOrders.length}) →
                </button>
              </div>

              {liveOrders.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-neutral-500">
                  No customer orders received yet.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="bg-[#EEDFC8] dark:bg-[#12100E] text-black dark:text-[#E6D3B3] text-[11px] font-black uppercase tracking-widest border-b border-[#C69F6F]/40 font-mono shadow-xs">
                      <tr>
                        <th className="py-3.5 px-4">Order #</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">City</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800 font-medium">
                      {liveOrders.slice(0, 5).map((ord) => (
                        <tr
                          key={ord.id || ord.orderNumber}
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="hover:bg-[#F2E5D3] dark:hover:bg-[#201B16] transition cursor-pointer"
                          title="Click to view order details"
                        >
                          <td className="py-3.5 px-4 font-mono font-black text-black dark:text-[#E6D3B3] text-xs">
                            {ord.orderNumber || ord.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-black text-black dark:text-white text-xs block">
                              {ord.customer?.firstName} {ord.customer?.lastName}
                            </span>
                            <span className="block text-[11px] text-neutral-600 dark:text-neutral-400 font-mono font-bold mt-0.5">{ord.customer?.phone}</span>
                          </td>
                          <td className="py-3.5 px-4 text-black dark:text-white font-bold text-xs">
                            {ord.customer?.city || 'Lahore'}
                          </td>
                          <td className="py-3.5 px-4 font-mono uppercase text-xs font-black text-black dark:text-white">
                            <div className="flex items-center space-x-1.5">
                              <span>{ord.paymentMethod === 'cod' ? 'COD' : ord.paymentMethod?.toUpperCase()}</span>
                              {ord.paymentReceipt && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEnlargedReceipt({
                                      src: ord.paymentReceipt,
                                      fileName: ord.receiptFileName || `Receipt #${ord.orderNumber || ord.id}`
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-[#E6D3B3] hover:bg-[#d9c19b] text-black font-black text-[10px] uppercase tracking-wider transition cursor-pointer"
                                  title="Click to view payment receipt screenshot"
                                >
                                  Screenshot ↗
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-black text-black dark:text-[#E6D3B3] font-mono text-xs">
                            Rs. {Number(ord.total || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.status || 'processing'}
                              onChange={(e) => handleStatusChange(ord.id || ord.orderNumber, e.target.value)}
                              className="px-2.5 py-1.5 rounded-none text-xs font-black uppercase border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white cursor-pointer"
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: APPROVALS QUEUE (PENDING ORDERS WITH PAYMENT RECEIPTS)
        ========================================================================= */}
        {activeTab === 'approvals' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white">
                  Approvals Queue
                </h3>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs font-black uppercase tracking-wider">
                {pendingOrders.length} Pending
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-12 text-center border-2 border-[#C69F6F]/40 bg-[#FAF4EB] dark:bg-[#1A1713] rounded-none space-y-1">
                <h4 className="font-black text-sm text-black dark:text-white uppercase tracking-wider">Queue Clear</h4>
                <p className="text-xs font-bold text-neutral-500">No pending orders awaiting verification.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pendingOrders.map(order => (
                  <div
                    key={order.orderNumber || order.id}
                    className="p-6 rounded-none bg-[#FAF4EB] dark:bg-[#1A1713] border-2 border-[#C69F6F]/50 space-y-4 shadow-sm hover:border-[#C69F6F] transition-all"
                  >
                    <div className="flex justify-between items-start border-b border-[#C69F6F]/30 pb-3">
                      <div>
                        <span className="font-mono text-sm font-black text-black dark:text-[#E6D3B3] block">
                          #{order.orderNumber || order.id}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono font-bold">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-amber-200 text-amber-950 dark:bg-amber-950 dark:text-amber-300 font-black text-xs uppercase border border-amber-400/40">
                        Pending
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-black text-[#8C6D45] dark:text-[#C69F6F] uppercase tracking-wider text-[11px]">Client:</span>
                        <span className="font-black text-black dark:text-white text-xs">{order.customer?.firstName} {order.customer?.lastName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-black text-[#8C6D45] dark:text-[#C69F6F] uppercase tracking-wider text-[11px]">Phone:</span>
                        <span className="font-bold text-black dark:text-white text-xs">{order.customer?.phone}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-black text-[#8C6D45] dark:text-[#C69F6F] uppercase tracking-wider text-[11px]">City:</span>
                        <span className="font-bold text-black dark:text-white text-xs">{order.customer?.city || 'Lahore'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-[#C69F6F]/20">
                        <span className="font-sans font-black text-[#8C6D45] dark:text-[#C69F6F] uppercase tracking-wider text-[11px]">Total:</span>
                        <span className="font-black text-black dark:text-[#E6D3B3] text-sm font-mono">Rs. {Number(order.total || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Receipt Screenshot Preview */}
                    {order.paymentReceipt ? (
                      <div className="space-y-2">
                        <div
                          onClick={() => setEnlargedReceipt({ src: order.paymentReceipt, fileName: order.receiptFileName || `Receipt #${order.orderNumber}` })}
                          className="p-2 bg-[#F5EDE1] dark:bg-black border border-[#C69F6F]/40 cursor-pointer text-center group hover:border-[#C69F6F] transition"
                          title="Click to open full screenshot"
                        >
                          <img
                            src={order.paymentReceipt}
                            alt="Receipt Preview"
                            className="max-h-36 mx-auto object-contain transition-transform group-hover:scale-105"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnlargedReceipt({ src: order.paymentReceipt, fileName: order.receiptFileName || `Receipt #${order.orderNumber}` })}
                          className="w-full py-2 bg-[#C69F6F] hover:bg-[#b58f5f] text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs"
                        >
                          View Full Screenshot ↗
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#F5EDE1] dark:bg-black text-neutral-600 dark:text-neutral-400 text-xs text-center font-mono font-bold border border-[#C69F6F]/30">
                        No receipt attached (COD or Direct)
                      </div>
                    )}

                    {/* 1-Click Approve Action */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        disabled={approvalLoading}
                        onClick={() => handleApproveOrder(order)}
                        className="w-full py-3 bg-black hover:bg-neutral-800 text-white dark:bg-[#C69F6F] dark:hover:bg-[#b58f5f] dark:text-black font-black uppercase tracking-wider text-xs transition active:scale-95 shadow-sm"
                      >
                        {approvalLoading ? 'Approving...' : 'Approve & Assign Tracking'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
                          const formattedPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
                          const msg = `Assalam-o-Alaikum ${order.customer?.firstName || 'Valued Client'},\nYour Zaytoun order #${order.orderNumber || order.id} is verified and booked for delivery.`;
                          window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-wider text-xs transition flex items-center justify-center space-x-1"
                      >
                        <span>WhatsApp Customer</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: SECURITY & ACCESS CONTROL (OWNER CONFIGURATION)
        ========================================================================= */}
        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn p-6 sm:p-8 bg-[#FAF4EB] dark:bg-[#1A1713] border-2 border-[#C69F6F]/40 shadow-sm">
            <div className="border-b border-[#C69F6F]/30 pb-4">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-[#E6D3B3]">
                Studio Security &amp; Owner Email
              </h3>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mt-1">
                Configure the authorized Google account allowed to access Studio. All other visitors automatically see 404 Page Not Found.
              </p>
            </div>

            {/* Change Owner Email Form */}
            <form onSubmit={handleSaveAdminEmail} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Authorized Owner Google Email Address *
                </label>
                <input
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="e.g. shaahrozdogar@gmail.com"
                  required
                  className="w-full bg-[#F5EDE1] dark:bg-black border border-[#C69F6F]/40 p-3 text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-[#C69F6F]"
                />
                <span className="text-xs font-bold text-neutral-500 mt-1.5 block">
                  Only this verified Google account can access Studio. If you ever want to change it, update it here.
                </span>
              </div>

              {adminEmailSavedMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                  {adminEmailSavedMessage}
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-3 bg-black hover:bg-neutral-800 text-white dark:bg-[#C69F6F] dark:hover:bg-[#b58f5f] dark:text-black font-black uppercase tracking-wider text-xs transition shadow-sm"
              >
                Save &amp; Update Authorized Email
              </button>
            </form>

            <div className="pt-4 border-t border-[#C69F6F]/20 text-xs text-neutral-600 dark:text-neutral-400 font-mono font-bold">
              Current Session: {currentUserEmail} • Role: Master Atelier Owner
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PRODUCTS CATALOG (MEN, WOMEN & KIDS FIELDS)
        ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Toolbar & Department Selectors */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Department Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All Garments', count: liveProducts.length },
                  { id: 'women', label: "Women's Collection", count: liveProducts.filter(p => (p.person || p.gender) === 'women').length },
                  { id: 'men', label: "Men's Collection", count: liveProducts.filter(p => (p.person || p.gender) === 'men').length },
                  { id: 'kids', label: "Kids Pret", count: liveProducts.filter(p => (p.person || p.gender) === 'kids').length }
                ].map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setProductDepartmentFilter(dept.id)}
                    className={`px-4 py-2.5 rounded-none text-xs font-black uppercase tracking-wider transition whitespace-nowrap flex items-center space-x-2 ${
                      productDepartmentFilter === dept.id
                        ? 'bg-[#C69F6F] text-black shadow-sm font-black'
                        : 'bg-[#FAF4EB] dark:bg-[#1A1713] border border-[#C69F6F]/40 text-black dark:text-white hover:border-[#C69F6F]'
                    }`}
                  >
                    <span>{dept.label}</span>
                    <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-black ${
                      productDepartmentFilter === dept.id ? 'bg-[#FAF4EB] text-black' : 'bg-[#EAE0D2] dark:bg-neutral-800 text-black dark:text-white'
                    }`}>
                      {dept.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search garments by title, category..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-none text-xs bg-[#FAF4EB] dark:bg-black border border-[#C69F6F]/40 text-black dark:text-white font-bold outline-none focus:border-[#C69F6F]"
                />
              </div>
            </div>

            {/* Products Table (Camel Luxury Container) */}
            <div className="bg-[#FAF4EB] dark:bg-[#1A1713] rounded-none border-2 border-[#C69F6F]/40 overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[750px] text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-[#EEDFC8] dark:bg-[#12100E] text-black dark:text-[#E6D3B3] text-[11px] font-black uppercase tracking-widest border-b border-[#C69F6F]/40 font-mono shadow-sm">
                    <tr>
                      <th className="py-3.5 px-4">Photo</th>
                      <th className="py-3.5 px-4">Garment Title</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price (PKR)</th>
                      <th className="py-3.5 px-4">Stock Breakdown</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800">
                    {filteredProducts.map((p) => {
                      const totalStock = p.stock !== undefined
                        ? Number(p.stock)
                        : p.stockPerSize
                          ? Object.values(p.stockPerSize).reduce((acc, v) => acc + Number(v), 0)
                          : 0;

                      const dept = (p.person || p.gender || 'women').toLowerCase();

                      return (
                        <tr key={p.id} className="hover:bg-[#F2E5D3] dark:hover:bg-[#201B16] transition">
                          {/* Photo */}
                          <td className="py-3.5 px-4">
                            <div className="w-12 h-14 rounded-none overflow-hidden bg-neutral-100 dark:bg-onyx-800 border border-neutral-300 dark:border-neutral-700 flex-shrink-0">
                              <img
                                src={p.images?.[0] || p.image || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80"}
                                alt={p.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          </td>

                          {/* Title & SKU */}
                          <td className="py-3.5 px-4 font-black text-black dark:text-white text-xs">
                            <div>{p.name}</div>
                            <span className="text-[10px] font-mono font-bold text-neutral-500">
                              SKU: {p.id}
                            </span>
                          </td>

                          {/* Department (Men / Women / Kids) */}
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-none text-xs font-black uppercase tracking-wider bg-neutral-100 dark:bg-black text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                              {dept === 'men' ? 'Men' : dept === 'women' ? 'Women' : 'Kids'}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 font-bold uppercase text-xs text-neutral-800 dark:text-neutral-200">
                            {p.category || p.slot || 'Apparel'}
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-4 font-mono font-black text-black dark:text-[#E6D3B3] text-xs">
                            Rs. {Number(p.price || 0).toLocaleString()}
                          </td>

                          {/* Stock Breakdown */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`font-black text-xs ${totalStock <= 4 ? 'text-amber-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                {totalStock} total
                              </span>
                              {p.stockPerSize && (
                                <span className="text-[10px] text-neutral-500 font-mono font-bold">
                                  ({Object.entries(p.stockPerSize).map(([sz, count]) => `${sz}:${count}`).join(' ')})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="px-3 py-1.5 rounded-none bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-black hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs uppercase tracking-wider"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProductClick(p.id, p.name)}
                              className="px-3 py-1.5 rounded-none bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-black hover:bg-red-200 text-xs uppercase tracking-wider"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CUSTOMER ORDERS (LIST & SEARCH)
        ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Order Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Selector */}
                <select
                  value={orderFilterStatus}
                  onChange={(e) => setOrderFilterStatus(e.target.value)}
                  className="px-3.5 py-2.5 rounded-none text-xs bg-[#FAF4EB] dark:bg-[#1A1713] border border-[#C69F6F]/40 font-black uppercase tracking-wider text-black dark:text-white cursor-pointer"
                >
                  <option value="all">All Statuses ({liveOrders.length})</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Payment Selector */}
                <select
                  value={orderFilterPayment}
                  onChange={(e) => setOrderFilterPayment(e.target.value)}
                  className="px-3.5 py-2.5 rounded-none text-xs bg-[#FAF4EB] dark:bg-[#1A1713] border border-[#C69F6F]/40 font-black uppercase tracking-wider text-black dark:text-white cursor-pointer"
                >
                  <option value="all">All Payment Gateways</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="jazzcash">JazzCash Wallet</option>
                  <option value="easypaisa">EasyPaisa</option>
                </select>
              </div>

              {/* Order Search */}
              <div className="w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search by order #, phone, city, client..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-none text-xs bg-[#FAF4EB] dark:bg-black border border-[#C69F6F]/40 text-black dark:text-white font-bold outline-none focus:border-[#C69F6F]"
                />
              </div>
            </div>

            {/* Orders Table (Camel Luxury Container) */}
            <div className="bg-[#FAF4EB] dark:bg-[#1A1713] rounded-none border-2 border-[#C69F6F]/40 overflow-hidden shadow-sm">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-neutral-500">
                  No customer orders matching the active search or filters.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[850px] xl:min-w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-[#EEDFC8] dark:bg-[#12100E] text-black dark:text-[#E6D3B3] text-[11px] font-black uppercase tracking-widest border-b border-[#C69F6F]/40 font-mono shadow-sm">
                      <tr>
                        <th className="py-3.5 px-4">Order #</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Client Name</th>
                        <th className="py-3.5 px-4">Contact Phone</th>
                        <th className="py-3.5 px-4">Delivery City</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4">Items</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800 font-medium">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id || ord.orderNumber} className="hover:bg-[#F2E5D3] dark:hover:bg-[#201B16] transition">
                          <td className="py-3.5 px-4 font-mono font-black text-black dark:text-[#E6D3B3] text-xs">
                            {ord.orderNumber || ord.id}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 text-xs font-mono font-bold">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </td>
                          <td className="py-3.5 px-4 font-black text-black dark:text-white text-xs">
                            {ord.customer?.firstName} {ord.customer?.lastName}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-black dark:text-white">
                            {ord.customer?.phone}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-black dark:text-white text-xs">
                            {ord.customer?.city || 'Lahore'}
                          </td>
                          <td className="py-3.5 px-4 font-mono uppercase text-xs font-black text-black dark:text-white">
                            <div className="flex items-center space-x-1.5">
                              <span>{ord.paymentMethod === 'cod' ? 'COD' : ord.paymentMethod?.toUpperCase()}</span>
                              {ord.paymentReceipt && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEnlargedReceipt({
                                      src: ord.paymentReceipt,
                                      fileName: ord.receiptFileName || `Receipt #${ord.orderNumber || ord.id}`
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-[#E6D3B3] hover:bg-[#d9c19b] text-black font-black text-[10px] uppercase tracking-wider transition cursor-pointer"
                                  title="Click to view payment receipt screenshot"
                                >
                                  Screenshot ↗
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-700 dark:text-neutral-300 font-mono font-bold text-xs">
                            {ord.items?.length || 1} pcs
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-black dark:text-[#E6D3B3] text-xs">
                            Rs. {Number(ord.total || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={ord.status || 'processing'}
                              onChange={(e) => handleStatusChange(ord.id || ord.orderNumber, e.target.value)}
                              className="px-2.5 py-1.5 rounded-none text-xs font-black uppercase border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="processing">Processing</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="px-3 py-1.5 rounded-none bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-black hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs uppercase tracking-wider"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: CLIENT DIRECTORY
        ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white">
                  Client Directory ({customers.length})
                </h3>
              </div>
            </div>

            <div className="bg-[#FAF4EB] dark:bg-[#1A1713] rounded-none border-2 border-[#C69F6F]/40 overflow-hidden shadow-sm">
              {customers.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-neutral-500">
                  No registered client profiles recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[750px] xl:min-w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-[#EEDFC8] dark:bg-[#12100E] text-black dark:text-[#E6D3B3] text-[11px] font-black uppercase tracking-widest border-b border-[#C69F6F]/40 font-mono shadow-sm">
                      <tr>
                        <th className="py-3.5 px-4">Client Name</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Phone</th>
                        <th className="py-3.5 px-4">City & Province</th>
                        <th className="py-3.5 px-4">Delivery Address</th>
                        <th className="py-3.5 px-4">Orders Count</th>
                        <th className="py-3.5 px-4">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800 font-medium">
                      {customers.map((c) => (
                        <tr key={c._id || c.email} className="hover:bg-[#F2E5D3] dark:hover:bg-[#201B16] transition">
                          <td className="py-3.5 px-4 font-black text-black dark:text-white text-xs">
                            {c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Client'}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-bold text-black dark:text-white">
                            {c.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-bold text-black dark:text-white">
                            {c.phone || '—'}
                          </td>
                          <td className="py-3 px-4 text-black dark:text-white font-bold text-xs">
                            {c.city || '—'}, {c.province || ''}
                          </td>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 font-medium text-xs max-w-xs truncate">
                            {c.address || '—'}
                          </td>
                          <td className="py-3 px-4 font-mono font-black text-black dark:text-[#E6D3B3] text-xs">
                            {c.ordersCount || 0}
                          </td>
                          <td className="py-3 px-4 font-mono font-black text-black dark:text-white text-xs">
                            Rs. {Number(c.totalSpent || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: GAZETTE SUBSCRIBERS & CONCIERGE INQUIRIES
        ========================================================================= */}
        {activeTab === 'subscribers' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Newsletter Subscribers Box (Camel Luxury Container) */}
            <div className="bg-[#FAF4EB] dark:bg-[#1A1713] rounded-none border-2 border-[#C69F6F]/40 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#C69F6F]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-[#E6D3B3]">
                    Gazette Subscribers ({subscribers.length})
                  </h3>
                </div>
                <button
                  onClick={handleCopySubscriberEmails}
                  className="px-4 py-2 bg-[#C69F6F] hover:bg-[#b58f5f] text-black text-xs font-black uppercase tracking-wider rounded-none transition active:scale-95 whitespace-nowrap shadow-xs cursor-pointer"
                >
                  {copiedEmails ? 'Copied' : 'Copy All Emails'}
                </button>
              </div>

              {subscribers.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-neutral-500">
                  No newsletter subscribers recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[650px] xl:min-w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-[#EEDFC8] dark:bg-[#12100E] text-black dark:text-[#E6D3B3] text-[11px] font-black uppercase tracking-widest border-b border-[#C69F6F]/40 font-mono shadow-sm">
                      <tr>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Source</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Subscribed At</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800 font-medium">
                      {subscribers.map((sub) => (
                        <tr key={sub._id || sub.email} className="hover:bg-[#F2E5D3] dark:hover:bg-[#201B16] transition">
                          <td className="py-3 px-4 font-mono font-black text-xs text-black dark:text-white">
                            {sub.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-none text-xs bg-[#F5EDE1] dark:bg-black border border-[#C69F6F]/40 text-black dark:text-white font-mono font-bold">
                              {sub.source || 'website'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-none text-xs bg-emerald-100 text-emerald-800 font-black uppercase">
                              {sub.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 font-mono font-bold text-xs">
                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteSub(sub._id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 text-xs font-black uppercase tracking-wider"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Concierge Desk Inquiries Box (Camel Luxury Container) */}
            <div className="bg-[#FAF4EB] dark:bg-[#1A1713] rounded-none border-2 border-[#C69F6F]/40 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#C69F6F]/30">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-[#E6D3B3]">
                  Concierge Inquiries ({inquiries.length})
                </h3>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-neutral-500">
                  No concierge inquiries recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[650px] xl:min-w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-[#EEDFC8] dark:bg-[#12100E] text-black dark:text-[#E6D3B3] text-[11px] font-black uppercase tracking-widest border-b border-[#C69F6F]/40 font-mono shadow-sm">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Order Ref</th>
                        <th className="py-3 px-4">Message</th>
                        <th className="py-3 px-4">Received At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800 font-medium">
                      {inquiries.map((inq) => (
                        <tr key={inq._id || inq.createdAt} className="hover:bg-[#F2E5D3] dark:hover:bg-[#201B16] transition">
                          <td className="py-3 px-4 font-black text-xs text-black dark:text-white">
                            {inq.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-bold text-black dark:text-white">
                            {inq.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#C69F6F] font-black">
                            {inq.orderNumber || '—'}
                          </td>
                          <td className="py-3 px-4 text-neutral-800 dark:text-neutral-200 text-xs font-medium max-w-md">
                            {inq.message}
                          </td>
                          <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 text-xs font-mono font-bold">
                            {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: PALETTE & BRAND APPEARANCE
        ========================================================================= */}
        {activeTab === 'appearance' && (
          <div className="max-w-2xl bg-[#FAF4EB] dark:bg-[#1A1713] p-6 sm:p-8 rounded-none border-2 border-[#C69F6F]/40 shadow-sm space-y-6 animate-fadeIn">
            <div className="border-b border-[#C69F6F]/30 pb-4">
              <h3 className="text-base font-black uppercase tracking-widest text-black dark:text-[#E6D3B3]">
                Store Branding &amp; Palette
              </h3>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                Customize brand headline and the four heritage colors
              </p>
            </div>

            <form onSubmit={handleSaveAppearance} className="space-y-4 text-xs">
              <div>
                <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black text-xs font-bold text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                    Sand Tone (Primary)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={oliveColor}
                      onChange={(e) => setOliveColor(e.target.value)}
                      className="w-9 h-8 rounded-none border border-neutral-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={oliveColor}
                      onChange={(e) => setOliveColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 font-mono font-bold text-xs bg-neutral-50 dark:bg-black text-black dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                    Camel Tone (Secondary Accent)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={camelColor}
                      onChange={(e) => setCamelColor(e.target.value)}
                      className="w-9 h-8 rounded-none border border-neutral-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={camelColor}
                      onChange={(e) => setCamelColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 font-mono font-bold text-xs bg-neutral-50 dark:bg-black text-black dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-none bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black font-black text-xs uppercase tracking-wider transition shadow-md"
              >
                Save Brand Palette
              </button>
            </form>
          </div>
        )}

      </main>

      {/* =========================================================================
          ADD / EDIT GARMENT MODAL (PC 2-COLUMN LUXURY SPECIFICATION)
      ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#FAF4EB] dark:bg-[#1A1713] rounded-none border-2 border-[#C69F6F] max-w-4xl lg:max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-[#C69F6F]/30 mb-6">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#8C6D45] dark:text-[#E6D3B3] font-mono">
                  ATELIER CATALOG MANAGEMENT
                </span>
                <h3 className="font-editorial text-2xl font-black text-black dark:text-white">
                  {editingProductId ? "Edit Garment Specification" : "Create New Garment"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-500 hover:text-black dark:hover:text-white text-2xl p-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Column 1: Core Garment Specifications */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                      Garment Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Heritage Double-Breasted Overcoat"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#C69F6F]/40 bg-white dark:bg-black text-xs font-bold text-black dark:text-white outline-none focus:border-[#C69F6F]"
                    />
                  </div>

                  {/* Department & Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                        Department (Gender) *
                      </label>
                      <select
                        value={productForm.person}
                        onChange={(e) => setProductForm({ ...productForm, person: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-none border border-[#C69F6F]/40 bg-white dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-[#C69F6F]"
                      >
                        <option value="women">Women's Collection</option>
                        <option value="men">Men's Collection</option>
                        <option value="kids">Kids Pret</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                        Category *
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-none border border-[#C69F6F]/40 bg-white dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-[#C69F6F]"
                      >
                        <option value="Outerwear">Outerwear</option>
                        <option value="Knitwear">Knitwear</option>
                        <option value="Women's Pret">Women's Pret</option>
                        <option value="Men's Pret">Men's Pret</option>
                        <option value="Kids Pret">Kids Pret</option>
                        <option value="Dresses">Dresses</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing in PKR */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                        Price in PKR (₨) *
                      </label>
                      <input
                        type="number"
                        required
                        min="100"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-none border border-[#C69F6F]/40 bg-white dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-[#C69F6F]"
                      />
                    </div>

                    <div>
                      <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                        Original Price (₨)
                      </label>
                      <input
                        type="number"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-none border border-[#C69F6F]/40 bg-white dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-[#C69F6F]"
                      />
                    </div>
                  </div>

                  {/* Color Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                        Color Name
                      </label>
                      <input
                        type="text"
                        value={productForm.primaryColor}
                        onChange={(e) => setProductForm({ ...productForm, primaryColor: e.target.value })}
                        placeholder="e.g. Desert Sand"
                        className="w-full px-3 py-2.5 rounded-none border border-[#C69F6F]/40 bg-white dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-[#C69F6F]"
                      />
                    </div>

                    <div>
                      <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                        Color Swatch
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={productForm.colorHex}
                          onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                          className="w-10 h-10 rounded-none border border-[#C69F6F]/40 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={productForm.colorHex}
                          onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                          className="flex-1 px-3 py-2.5 rounded-none border border-[#C69F6F]/40 font-mono font-bold text-xs bg-white dark:bg-black text-black dark:text-white outline-none focus:border-[#C69F6F]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Media Upload (Choose File Tab) & Inventory */}
                <div className="space-y-4">
                  {/* Image Selector Tabs */}
                  <div>
                    <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-2">
                      Garment Photo *
                    </label>

                    {/* Source Tab Toggle */}
                    <div className="flex border border-[#C69F6F]/40 mb-3 bg-[#EEDFC8] dark:bg-[#12100E]">
                      <button
                        type="button"
                        onClick={() => setProductImageTab('upload')}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                          productImageTab === 'upload'
                            ? 'bg-[#C69F6F] text-black shadow-xs font-black'
                            : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white font-bold'
                        }`}
                      >
                        Choose File (PC / Device)
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductImageTab('url')}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                          productImageTab === 'url'
                            ? 'bg-[#C69F6F] text-black shadow-xs font-black'
                            : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white font-bold'
                        }`}
                      >
                        Image URL Link
                      </button>
                    </div>

                    {/* Permanently mounted native file input for Garment */}
                    <input
                      id="admin-garment-file-input"
                      ref={garmentFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => handleGarmentFileProcess(e.target.files?.[0])}
                      className="hidden"
                    />

                    {productImageTab === 'upload' ? (
                      <div>
                        {!productForm.imageUrl ? (
                          <label
                            htmlFor="admin-garment-file-input"
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingGarmentFile(true); }}
                            onDragLeave={() => setIsDraggingGarmentFile(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingGarmentFile(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleGarmentFileProcess(e.dataTransfer.files[0]);
                              }
                            }}
                            className={`border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                              isDraggingGarmentFile
                                ? 'border-black dark:border-white bg-[#EAE0D2] dark:bg-onyx-800'
                                : 'border-[#C69F6F]/50 bg-white dark:bg-black hover:border-[#C69F6F] hover:bg-[#FAF4EB]'
                            }`}
                          >
                            <svg className="w-8 h-8 text-[#8C6D45] dark:text-[#C69F6F] mb-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="px-4 py-2 bg-black text-white dark:bg-[#C69F6F] dark:text-black font-black uppercase text-xs tracking-wider shadow-sm mb-1.5 pointer-events-none">
                              Choose File / Browse PC
                            </span>
                            <span className="text-[11px] text-neutral-500 font-medium pointer-events-none">or drag &amp; drop high-res garment image</span>
                            <span className="text-[10px] text-neutral-400 font-mono mt-0.5 pointer-events-none">PNG, JPG, WEBP (Max 8MB)</span>
                          </label>
                        ) : (
                          <div className="p-3 bg-white dark:bg-black border border-[#C69F6F]/40 flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 min-w-0">
                              <img
                                src={productForm.imageUrl}
                                alt="Garment Preview"
                                className="w-16 h-20 object-cover object-top border border-neutral-300 dark:border-neutral-700 bg-neutral-100 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-black text-black dark:text-white block">
                                  Image Attached
                                </span>
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
                                  ✓ Ready for catalog publishing
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <label
                                htmlFor="admin-garment-file-input"
                                className="px-3 py-1.5 bg-[#FAF4EB] hover:bg-[#EAE0D2] dark:bg-onyx-800 dark:hover:bg-onyx-700 text-black dark:text-white border border-[#C69F6F]/40 font-black text-xs uppercase tracking-wider cursor-pointer"
                              >
                                Change
                              </label>
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, imageUrl: '' })}
                                className="text-xs text-red-600 hover:text-red-800 font-bold uppercase underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={productForm.imageUrl}
                          onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-none border border-[#C69F6F]/40 bg-white dark:bg-black text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-[#C69F6F]"
                        />
                        {productForm.imageUrl && (
                          <div className="mt-2 w-16 h-20 overflow-hidden border border-[#C69F6F]/40">
                            <img src={productForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stock Quantity Per Size */}
                  <div>
                    <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                      Available Stock per Size:
                    </label>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                        <div key={size} className="bg-white dark:bg-black p-2 border border-[#C69F6F]/40">
                          <span className="block font-mono font-black text-[11px] text-[#8C6D45] dark:text-[#C69F6F] mb-1">{size}</span>
                          <input
                            type="number"
                            min="0"
                            value={productForm[`stock${size}`]}
                            onChange={(e) => setProductForm({ ...productForm, [`stock${size}`]: e.target.value })}
                            className="w-full text-center py-1 bg-[#FAF4EB] dark:bg-onyx-800 font-black text-xs text-black dark:text-white border border-neutral-300 dark:border-neutral-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                      Description &amp; Tailoring Notes
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-none border border-[#C69F6F]/40 bg-white dark:bg-black text-xs font-medium text-black dark:text-white outline-none focus:border-[#C69F6F]"
                      placeholder="Handcrafted tailored piece..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#C69F6F]/30 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-none border border-[#C69F6F]/50 text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider hover:bg-[#EAE0D2] dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-none bg-black hover:bg-neutral-800 text-white dark:bg-[#C69F6F] dark:hover:bg-[#b58f5f] dark:text-black text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Save Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDER DETAILS INSPECTION MODAL (PC 2-COLUMN LUXURY SPECIFICATION)
      ========================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#FAF4EB] dark:bg-[#1A1713] rounded-none border-2 border-[#C69F6F] max-w-4xl lg:max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#C69F6F]/30 mb-6">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#8C6D45] dark:text-[#E6D3B3]">
                  ATELIER ORDER SPECIFICATION
                </span>
                <h3 className="font-mono text-2xl font-black text-black dark:text-[#E6D3B3]">
                  #{selectedOrderDetails.orderNumber || selectedOrderDetails.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="text-neutral-500 hover:text-black dark:hover:text-white text-2xl p-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 text-xs">
              {/* Left Column: Customer Profile & Ordered Pieces */}
              <div className="space-y-4">
                {/* Client Profile Card */}
                <div className="p-4 bg-white dark:bg-black border border-[#C69F6F]/40 space-y-2">
                  <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <span className="font-black uppercase tracking-wider text-xs text-[#8C6D45] dark:text-[#C69F6F]">
                      Client Profile
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-500">
                      {selectedOrderDetails.createdAt ? new Date(selectedOrderDetails.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-black text-black dark:text-white text-sm">
                      {selectedOrderDetails.customer?.firstName} {selectedOrderDetails.customer?.lastName}
                    </div>
                    <div className="text-neutral-700 dark:text-neutral-300">
                      Email: <span className="font-mono font-bold text-black dark:text-white">{selectedOrderDetails.customer?.email}</span>
                    </div>
                    <div className="text-neutral-700 dark:text-neutral-300">
                      Phone: <span className="font-mono font-black text-black dark:text-[#E6D3B3]">{selectedOrderDetails.customer?.phone}</span>
                    </div>
                    <div className="text-neutral-700 dark:text-neutral-300">
                      Delivery Address: <span className="font-bold text-black dark:text-white">{selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city}</span>
                    </div>
                    {selectedOrderDetails.customer?.orderNotes && (
                      <div className="pt-2 text-neutral-600 dark:text-neutral-400 italic border-t border-neutral-200 dark:border-neutral-800">
                        "{selectedOrderDetails.customer?.orderNotes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Garments */}
                <div>
                  <span className="font-black uppercase tracking-wider text-xs text-black dark:text-white block mb-2">
                    Ordered Pieces ({(selectedOrderDetails.items || []).length}):
                  </span>
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-[#C69F6F]/40 bg-white dark:bg-black max-h-56 overflow-y-auto">
                    {(selectedOrderDetails.items || []).map((item, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between">
                        <div>
                          <strong className="block text-black dark:text-white font-black text-xs">{item.name}</strong>
                          <span className="text-xs font-bold text-neutral-500 mt-0.5 block">
                            Size: {item.size || item.selectedSize} • Color: {item.color || item.selectedColor} • Qty: {item.quantity || 1}
                          </span>
                        </div>
                        <span className="font-black font-mono text-black dark:text-[#E6D3B3] text-xs">
                          Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Summary */}
                <div className="p-4 bg-white dark:bg-black border border-[#C69F6F]/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-black text-neutral-500">Payment Gateway</span>
                    <div className="font-black uppercase font-mono text-black dark:text-white">{selectedOrderDetails.paymentMethod}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase font-black text-neutral-500">Payable Total</span>
                    <div className="text-xl font-black font-mono text-black dark:text-[#E6D3B3]">
                      Rs. {Number(selectedOrderDetails.total || selectedOrderDetails.pricing?.finalTotal || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Receipt Screenshot & Fulfillment Actions */}
              <div className="space-y-4">
                {/* Payment Screenshot */}
                <div className="p-4 bg-white dark:bg-black border border-[#C69F6F]/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase tracking-wider text-xs text-[#8C6D45] dark:text-[#E6D3B3]">
                      Payment Proof Screenshot:
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">
                      {selectedOrderDetails.receiptFileName || 'proof.jpg'}
                    </span>
                  </div>

                  {selectedOrderDetails.paymentReceipt ? (
                    <div className="space-y-2">
                      <div
                        onClick={() => setEnlargedReceipt({
                          src: selectedOrderDetails.paymentReceipt,
                          fileName: selectedOrderDetails.receiptFileName || `Receipt #${selectedOrderDetails.orderNumber}`
                        })}
                        className="relative group cursor-pointer border border-[#C69F6F]/30 bg-[#FAF4EB] dark:bg-onyx-950 overflow-hidden flex items-center justify-center p-2"
                        title="Click to enlarge screenshot"
                      >
                        <img
                          src={selectedOrderDetails.paymentReceipt}
                          alt="Customer Payment Receipt"
                          className="max-h-48 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnlargedReceipt({
                          src: selectedOrderDetails.paymentReceipt,
                          fileName: selectedOrderDetails.receiptFileName || `Receipt #${selectedOrderDetails.orderNumber}`
                        })}
                        className="w-full py-2 bg-[#C69F6F] hover:bg-[#b58f5f] text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs"
                      >
                        Open Full Screenshot ↗
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#FAF4EB] dark:bg-onyx-900 border border-[#C69F6F]/30 text-center font-bold text-neutral-600 dark:text-neutral-400">
                      {selectedOrderDetails.paymentMethod === 'cod' ? 'Cash On Delivery Order (No receipt needed)' : 'No screenshot attached for this manual order.'}
                    </div>
                  )}
                </div>

                {/* Fulfillment Status Actions */}
                <div className="p-4 bg-white dark:bg-black border border-[#C69F6F]/40 space-y-3">
                  <div>
                    <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                      Change Fulfillment Status:
                    </label>
                    <select
                      value={selectedOrderDetails.status || 'processing'}
                      onChange={(e) => {
                        handleStatusChange(selectedOrderDetails.id || selectedOrderDetails.orderNumber, e.target.value);
                        setSelectedOrderDetails({ ...selectedOrderDetails, status: e.target.value });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#C69F6F]/40 bg-[#FAF4EB] dark:bg-onyx-900 font-black text-xs text-black dark:text-white uppercase tracking-wider"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="processing">Processing</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Primary Approval Button (When Status is Pending) */}
                  {selectedOrderDetails.status === 'pending' && (
                    <button
                      type="button"
                      disabled={approvalLoading}
                      onClick={() => handleApproveOrder(selectedOrderDetails)}
                      className="w-full py-3 bg-black hover:bg-neutral-800 text-white dark:bg-[#C69F6F] dark:hover:bg-[#b58f5f] dark:text-black font-black uppercase tracking-widest text-xs transition active:scale-95 shadow-sm rounded-none cursor-pointer"
                    >
                      {approvalLoading ? 'Approving Consignment...' : 'Approve Order & Activate Live Tracking'}
                    </button>
                  )}

                  {/* Direct WhatsApp Customer Notification Link */}
                  <button
                    type="button"
                    onClick={() => {
                      const cleanPhone = (selectedOrderDetails.customer?.phone || '').replace(/[^0-9]/g, '');
                      const formattedPhone = cleanPhone.startsWith('0')
                        ? '92' + cleanPhone.slice(1)
                        : (cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone);
                      const msg = `Assalam-o-Alaikum ${selectedOrderDetails.customer?.firstName || 'Valued Client'},\n\nYour Zaytoun Atelier order #${selectedOrderDetails.orderNumber || selectedOrderDetails.id} is ${selectedOrderDetails.status === 'approved' ? 'APPROVED' : 'CONFIRMED'}.\n\nCourier: TCS Express (Tracking #: ${selectedOrderDetails.trackingNumber || 'TCS-99482104-PK'})\nLive Track: ${window.location.origin}/track/${selectedOrderDetails.orderNumber || selectedOrderDetails.id}\n\nThank you for choosing Zaytoun Atelier slow-fashion craftsmanship.`;
                      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-wider text-xs transition flex items-center justify-center space-x-2 rounded-none shadow-sm cursor-pointer"
                  >
                    <span>Send Customer WhatsApp Notification</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Payment Receipt Modal (z-[120] to stay above all modals) */}
      {enlargedReceipt && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setEnlargedReceipt(null)}
        >
          <div
            className="relative max-w-4xl lg:max-w-5xl w-full max-h-[94vh] bg-[#FAF4EB] dark:bg-[#1A1713] border-2 border-[#C69F6F] p-4 sm:p-6 shadow-2xl rounded-none flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-wrap justify-between items-center pb-3 mb-3 border-b border-[#C69F6F]/30 gap-2">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#8C6D45] dark:text-[#E6D3B3] block font-mono">
                  CUSTOMER PAYMENT PROOF
                </span>
                <span className="font-mono text-xs font-black text-black dark:text-white">
                  {enlargedReceipt.fileName || 'Payment Proof Screenshot'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {enlargedReceipt.src && (
                  <a
                    href={enlargedReceipt.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-black px-3.5 py-2 bg-[#E6D3B3] hover:bg-[#d9c19b] text-black uppercase tracking-wider transition"
                  >
                    Open in New Tab ↗
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setEnlargedReceipt(null)}
                  className="text-xs font-black px-3.5 py-2 bg-black hover:bg-neutral-800 text-white rounded-none uppercase tracking-wider transition"
                >
                  Close ✕
                </button>
              </div>
            </div>

            <div className="overflow-auto max-h-[78vh] flex items-center justify-center bg-neutral-100 dark:bg-black/60 p-4 border border-neutral-300 dark:border-neutral-800">
              {enlargedReceipt.src?.startsWith('data:application/pdf') || enlargedReceipt.fileName?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={enlargedReceipt.src}
                  title="Payment Proof PDF"
                  className="w-full h-[72vh] border-0"
                />
              ) : (
                <img
                  src={enlargedReceipt.src}
                  alt="Payment Proof Full"
                  className="max-h-[72vh] max-w-full w-auto object-contain mx-auto shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
