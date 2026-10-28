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
  onCloseAdmin
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders' | 'customers' | 'subscribers' | 'appearance'
  
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
    if (propOrders && propOrders.length > 0) setLiveOrders(propOrders);
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
    setAdminEmailSavedMessage(`✅ Authorized owner email updated to "${clean}". Studio access is strictly limited to this Google account.`);
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
    alert(`✅ Product "${productForm.name}" successfully saved to MongoDB Atlas!`);
  };

  // Delete Product from MongoDB
  const handleDeleteProductClick = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" from MongoDB Atlas?`)) return;
    
    const success = await deleteProductFromDB(productId);
    setLiveProducts(prev => prev.filter(p => p.id !== productId));
    if (onDeleteProduct) onDeleteProduct(productId);

    if (success) {
      alert("✅ Product removed from database.");
    }
  };

  // Update Order Status in MongoDB
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

📦 Consignment Tracking #: ${trackingNumber}
🚚 Courier: TCS Express (slow-fashion slow-tailored consignment)
🔗 Live Track Your Parcel: ${window.location.origin}/track/${order.orderNumber || order.id}

Thank you for choosing Zaytoun Atelier craftsmanship.`;

      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;

      if (window.confirm("✅ Order Approved! TCS tracking number generated.\n\nOpen customer's WhatsApp to send the automated notification now?")) {
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

  // Delete Subscriber from MongoDB
  const handleDeleteSub = async (id) => {
    if (!window.confirm("Remove this subscriber from MongoDB?")) return;
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
      
      {/* Top Executive Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-onyx-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-onyx-800 px-3 sm:px-8 h-16 sm:h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <BrandLogo size="sm" asLink={false} />
          <div className="border-l border-neutral-300 dark:border-onyx-800 pl-2 sm:pl-3 flex items-center space-x-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400">
              <span className="hidden sm:inline">MongoDB </span>Atlas Live
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            onClick={loadAllDataFromMongoDB}
            disabled={loading}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-none border border-neutral-300 dark:border-onyx-700 bg-white dark:bg-onyx-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-black dark:hover:border-white shadow-sm transition active:scale-95"
            title="Refresh database records"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span className="hidden sm:inline">{loading ? "Connecting..." : "Sync Atlas"}</span>
          </button>

          <button
            onClick={onCloseAdmin}
            className="flex items-center space-x-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-none bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black text-xs font-bold uppercase tracking-wider shadow transition active:scale-95"
          >
            <span>← Storefront</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1500px] w-full mx-auto px-3 sm:px-8 py-6 sm:py-8 flex-1 space-y-6 sm:space-y-8">
        
        {/* Title & Live Counters Banner */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-onyx-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A6865A] dark:text-[#E6D3B3] font-bold">
              ATELIER EXECUTIVE SYSTEM
            </span>
            <h1 className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white mt-1">
              Admin & Database Portal
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Live MongoDB cluster connection • Last synced: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={handleOpenCreateProduct}
            className="bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black font-bold text-xs uppercase tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 rounded-none shadow transition active:scale-95 flex items-center space-x-2 self-start sm:self-auto"
          >
            <span>+ Add New Garment</span>
          </button>
        </div>

        {/* Executive Tabs Bar */}
        <div className="sticky top-16 sm:top-20 z-20 bg-white/95 dark:bg-onyx-950/95 backdrop-blur-md py-2 border-b border-neutral-200 dark:border-onyx-800 text-xs font-semibold overflow-x-auto flex items-center space-x-4 sm:space-x-6 scrollbar-none w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'text-black dark:text-[#E6D3B3] font-bold border-b-2 border-black dark:border-[#E6D3B3]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
            }`}
          >
            <span>📈 Analytics & Graphs</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'approvals'
                ? 'text-black dark:text-[#E6D3B3] font-bold border-b-2 border-black dark:border-[#E6D3B3]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
            }`}
          >
            <span>⚡ Approvals Queue</span>
            {pendingOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-none font-bold text-xs bg-amber-500 text-black animate-pulse">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'text-black dark:text-[#E6D3B3] font-bold border-b-2 border-black dark:border-[#E6D3B3]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
            }`}
          >
            <span>📦 Orders & Shipments</span>
            <span className="px-1.5 py-0.5 rounded-none text-xs bg-neutral-100 dark:bg-onyx-800 font-bold">
              {liveOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'products'
                ? 'text-black dark:text-[#E6D3B3] font-bold border-b-2 border-black dark:border-[#E6D3B3]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
            }`}
          >
            <span>👗 Products Catalog</span>
            <span className="px-1.5 py-0.5 rounded-none text-xs bg-neutral-100 dark:bg-onyx-800 font-bold">
              {liveProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'customers'
                ? 'text-black dark:text-[#E6D3B3] font-bold border-b-2 border-black dark:border-[#E6D3B3]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
            }`}
          >
            <span>👤 Client Directory</span>
            <span className="px-1.5 py-0.5 rounded-none text-xs bg-neutral-100 dark:bg-onyx-800 font-bold">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'subscribers'
                ? 'text-black dark:text-[#E6D3B3] font-bold border-b-2 border-black dark:border-[#E6D3B3]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
            }`}
          >
            <span>📬 Gazette & Concierge</span>
            <span className="px-1.5 py-0.5 rounded-none text-xs bg-neutral-100 dark:bg-onyx-800 font-bold">
              {subscribers.length + inquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'security'
                ? 'text-black dark:text-[#E6D3B3] font-bold border-b-2 border-black dark:border-[#E6D3B3]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
            }`}
          >
            <span>🛡️ Security & Access</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'appearance'
                ? 'text-black dark:text-[#E6D3B3] font-bold border-b-2 border-black dark:border-[#E6D3B3]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-[#E6D3B3]'
            }`}
          >
            <span>🎨 Brand & Palette</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: VISUAL ANALYTICS & INTERACTIVE REVENUE GRAPH
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 6 Key MongoDB Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[11px] sm:text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider block">
                  Total Sales
                </span>
                <p className="text-base sm:text-xl font-black text-black dark:text-[#E6D3B3] mt-1 font-mono truncate">
                  Rs. {totalRevenue.toLocaleString()}
                </p>
                <span className="text-[10px] sm:text-xs text-emerald-600 font-semibold block mt-0.5">● Atlas Verified</span>
              </div>

              <div className="p-3 sm:p-4 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[11px] sm:text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider block">
                  Approvals
                </span>
                <p className="text-base sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                  {pendingOrders.length}
                </p>
                <span className="text-[10px] sm:text-xs text-neutral-500 block mt-0.5">Awaiting Check</span>
              </div>

              <div className="p-3 sm:p-4 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[11px] sm:text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider block">
                  Total Orders
                </span>
                <p className="text-base sm:text-xl font-black text-black dark:text-white mt-1 font-mono">
                  {liveOrders.length}
                </p>
                <span className="text-[10px] sm:text-xs text-neutral-500 block mt-0.5">Consignments</span>
              </div>

              <div className="p-3 sm:p-4 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[11px] sm:text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider block">
                  Catalog
                </span>
                <p className="text-base sm:text-xl font-black text-black dark:text-white mt-1 font-mono">
                  {liveProducts.length}
                </p>
                <span className="text-[10px] sm:text-xs text-[#A6865A] dark:text-[#E6D3B3] font-semibold block mt-0.5">Active Pieces</span>
              </div>

              <div className="p-3 sm:p-4 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[11px] sm:text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider block">
                  Clients
                </span>
                <p className="text-base sm:text-xl font-black text-black dark:text-white mt-1 font-mono">
                  {customers.length}
                </p>
                <span className="text-[10px] sm:text-xs text-neutral-500 block mt-0.5">Registered Profiles</span>
              </div>

              <div className="p-3 sm:p-4 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[11px] sm:text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider block">
                  Gazette Circle
                </span>
                <p className="text-base sm:text-xl font-black text-black dark:text-white mt-1 font-mono">
                  {subscribers.length}
                </p>
                <span className="text-[10px] sm:text-xs text-emerald-600 font-semibold block mt-0.5">Subscribers</span>
              </div>
            </div>

            {/* INTERACTIVE ANIMATED REVENUE GRAPH (7-DAY TRAJECTORY) */}
            <div className="p-4 sm:p-6 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-onyx-800 pb-4">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-black dark:text-white flex items-center space-x-2">
                    <span>📈 Revenue Trajectory</span>
                    <span className="text-xs font-mono font-normal text-neutral-500">(Past 7 Days)</span>
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Live revenue aggregation across completed &amp; booked orders
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-xs font-mono">
                  <div>
                    <span className="text-neutral-500">Peak Daily: </span>
                    <strong className="text-black dark:text-[#E6D3B3]">Rs. {maxChartRevenue.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500">Avg/Day: </span>
                    <strong className="text-black dark:text-[#E6D3B3]">
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
                        fontWeight="600"
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
              <div className="p-4 sm:p-6 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm space-y-4">
                <h4 className="font-editorial text-lg font-bold text-black dark:text-white">
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
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{st.label}</span>
                          <span className="font-mono">{st.count} orders ({pct}%)</span>
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
              <div className="p-4 sm:p-6 rounded-none bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm space-y-4">
                <h4 className="font-editorial text-lg font-bold text-black dark:text-white">
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
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{pm.label}</span>
                          <span className="font-mono">{pm.count} transactions ({pct}%)</span>
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

            {/* Low Inventory Alert Banner (if any item has <= 4 stock) */}
            {lowStockProducts.length > 0 && (
              <div className="p-4 rounded-none bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3 text-amber-900 dark:text-amber-200">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <strong>Low Stock Inventory Alert: </strong>
                    <span>{lowStockProducts.length} garments have critical scarcity (4 or fewer remaining).</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="font-bold text-amber-800 dark:text-amber-300 underline text-xs"
                >
                  Inspect in Products Catalog →
                </button>
              </div>
            )}

            {/* Recent Orders Section */}
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-onyx-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-onyx-800 flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-black dark:text-white">
                    Recent Customer Orders
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Direct from MongoDB Atlas orders collection (Stored Unhashed)
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-black dark:text-[#E6D3B3] hover:underline"
                >
                  View All Orders ({liveOrders.length}) →
                </button>
              </div>

              {liveOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No customer orders in MongoDB yet. Place an order from the storefront!
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="bg-neutral-100 dark:bg-onyx-950 text-neutral-600 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-onyx-800">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800">
                      {liveOrders.slice(0, 5).map((ord) => (
                        <tr key={ord.id || ord.orderNumber} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-black dark:text-[#E6D3B3]">
                            {ord.orderNumber || ord.id}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-black dark:text-white">
                              {ord.customer?.firstName} {ord.customer?.lastName}
                            </span>
                            <span className="block text-xs text-neutral-500 font-mono">{ord.customer?.phone}</span>
                          </td>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 font-medium">
                            {ord.customer?.city || 'Lahore'}
                          </td>
                          <td className="py-3 px-4 font-mono uppercase text-xs">
                            <div className="flex items-center space-x-1.5">
                              <span>{ord.paymentMethod === 'cod' ? '💵 COD' : ord.paymentMethod?.toUpperCase()}</span>
                              {ord.paymentReceipt && (
                                <span className="px-1.5 py-0.5 bg-[#E6D3B3] text-black font-bold text-xs">
                                  📎 PROOF
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-black dark:text-white font-mono">
                            Rs. {Number(ord.total || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.status || 'processing'}
                              onChange={(e) => handleStatusChange(ord.id || ord.orderNumber, e.target.value)}
                              className="px-2.5 py-1 rounded-none text-xs font-bold border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 cursor-pointer"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-onyx-800 pb-4">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-black dark:text-white">
                  Consignment Approval Queue
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Review payment screenshots, approve orders, and auto-dispatch courier tracking numbers
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs font-bold uppercase tracking-wider">
                {pendingOrders.length} Pending Verifications
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-neutral-300 dark:border-onyx-800 bg-white dark:bg-onyx-900 rounded-none space-y-2">
                <span className="text-3xl">🎉</span>
                <h4 className="font-bold text-sm text-black dark:text-white">Queue Clear!</h4>
                <p className="text-xs text-neutral-500">All received orders have been approved and processed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingOrders.map(order => (
                  <div
                    key={order.orderNumber || order.id}
                    className="p-5 rounded-none bg-white dark:bg-onyx-900 border-2 border-neutral-300 dark:border-onyx-800 space-y-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start border-b border-neutral-200 dark:border-onyx-800 pb-3">
                      <div>
                        <span className="font-mono text-xs font-black text-black dark:text-[#E6D3B3] block">
                          #{order.orderNumber || order.id}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs uppercase">
                        Pending
                      </span>
                    </div>

                    {/* Customer Info (Unhashed) */}
                    <div className="text-xs space-y-1 font-mono">
                      <div><strong className="font-sans text-neutral-700 dark:text-neutral-300">Client:</strong> {order.customer?.firstName} {order.customer?.lastName}</div>
                      <div><strong className="font-sans text-neutral-700 dark:text-neutral-300">Phone:</strong> {order.customer?.phone}</div>
                      <div><strong className="font-sans text-neutral-700 dark:text-neutral-300">City:</strong> {order.customer?.city}</div>
                      <div><strong className="font-sans text-neutral-700 dark:text-neutral-300">Total:</strong> Rs. {Number(order.total || 0).toLocaleString()}</div>
                    </div>

                    {/* Receipt Screenshot Preview */}
                    {order.paymentReceipt ? (
                      <div
                        onClick={() => setEnlargedReceipt({ src: order.paymentReceipt, fileName: order.receiptFileName })}
                        className="p-2 bg-neutral-100 dark:bg-onyx-950 border border-dashed border-neutral-400 cursor-pointer text-center group"
                      >
                        <img
                          src={order.paymentReceipt}
                          alt="Receipt Preview"
                          className="max-h-36 mx-auto object-contain transition-transform group-hover:scale-105"
                        />
                        <span className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-300 mt-1">
                          🔍 Click to Inspect Fullscreen
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-neutral-100 dark:bg-onyx-950 text-neutral-500 text-xs text-center font-mono">
                        No receipt attached (COD or Direct)
                      </div>
                    )}

                    {/* 1-Click Approve Action */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        disabled={approvalLoading}
                        onClick={() => handleApproveOrder(order)}
                        className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black font-bold uppercase tracking-wider text-xs transition active:scale-95 shadow-sm"
                      >
                        {approvalLoading ? 'Approving...' : '✓ Approve & Assign TCS Tracking'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
                          const formattedPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;
                          const msg = `Assalam-o-Alaikum ${order.customer?.firstName || 'Valued Client'},\nYour Zaytoun order #${order.orderNumber || order.id} is verified and booked for delivery.`;
                          window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase tracking-wider text-xs transition flex items-center justify-center space-x-1"
                      >
                        <span>📱 WhatsApp Customer</span>
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
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn p-6 bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 shadow-sm">
            <div className="border-b border-neutral-200 dark:border-onyx-800 pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#A6865A] dark:text-[#E6D3B3]">
                Atelier Security Core
              </span>
              <h3 className="font-editorial text-2xl font-bold text-black dark:text-white mt-1">
                Executive Access &amp; 404 Shield
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Manage who can unlock the Studio Dashboard. All unauthorized visitors or random URL attempts are automatically redirected to 404 Page Not Found.
              </p>
            </div>

            {/* Active Security Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-onyx-950 border border-neutral-200 dark:border-onyx-800 space-y-1">
                <span className="text-emerald-600 font-bold block">● 404 Cloaking</span>
                <span className="text-neutral-500">Public sees 404 for /studio &amp; /admin</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-onyx-950 border border-neutral-200 dark:border-onyx-800 space-y-1">
                <span className="text-emerald-600 font-bold block">● Google OAuth 2.0</span>
                <span className="text-neutral-500">Strict cryptographically signed session</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-onyx-950 border border-neutral-200 dark:border-onyx-800 space-y-1">
                <span className="text-emerald-600 font-bold block">● Atlas Direct Sync</span>
                <span className="text-neutral-500">Unhashed database storage</span>
              </div>
            </div>

            {/* Change Owner Email Form */}
            <form onSubmit={handleSaveAdminEmail} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Authorized Owner Google Email Address *
                </label>
                <input
                  type="email"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  placeholder="e.g. shaahrozdogar@gmail.com"
                  required
                  className="w-full bg-neutral-50 dark:bg-onyx-800 border border-neutral-300 dark:border-onyx-700 p-3 text-xs font-mono text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                />
                <span className="text-xs text-neutral-500 mt-1 block">
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
                className="px-6 py-3 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black font-bold uppercase tracking-wider text-xs transition shadow-sm"
              >
                Save &amp; Update Authorized Email
              </button>
            </form>

            <div className="pt-4 border-t border-neutral-200 dark:border-onyx-800 text-xs text-neutral-500 font-mono">
              Current Session: {user?.email || 'Logged In'} • Role: Master Atelier Owner
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
                    className={`px-3.5 py-2 rounded-none text-xs font-bold uppercase tracking-wider transition whitespace-nowrap flex items-center space-x-1.5 ${
                      productDepartmentFilter === dept.id
                        ? 'bg-black dark:bg-[#E6D3B3] text-white dark:text-black shadow-sm'
                        : 'bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    <span>{dept.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-none text-[10px] font-mono ${
                      productDepartmentFilter === dept.id ? 'bg-neutral-800 dark:bg-[#d9c19b] text-white dark:text-black' : 'bg-neutral-100 dark:bg-onyx-800'
                    }`}>
                      {dept.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search products by title, category..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-none text-xs bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-onyx-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto w-full max-h-[70vh] overflow-y-auto">
                <table className="w-full min-w-[750px] text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-onyx-950 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-onyx-800 shadow-sm">
                    <tr>
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Garment Title</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (PKR)</th>
                      <th className="py-3 px-4">Stock Breakdown</th>
                      <th className="py-3 px-4 text-right">Actions</th>
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
                          <td className="py-3 px-4">
                            <div className="w-12 h-14 rounded-none overflow-hidden bg-neutral-100 dark:bg-onyx-800 border border-neutral-200 dark:border-onyx-700 flex-shrink-0">
                              <img
                                src={p.images?.[0] || p.image || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80"}
                                alt={p.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          </td>

                          {/* Title & SKU */}
                          <td className="py-3 px-4 font-bold text-black dark:text-white">
                            <div>{p.name}</div>
                            <span className="text-[10px] font-mono font-normal text-neutral-400">
                              SKU: {p.id}
                            </span>
                          </td>

                          {/* Department (Men / Women / Kids) */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-onyx-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-onyx-700">
                              {dept === 'men' ? '👨 Men' : dept === 'women' ? '👩 Women' : '👶 Kids'}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300 uppercase text-[11px]">
                            {p.category || p.slot || 'Apparel'}
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 font-mono font-bold text-black dark:text-[#E6D3B3]">
                            Rs. {Number(p.price || 0).toLocaleString()}
                          </td>

                          {/* Stock Breakdown */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`font-bold ${totalStock <= 4 ? 'text-amber-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                {totalStock} total
                              </span>
                              {p.stockPerSize && (
                                <span className="text-[10px] text-neutral-400 font-mono">
                                  ({Object.entries(p.stockPerSize).map(([sz, count]) => `${sz}:${count}`).join(' ')})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="px-2.5 py-1 rounded-none bg-neutral-100 dark:bg-onyx-800 text-black dark:text-white font-bold hover:bg-neutral-200 text-xs uppercase"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProductClick(p.id, p.name)}
                              className="px-2.5 py-1 rounded-none bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 text-xs uppercase"
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
            TAB 3: CUSTOMER ORDERS (FULL MONGODB LIST & SEARCH)
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
                  className="px-3 py-2 rounded-none text-xs bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 font-bold text-neutral-800 dark:text-white cursor-pointer"
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
                  className="px-3 py-2 rounded-none text-xs bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 font-bold text-neutral-800 dark:text-white cursor-pointer"
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
                  className="w-full px-3.5 py-2 rounded-none text-xs bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-800 text-black dark:text-white outline-none focus:border-black dark:focus:border-[#E6D3B3]"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-onyx-800 overflow-hidden shadow-sm">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-500">
                  No orders matching the active search or filters in MongoDB Atlas.
                </div>
              ) : (
                <div className="overflow-x-auto w-full max-h-[70vh] overflow-y-auto">
                  <table className="w-full min-w-[950px] text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-onyx-950 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-onyx-800 shadow-sm">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Contact Phone</th>
                        <th className="py-3 px-4">Delivery City</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id || ord.orderNumber} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-black dark:text-[#E6D3B3]">
                            {ord.orderNumber || ord.id}
                          </td>
                          <td className="py-3 px-4 text-neutral-500 text-[11px] font-mono">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </td>
                          <td className="py-3 px-4 font-bold text-black dark:text-white">
                            {ord.customer?.firstName} {ord.customer?.lastName}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                            {ord.customer?.phone}
                          </td>
                          <td className="py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">
                            {ord.customer?.city || 'Lahore'}
                          </td>
                          <td className="py-3 px-4 font-mono uppercase text-[10px]">
                            <div className="flex items-center space-x-1.5">
                              <span>{ord.paymentMethod === 'cod' ? '💵 COD' : ord.paymentMethod?.toUpperCase()}</span>
                              {ord.paymentReceipt && (
                                <span className="px-1.5 py-0.5 bg-[#E6D3B3] text-black font-bold text-[9px] rounded-none">
                                  📎 PROOF
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 font-mono">
                            {ord.items?.length || 1} pcs
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">
                            Rs. {Number(ord.total || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.status || 'processing'}
                              onChange={(e) => handleStatusChange(ord.id || ord.orderNumber, e.target.value)}
                              className="px-2.5 py-1 rounded-none text-xs font-bold border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="processing">Processing</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="px-2.5 py-1 rounded-none bg-neutral-100 dark:bg-onyx-800 text-black dark:text-white font-bold hover:bg-neutral-200 text-xs uppercase"
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
            TAB 4: CUSTOMERS DIRECTORY (STORED IN MONGODB)
        ========================================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-black dark:text-white">
                  Customer Directory ({customers.length})
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Registered shopper accounts and customer profiles in MongoDB Atlas `customers` collection
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-onyx-800 overflow-hidden shadow-sm">
              {customers.length === 0 ? (
                <div className="p-12 text-center text-xs text-neutral-500">
                  No customers registered yet. Customer profiles are automatically created when shoppers place an order or sign in with Google.
                </div>
              ) : (
                <div className="overflow-x-auto w-full max-h-[70vh] overflow-y-auto">
                  <table className="w-full min-w-[750px] text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-onyx-950 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-onyx-800 shadow-sm">
                      <tr>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">City & Province</th>
                        <th className="py-3 px-4">Delivery Address</th>
                        <th className="py-3 px-4">Orders Count</th>
                        <th className="py-3 px-4">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800">
                      {customers.map((c) => (
                        <tr key={c._id || c.email} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
                          <td className="py-3 px-4 font-bold text-black dark:text-white">
                            {c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Client'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                            {c.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                            {c.phone || '—'}
                          </td>
                          <td className="py-3 px-4 text-neutral-800 dark:text-neutral-200">
                            {c.city || '—'}, {c.province || ''}
                          </td>
                          <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                            {c.address || '—'}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-black dark:text-[#E6D3B3]">
                            {c.ordersCount || 0}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">
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
            TAB 5: SUBSCRIBERS & CONCIERGE INQUIRIES (STORED IN MONGODB)
        ========================================================================= */}
        {activeTab === 'subscribers' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Newsletter Subscribers Box */}
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-onyx-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-onyx-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-black dark:text-white">
                    Newsletter Subscribers ({subscribers.length})
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Direct from MongoDB Atlas `subscribers` collection
                  </p>
                </div>
                <button
                  onClick={handleCopySubscriberEmails}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black text-xs font-bold uppercase tracking-wider rounded-none transition active:scale-95 whitespace-nowrap shadow-sm"
                >
                  {copiedEmails ? '✓ Copied All Emails!' : 'Copy All Emails (CSV)'}
                </button>
              </div>

              {subscribers.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No subscribers recorded in MongoDB yet. Try subscribing from the homepage footer!
                </div>
              ) : (
                <div className="overflow-x-auto w-full max-h-[50vh] overflow-y-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-onyx-950 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-onyx-800 shadow-sm">
                      <tr>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Source</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Subscribed At</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800">
                      {subscribers.map((sub) => (
                        <tr key={sub._id || sub.email} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-black dark:text-white">
                            {sub.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-none text-[10px] bg-neutral-100 dark:bg-onyx-800 text-neutral-700 dark:text-neutral-300 font-mono">
                              {sub.source || 'website'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-none text-[10px] bg-emerald-100 text-emerald-800 font-semibold uppercase">
                              {sub.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-500 font-mono">
                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteSub(sub._id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold"
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
            <div className="bg-white dark:bg-onyx-900 rounded-none border border-neutral-300 dark:border-onyx-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-onyx-800">
                <h3 className="font-editorial text-xl font-bold text-black dark:text-white">
                  Concierge & Client Inquiries ({inquiries.length})
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Messages submitted through the Concierge / Contact page stored in MongoDB Atlas `inquiries`
                </p>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No inquiries in MongoDB yet.
                </div>
              ) : (
                <div className="overflow-x-auto w-full max-h-[50vh] overflow-y-auto">
                  <table className="w-full min-w-[650px] text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-neutral-100 dark:bg-onyx-950 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-onyx-800 shadow-sm">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Order Ref</th>
                        <th className="py-3 px-4">Message</th>
                        <th className="py-3 px-4">Received At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-onyx-800">
                      {inquiries.map((inq) => (
                        <tr key={inq._id || inq.createdAt} className="hover:bg-neutral-50 dark:hover:bg-onyx-800/40 transition">
                          <td className="py-3 px-4 font-bold text-black dark:text-white">
                            {inq.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                            {inq.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#A6865A] dark:text-[#E6D3B3] font-bold">
                            {inq.orderNumber || '—'}
                          </td>
                          <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 max-w-md">
                            {inq.message}
                          </td>
                          <td className="py-3 px-4 text-neutral-500 text-[11px] font-mono">
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
          <div className="max-w-2xl bg-white dark:bg-onyx-900 p-6 sm:p-8 rounded-none border border-neutral-300 dark:border-onyx-800 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-black dark:text-white">
                Store Branding & Palette Settings
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Customize brand headline and the four heritage colors
              </p>
            </div>

            <form onSubmit={handleSaveAppearance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 text-xs font-bold text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
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
                      className="flex-1 px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 font-mono text-xs bg-neutral-50 dark:bg-onyx-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
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
                      className="flex-1 px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 font-mono text-xs bg-neutral-50 dark:bg-onyx-800"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-none bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black font-bold text-xs uppercase tracking-wider transition shadow-md"
              >
                Save Brand Palette
              </button>
            </form>
          </div>
        )}

      </main>

      {/* =========================================================================
          ADD / EDIT GARMENT MODAL (SAVES TO MONGODB ATLAS)
      ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-onyx-900 rounded-none border-2 border-black dark:border-[#E6D3B3] max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-onyx-800 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#A6865A] dark:text-[#E6D3B3]">
                  ATELIER CATALOG
                </span>
                <h3 className="font-editorial text-2xl font-bold text-black dark:text-white">
                  {editingProductId ? "Edit Garment" : "Add New Garment to MongoDB"}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white text-xl p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-black dark:text-white mb-1">
                  Garment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Heritage Double-Breasted Overcoat"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 text-xs font-bold text-black dark:text-white"
                />
              </div>

              {/* Department & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Department (Gender) *
                  </label>
                  <select
                    value={productForm.person}
                    onChange={(e) => setProductForm({ ...productForm, person: e.target.value })}
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 font-bold text-xs text-black dark:text-white"
                  >
                    <option value="women">👩 Women's Collection</option>
                    <option value="men">👨 Men's Collection</option>
                    <option value="kids">👶 Kids Pret</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 font-bold text-xs text-black dark:text-white"
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
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Price in PKR (₨) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 font-bold text-xs text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Original / Strikethrough Price (₨)
                  </label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 font-bold text-xs text-black dark:text-white"
                  />
                </div>
              </div>

              {/* Color Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={productForm.primaryColor}
                    onChange={(e) => setProductForm({ ...productForm, primaryColor: e.target.value })}
                    placeholder="e.g. Desert Sand"
                    className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 text-xs text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-black dark:text-white mb-1">
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
                      className="flex-1 px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 font-mono text-xs bg-neutral-50 dark:bg-onyx-800 text-black dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-black dark:text-white mb-1">
                  Product Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 text-xs font-mono text-black dark:text-white"
                />
                {productForm.imageUrl && (
                  <div className="mt-2 w-16 h-20 rounded-none overflow-hidden border border-neutral-300 dark:border-onyx-700">
                    <img src={productForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Stock Quantity Per Size */}
              <div>
                <label className="block font-bold text-black dark:text-white mb-1">
                  Available Stock per Size:
                </label>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                    <div key={size}>
                      <span className="block font-mono text-[10px] text-neutral-500 mb-1">{size}</span>
                      <input
                        type="number"
                        min="0"
                        value={productForm[`stock${size}`]}
                        onChange={(e) => setProductForm({ ...productForm, [`stock${size}`]: e.target.value })}
                        className="w-full text-center px-1 py-1.5 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 font-bold text-xs text-black dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block font-bold text-black dark:text-white mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 text-xs text-black dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-none border border-neutral-300 dark:border-onyx-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-none bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save Garment to Database
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
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-onyx-800 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A6865A] dark:text-[#E6D3B3]">
                  ORDER SPECIFICATION
                </span>
                <h3 className="font-editorial text-2xl font-bold text-black dark:text-white">
                  {selectedOrderDetails.orderNumber || selectedOrderDetails.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-neutral-400 hover:text-black dark:hover:text-white text-xl p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Info Card */}
              <div className="p-3.5 rounded-none bg-neutral-100 dark:bg-onyx-850 border border-neutral-200 dark:border-onyx-800 space-y-1">
                <div className="font-bold text-black dark:text-white">
                  👤 Client: {selectedOrderDetails.customer?.firstName} {selectedOrderDetails.customer?.lastName}
                </div>
                <div>Email: <span className="font-mono">{selectedOrderDetails.customer?.email}</span></div>
                <div>Phone: <span className="font-mono font-bold text-black dark:text-[#E6D3B3]">{selectedOrderDetails.customer?.phone}</span></div>
                <div>Address: {selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city}</div>
                {selectedOrderDetails.customer?.orderNotes && (
                  <div className="pt-1 text-neutral-500 italic">Notes: "{selectedOrderDetails.customer?.orderNotes}"</div>
                )}
              </div>

              {/* Items List */}
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-500">
                  Ordered Items:
                </span>
                <div className="mt-2 divide-y divide-neutral-200 dark:divide-onyx-800 border border-neutral-200 dark:border-onyx-800 rounded-none overflow-hidden">
                  {(selectedOrderDetails.items || []).map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <strong className="block text-black dark:text-white">{item.name}</strong>
                        <span className="text-[11px] text-neutral-500">
                          Size: {item.size || item.selectedSize} • Color: {item.color || item.selectedColor} • Qty: {item.quantity || 1}
                        </span>
                      </div>
                      <span className="font-bold font-mono text-black dark:text-[#E6D3B3]">
                        Rs. {(item.price * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Pricing Summary */}
              <div className="p-3.5 rounded-none bg-neutral-50 dark:bg-onyx-800 border border-neutral-200 dark:border-onyx-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Payment Gateway</span>
                  <div className="font-bold uppercase font-mono">{selectedOrderDetails.paymentMethod}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Payable Total</span>
                  <div className="text-base font-black font-mono text-black dark:text-[#E6D3B3]">
                    Rs. {Number(selectedOrderDetails.total || selectedOrderDetails.pricing?.finalTotal || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Payment Proof Screenshot Inspection */}
              {selectedOrderDetails.paymentReceipt ? (
                <div className="p-3.5 rounded-none bg-neutral-100 dark:bg-onyx-800 border border-neutral-300 dark:border-onyx-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-[#A6865A] dark:text-[#E6D3B3]">
                      📎 Payment Proof Screenshot:
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                      {selectedOrderDetails.receiptFileName || 'payment_proof.jpg'}
                    </span>
                  </div>
                  <div
                    onClick={() => setEnlargedReceipt({
                      src: selectedOrderDetails.paymentReceipt,
                      fileName: selectedOrderDetails.receiptFileName
                    })}
                    className="relative group cursor-pointer border border-neutral-300 dark:border-onyx-700 bg-white dark:bg-black overflow-hidden flex items-center justify-center p-1"
                  >
                    <img
                      src={selectedOrderDetails.paymentReceipt}
                      alt="Customer Payment Receipt"
                      className="max-h-48 w-auto object-contain mx-auto transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold font-mono">
                      🔍 Click to Inspect Fullscreen
                    </div>
                  </div>
                </div>
              ) : ['jazzcash', 'easypaisa', 'bank'].includes((selectedOrderDetails.paymentMethod || '').toLowerCase()) ? (
                <div className="p-3 rounded-none bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-amber-800 dark:text-amber-300 text-[11px]">
                  ⚠️ Manual gateway order with no screenshot proof recorded.
                </div>
              ) : null}

              {/* Order Status & Verification Approval Actions */}
              <div className="pt-2 space-y-2.5">
                <label className="block font-bold text-black dark:text-white mb-1">
                  Change Fulfillment Status:
                </label>
                <select
                  value={selectedOrderDetails.status || 'processing'}
                  onChange={(e) => {
                    handleStatusChange(selectedOrderDetails.id || selectedOrderDetails.orderNumber, e.target.value);
                    setSelectedOrderDetails({ ...selectedOrderDetails, status: e.target.value });
                  }}
                  className="w-full px-3 py-2.5 rounded-none border border-neutral-300 dark:border-onyx-700 bg-neutral-50 dark:bg-onyx-800 font-bold text-xs text-black dark:text-white"
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
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black font-bold uppercase tracking-widest text-xs transition active:scale-95 shadow-sm rounded-none"
                  >
                    {approvalLoading ? 'Approving Consignment...' : '✓ Approve Order & Activate Live Tracking'}
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
                    const msg = `Assalam-o-Alaikum ${selectedOrderDetails.customer?.firstName || 'Valued Client'},\n\nYour Zaytoun Atelier order #${selectedOrderDetails.orderNumber || selectedOrderDetails.id} is ${selectedOrderDetails.status === 'approved' ? 'APPROVED' : 'CONFIRMED'}.\n\n📦 Courier: TCS Express (Tracking #: ${selectedOrderDetails.trackingNumber || 'TCS-99482104-PK'})\n🔗 Live Track: ${window.location.origin}/track/${selectedOrderDetails.orderNumber || selectedOrderDetails.id}\n\nThank you for choosing Zaytoun Atelier slow-fashion craftsmanship.`;
                    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase tracking-wider text-xs transition flex items-center justify-center space-x-2 rounded-none shadow-sm"
                >
                  <span>📱 Send Customer WhatsApp Notification</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Payment Receipt Modal */}
      {enlargedReceipt && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setEnlargedReceipt(null)}
        >
          <div
            className="relative max-w-3xl max-h-[92vh] bg-white dark:bg-onyx-900 border-2 border-black dark:border-[#E6D3B3] p-3 shadow-2xl rounded-none flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-mono text-xs font-bold text-onyx-900 dark:text-white">
                📎 {enlargedReceipt.fileName || 'Payment Proof Attachment'}
              </span>
              <button
                onClick={() => setEnlargedReceipt(null)}
                className="text-xs font-bold px-3 py-1 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-black dark:text-white rounded-none"
              >
                ✕ Close
              </button>
            </div>
            <div className="overflow-auto max-h-[80vh] flex items-center justify-center bg-neutral-50 dark:bg-black/50 p-2">
              <img
                src={enlargedReceipt.src}
                alt="Payment Proof Full"
                className="max-h-[75vh] w-auto object-contain mx-auto shadow-md"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
