import React, { useState, useEffect, useMemo } from 'react';
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

  // SVG Chart Dimensions
  const chartWidth = 680;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

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
    setProductForm({
      name: '',
      person: 'women',
      category: 'Women\'s Pret',
      slot: 'top',
      price: 14500,
      originalPrice: 16500,
      primaryColor: 'Sand',
      colorHex: '#E6D3B3',
      imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
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
    setProductForm({
      name: prod.name || '',
      person: prod.person || prod.gender || 'women',
      category: prod.category || 'Apparel',
      slot: prod.slot || 'top',
      price: prod.price || 0,
      originalPrice: prod.originalPrice || prod.price || 0,
      primaryColor: prod.primaryColor || prod.colorName || 'Sand',
      colorHex: prod.color || '#E6D3B3',
      imageUrl: prod.images?.[0] || prod.image || '',
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
      
      {/* Sleek Minimalist Studio Navigation Bar - Styled cleanly like Navbar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 py-2 sm:py-0 min-h-[56px] sm:min-h-[64px]">
          
          {/* Clean Minimalist Tabs (Styled like Navbar Links) */}
          <nav className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto scrollbar-none text-xs font-bold uppercase tracking-widest py-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'approvals', label: 'Approvals', count: pendingOrders.length, highlight: true },
              { id: 'orders', label: 'Orders', count: liveOrders.length },
              { id: 'products', label: 'Catalog', count: liveProducts.length },
              { id: 'customers', label: 'Clients', count: customers.length },
              { id: 'subscribers', label: 'Gazette', count: subscribers.length + inquiries.length },
              { id: 'security', label: 'Security' },
              { id: 'appearance', label: 'Theme' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 whitespace-nowrap transition-all border-b-2 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-black dark:border-[#E6D3B3] text-black dark:text-[#E6D3B3] font-black'
                    : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white font-bold'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-black ${
                    tab.highlight && tab.count > 0
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Sleek Actions (Clean, spaced, no cheap icons) */}
          <div className="flex items-center space-x-3 shrink-0 pb-2 md:pb-0">
            <button
              onClick={handleOpenCreateProduct}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black text-xs font-black uppercase tracking-wider rounded-none transition shadow-sm"
            >
              + New Garment
            </button>
            <button
              onClick={loadAllDataFromMongoDB}
              disabled={loading}
              className="hidden sm:inline-block px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-black dark:text-white text-xs font-black uppercase tracking-wider rounded-none transition"
            >
              {loading ? 'Syncing...' : 'Refresh'}
            </button>
            <button
              onClick={onCloseAdmin}
              className="px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-black dark:text-white text-xs font-black uppercase tracking-wider rounded-none transition"
            >
              Storefront →
            </button>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 flex-1 space-y-10">
        
        {/* =========================================================================
            TAB 1: VISUAL ANALYTICS & INTERACTIVE REVENUE GRAPH
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 6 Key Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-5 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 shadow-xs">
                <span className="text-xs uppercase font-black text-neutral-500 dark:text-neutral-400 tracking-widest block font-mono">
                  Total Sales
                </span>
                <p className="text-xl sm:text-2xl font-black text-black dark:text-[#E6D3B3] mt-2 font-mono tracking-tight">
                  Rs. {totalRevenue.toLocaleString()}
                </p>
              </div>

              <div className="p-5 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 shadow-xs">
                <span className="text-xs uppercase font-black text-neutral-500 dark:text-neutral-400 tracking-widest block font-mono">
                  Approvals
                </span>
                <p className="text-xl sm:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight">
                  {pendingOrders.length}
                </p>
              </div>

              <div className="p-5 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 shadow-xs">
                <span className="text-xs uppercase font-black text-neutral-500 dark:text-neutral-400 tracking-widest block font-mono">
                  Orders
                </span>
                <p className="text-xl sm:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight">
                  {liveOrders.length}
                </p>
              </div>

              <div className="p-5 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 shadow-xs">
                <span className="text-xs uppercase font-black text-neutral-500 dark:text-neutral-400 tracking-widest block font-mono">
                  Catalog
                </span>
                <p className="text-xl sm:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight">
                  {liveProducts.length}
                </p>
              </div>

              <div className="p-5 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 shadow-xs">
                <span className="text-xs uppercase font-black text-neutral-500 dark:text-neutral-400 tracking-widest block font-mono">
                  Clients
                </span>
                <p className="text-xl sm:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight">
                  {customers.length}
                </p>
              </div>

              <div className="p-5 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 shadow-xs">
                <span className="text-xs uppercase font-black text-neutral-500 dark:text-neutral-400 tracking-widest block font-mono">
                  Gazette
                </span>
                <p className="text-xl sm:text-2xl font-black text-black dark:text-white mt-2 font-mono tracking-tight">
                  {subscribers.length}
                </p>
              </div>
            </div>

            {/* Revenue Trajectory Graph (7 Days) */}
            <div className="p-5 sm:p-8 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white">
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
                  className="w-full h-56 select-none"
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
              
              {/* Card 1: Fulfillment Status Distribution */}
              <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 shadow-sm space-y-4">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white">
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
                        <div className="w-full h-2.5 bg-neutral-100 dark:bg-onyx-800 rounded-none overflow-hidden">
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

              {/* Card 2: Payment Gateways Breakdown */}
              <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 shadow-sm space-y-4">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white">
                  Payment Channels Breakdown
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Cash on Delivery (COD)', count: paymentStats.cod, color: 'bg-neutral-800 dark:bg-neutral-200' },
                    { label: 'JazzCash Wallet', count: paymentStats.jazzcash, color: 'bg-red-600' },
                    { label: 'EasyPaisa Wallet', count: paymentStats.easypaisa, color: 'bg-emerald-600' },
                    { label: 'Credit / Debit Cards', count: paymentStats.card, color: 'bg-[#A6865A] dark:bg-[#E6D3B3]' }
                  ].map((pm, idx) => {
                    const total = liveOrders.length || 1;
                    const pct = Math.round((pm.count / total) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-black dark:text-white">
                          <span>{pm.label}</span>
                          <span className="font-mono font-black">{pm.count} transactions ({pct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-100 dark:bg-onyx-800 rounded-none overflow-hidden">
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
              <div className="p-4 rounded-none bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-amber-900 dark:text-amber-200 font-bold">
                  <strong className="uppercase tracking-wider font-black">Low Stock Notice: </strong>
                  <span>{lowStockProducts.length} pieces have 4 or fewer remaining.</span>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="font-black text-amber-900 dark:text-amber-300 underline text-xs uppercase tracking-wider"
                >
                  View in Catalog →
                </button>
              </div>
            )}

            {/* Recent Orders Section */}
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white">
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
                    <thead className="bg-neutral-100 dark:bg-black text-black dark:text-white text-[11px] font-black uppercase tracking-widest border-b border-neutral-300 dark:border-neutral-800 font-mono shadow-xs">
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
                        <tr key={ord.id || ord.orderNumber} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
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
              <div className="p-12 text-center border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-onyx-900 rounded-none space-y-1">
                <h4 className="font-black text-sm text-black dark:text-white uppercase tracking-wider">Queue Clear</h4>
                <p className="text-xs font-bold text-neutral-500">No pending orders awaiting verification.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingOrders.map(order => (
                  <div
                    key={order.orderNumber || order.id}
                    className="p-5 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 space-y-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start border-b border-neutral-200 dark:border-neutral-800 pb-3">
                      <div>
                        <span className="font-mono text-sm font-black text-black dark:text-[#E6D3B3] block">
                          #{order.orderNumber || order.id}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono font-bold">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-black text-xs uppercase">
                        Pending
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-black text-neutral-500 uppercase tracking-wider text-[11px]">Client:</span>
                        <span className="font-black text-black dark:text-white text-xs">{order.customer?.firstName} {order.customer?.lastName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-black text-neutral-500 uppercase tracking-wider text-[11px]">Phone:</span>
                        <span className="font-bold text-black dark:text-white text-xs">{order.customer?.phone}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-black text-neutral-500 uppercase tracking-wider text-[11px]">City:</span>
                        <span className="font-bold text-black dark:text-white text-xs">{order.customer?.city || 'Lahore'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="font-sans font-black text-neutral-500 uppercase tracking-wider text-[11px]">Total:</span>
                        <span className="font-black text-black dark:text-[#E6D3B3] text-sm font-mono">Rs. {Number(order.total || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Receipt Screenshot Preview */}
                    {order.paymentReceipt ? (
                      <div className="space-y-2">
                        <div
                          onClick={() => setEnlargedReceipt({ src: order.paymentReceipt, fileName: order.receiptFileName || `Receipt #${order.orderNumber}` })}
                          className="p-2 bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-700 cursor-pointer text-center group hover:border-black dark:hover:border-white transition"
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
                          className="w-full py-2 bg-[#E6D3B3] hover:bg-[#d9c19b] text-black text-xs font-black uppercase tracking-wider transition cursor-pointer"
                        >
                          View Full Screenshot ↗
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-neutral-100 dark:bg-black text-neutral-500 text-xs text-center font-mono font-bold">
                        No receipt attached (COD or Direct)
                      </div>
                    )}

                    {/* 1-Click Approve Action */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        disabled={approvalLoading}
                        onClick={() => handleApproveOrder(order)}
                        className="w-full py-3 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black font-black uppercase tracking-wider text-xs transition active:scale-95 shadow-sm"
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
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn p-6 sm:p-8 bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 shadow-sm">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white">
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
                  className="w-full bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 p-3 text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
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
                className="px-6 py-3 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black font-black uppercase tracking-wider text-xs transition shadow-sm"
              >
                Save &amp; Update Authorized Email
              </button>
            </form>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 font-mono font-bold">
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
                        ? 'bg-black dark:bg-[#E6D3B3] text-white dark:text-black shadow-sm'
                        : 'bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-neutral-800 text-black dark:text-white hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <span>{dept.label}</span>
                    <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-black ${
                      productDepartmentFilter === dept.id ? 'bg-neutral-800 dark:bg-[#d9c19b] text-white dark:text-black' : 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white'
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
                  className="w-full px-4 py-2.5 rounded-none text-xs bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full max-h-[70vh] overflow-y-auto">
                <table className="w-full min-w-[750px] text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-black text-black dark:text-white text-[11px] font-black uppercase tracking-widest border-b border-neutral-300 dark:border-neutral-800 font-mono shadow-sm">
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
                        <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
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
                  className="px-3.5 py-2.5 rounded-none text-xs bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 font-black uppercase tracking-wider text-black dark:text-white cursor-pointer"
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
                  className="px-3.5 py-2.5 rounded-none text-xs bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 font-black uppercase tracking-wider text-black dark:text-white cursor-pointer"
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
                  className="w-full px-4 py-2.5 rounded-none text-xs bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-sm">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-neutral-500">
                  No customer orders matching the active search or filters.
                </div>
              ) : (
                <div className="overflow-x-auto w-full max-h-[70vh] overflow-y-auto">
                  <table className="w-full min-w-[950px] text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-black text-black dark:text-white text-[11px] font-black uppercase tracking-widest border-b border-neutral-300 dark:border-neutral-800 font-mono shadow-sm">
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
                        <tr key={ord.id || ord.orderNumber} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
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

            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-sm">
              {customers.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-neutral-500">
                  No registered client profiles recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto w-full max-h-[70vh] overflow-y-auto">
                  <table className="w-full min-w-[750px] text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-black text-black dark:text-white text-[11px] font-black uppercase tracking-widest border-b border-neutral-300 dark:border-neutral-800 font-mono shadow-sm">
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
                        <tr key={c._id || c.email} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
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
            {/* Newsletter Subscribers Box */}
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white">
                    Gazette Subscribers ({subscribers.length})
                  </h3>
                </div>
                <button
                  onClick={handleCopySubscriberEmails}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black text-xs font-black uppercase tracking-wider rounded-none transition active:scale-95 whitespace-nowrap shadow-sm"
                >
                  {copiedEmails ? 'Copied' : 'Copy All Emails'}
                </button>
              </div>

              {subscribers.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-neutral-500">
                  No newsletter subscribers recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto w-full max-h-[50vh] overflow-y-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-black text-black dark:text-white text-[11px] font-black uppercase tracking-widest border-b border-neutral-300 dark:border-neutral-800 font-mono shadow-sm">
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
                        <tr key={sub._id || sub.email} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
                          <td className="py-3 px-4 font-mono font-black text-xs text-black dark:text-white">
                            {sub.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-none text-xs bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-black dark:text-white font-mono font-bold">
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

            {/* Concierge Desk Inquiries Box */}
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black dark:text-white">
                  Concierge Inquiries ({inquiries.length})
                </h3>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-neutral-500">
                  No concierge inquiries recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto w-full max-h-[50vh] overflow-y-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-black text-black dark:text-white text-[11px] font-black uppercase tracking-widest border-b border-neutral-300 dark:border-neutral-800 font-mono shadow-sm">
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
                        <tr key={inq._id || inq.createdAt} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
                          <td className="py-3 px-4 font-black text-xs text-black dark:text-white">
                            {inq.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs font-bold text-black dark:text-white">
                            {inq.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#A6865A] dark:text-[#E6D3B3] font-black">
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
          <div className="max-w-2xl bg-white dark:bg-onyx-900 p-6 sm:p-8 rounded-none border border-neutral-300 dark:border-neutral-800 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-black uppercase tracking-widest text-black dark:text-white">
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
          ADD / EDIT GARMENT MODAL
      ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-onyx-900 rounded-none border-2 border-black dark:border-[#E6D3B3] max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-5">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#A6865A] dark:text-[#E6D3B3] font-mono">
                  ATELIER CATALOG
                </span>
                <h3 className="font-editorial text-2xl font-black text-black dark:text-white">
                  {editingProductId ? "Edit Garment" : "New Garment"}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white text-xl p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
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
                  className="w-full px-3.5 py-2.5 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black text-xs font-bold text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
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
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
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
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
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
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
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
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
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
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black font-bold text-xs text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                    Color Hex Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={productForm.colorHex}
                      onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                      className="w-8 h-8 rounded-none border border-neutral-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={productForm.colorHex}
                      onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 font-mono font-bold text-xs bg-neutral-50 dark:bg-black text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                    />
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                  Product Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                />
                {productForm.imageUrl && (
                  <div className="mt-2 w-16 h-20 rounded-none overflow-hidden border border-neutral-300 dark:border-neutral-700">
                    <img src={productForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
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
                    <div key={size}>
                      <span className="block font-mono font-bold text-[10px] text-neutral-500 mb-1">{size}</span>
                      <input
                        type="number"
                        min="0"
                        value={productForm[`stock${size}`]}
                        onChange={(e) => setProductForm({ ...productForm, [`stock${size}`]: e.target.value })}
                        className="w-full text-center px-1 py-1.5 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black font-black text-xs text-black dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black text-xs font-medium text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-none border border-neutral-300 dark:border-neutral-700 text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-none bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black text-xs font-black uppercase tracking-wider shadow-md"
                >
                  Save Garment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDER DETAILS INSPECTION MODAL
      ========================================================================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-onyx-900 rounded-none border-2 border-black dark:border-[#E6D3B3] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#A6865A] dark:text-[#E6D3B3]">
                  ORDER SPECIFICATION
                </span>
                <h3 className="font-mono text-2xl font-black text-black dark:text-[#E6D3B3]">
                  #{selectedOrderDetails.orderNumber || selectedOrderDetails.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-neutral-400 hover:text-black dark:hover:text-white text-xl p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Info Card */}
              <div className="p-4 rounded-none bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-800 space-y-1.5">
                <div className="font-black text-black dark:text-white text-xs">
                  Client: {selectedOrderDetails.customer?.firstName} {selectedOrderDetails.customer?.lastName}
                </div>
                <div className="text-black dark:text-white font-medium">Email: <span className="font-mono font-bold">{selectedOrderDetails.customer?.email}</span></div>
                <div className="text-black dark:text-white font-medium">Phone: <span className="font-mono font-black text-black dark:text-[#E6D3B3]">{selectedOrderDetails.customer?.phone}</span></div>
                <div className="text-black dark:text-white font-medium">Address: <span className="font-bold">{selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city}</span></div>
                {selectedOrderDetails.customer?.orderNotes && (
                  <div className="pt-1 text-neutral-500 italic font-medium">Notes: "{selectedOrderDetails.customer?.orderNotes}"</div>
                )}
              </div>

              {/* Items List */}
              <div>
                <span className="font-black uppercase tracking-wider text-xs text-black dark:text-white">
                  Ordered Items:
                </span>
                <div className="mt-2 divide-y divide-neutral-200 dark:divide-onyx-800 border border-neutral-300 dark:border-neutral-800 rounded-none overflow-hidden">
                  {(selectedOrderDetails.items || []).map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between">
                      <div>
                        <strong className="block text-black dark:text-white font-black text-xs">{item.name}</strong>
                        <span className="text-xs font-bold text-neutral-500 mt-0.5 block">
                          Size: {item.size || item.selectedSize} • Color: {item.color || item.selectedColor} • Qty: {item.quantity || 1}
                        </span>
                      </div>
                      <span className="font-black font-mono text-black dark:text-[#E6D3B3] text-xs">
                        Rs. {(item.price * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Pricing Summary */}
              <div className="p-4 rounded-none bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-black text-neutral-500">Payment Gateway</span>
                  <div className="font-black uppercase font-mono text-black dark:text-white">{selectedOrderDetails.paymentMethod}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-black text-neutral-500">Payable Total</span>
                  <div className="text-lg font-black font-mono text-black dark:text-[#E6D3B3]">
                    Rs. {Number(selectedOrderDetails.total || selectedOrderDetails.pricing?.finalTotal || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Payment Proof Screenshot Inspection */}
              {selectedOrderDetails.paymentReceipt ? (
                <div className="p-4 rounded-none bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase tracking-wider text-xs text-[#A6865A] dark:text-[#E6D3B3]">
                      Payment Proof Screenshot:
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">
                      {selectedOrderDetails.receiptFileName || 'payment_proof.jpg'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div
                      onClick={() => setEnlargedReceipt({
                        src: selectedOrderDetails.paymentReceipt,
                        fileName: selectedOrderDetails.receiptFileName || `Receipt #${selectedOrderDetails.orderNumber}`
                      })}
                      className="relative group cursor-pointer border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black overflow-hidden flex items-center justify-center p-2"
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
                      className="w-full py-2 bg-[#E6D3B3] hover:bg-[#d9c19b] text-black text-xs font-black uppercase tracking-wider transition cursor-pointer"
                    >
                      Open Full Screenshot ↗
                    </button>
                  </div>
                </div>
              ) : ['jazzcash', 'easypaisa', 'bank'].includes((selectedOrderDetails.paymentMethod || '').toLowerCase()) ? (
                <div className="p-3 rounded-none bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-amber-900 dark:text-amber-300 text-xs font-bold">
                  Manual gateway order (no receipt attached).
                </div>
              ) : null}

              {/* Order Status & Verification Approval Actions */}
              <div className="pt-2 space-y-2.5">
                <label className="block font-black uppercase tracking-wider text-xs text-black dark:text-white mb-1.5">
                  Change Fulfillment Status:
                </label>
                <select
                  value={selectedOrderDetails.status || 'processing'}
                  onChange={(e) => {
                    handleStatusChange(selectedOrderDetails.id || selectedOrderDetails.orderNumber, e.target.value);
                    setSelectedOrderDetails({ ...selectedOrderDetails, status: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-none border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-black font-black text-xs text-black dark:text-white uppercase tracking-wider"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Primary Approval Button (When Status is Pending) */}
                {selectedOrderDetails.status === 'pending' && (
                  <button
                    type="button"
                    disabled={approvalLoading}
                    onClick={() => handleApproveOrder(selectedOrderDetails)}
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black font-black uppercase tracking-widest text-xs transition active:scale-95 shadow-sm rounded-none"
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
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-wider text-xs transition flex items-center justify-center space-x-2 rounded-none shadow-sm"
                >
                  <span>Send Customer WhatsApp Notification</span>
                </button>
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
            className="relative max-w-4xl w-full max-h-[94vh] bg-white dark:bg-onyx-900 border-2 border-black dark:border-[#E6D3B3] p-4 sm:p-6 shadow-2xl rounded-none flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-wrap justify-between items-center pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800 gap-2">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#A6865A] dark:text-[#E6D3B3] block font-mono">
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
