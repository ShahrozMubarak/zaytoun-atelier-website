import React, { useState, useEffect, useMemo } from 'react';
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
    primaryColor: 'Olive Green',
    colorHex: '#364634',
    imageUrl: '',
    description: '',
    stockXS: 5,
    stockS: 10,
    stockM: 12,
    stockL: 8,
    stockXL: 4
  });

  // Appearance Form State
  const [brandName, setBrandName] = useState(themeConfig?.brand || "ZAYTOUN & CO.");
  const [oliveColor, setOliveColor] = useState(themeConfig?.olive || "#364634");
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
      primaryColor: 'Olive Green',
      colorHex: '#364634',
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
      primaryColor: prod.primaryColor || prod.colorName || 'Olive Green',
      colorHex: prod.color || '#364634',
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
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121411] text-onyx-950 dark:text-linen-100 font-sans flex flex-col transition-colors">
      
      {/* Top Executive Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#121411]/95 backdrop-blur-md border-b border-linen-300 dark:border-onyx-800 px-4 sm:px-8 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="font-editorial text-2xl font-black tracking-tight text-onyx-950 dark:text-white uppercase">
            {brandName}
          </span>
          <div className="border-l border-linen-300 dark:border-onyx-800 pl-3 flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400">
              MongoDB Atlas Live
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAllDataFromMongoDB}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-linen-300 dark:border-onyx-700 bg-white dark:bg-onyx-900 text-xs font-semibold text-onyx-800 dark:text-linen-200 hover:border-camel-500 shadow-sm transition active:scale-95"
            title="Refresh database records"
          >
            <span className={loading ? "animate-spin" : ""}>🔄</span>
            <span className="hidden sm:inline">{loading ? "Connecting..." : "Refresh MongoDB"}</span>
          </button>

          <button
            onClick={onCloseAdmin}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-olive-800 hover:bg-olive-900 text-white text-xs font-bold uppercase tracking-wider shadow transition active:scale-95"
          >
            <span>← Storefront</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 py-8 flex-1 space-y-8">
        
        {/* Title & Live Counters Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-linen-300 dark:border-onyx-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-camel-600 dark:text-camel-400 font-bold">
              ATELIER EXECUTIVE SYSTEM
            </span>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-onyx-950 dark:text-linen-50 mt-1">
              Admin & Database Portal
            </h1>
            <p className="text-xs text-onyx-600 dark:text-linen-400 mt-1">
              Live MongoDB cluster connection • Last synced: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={handleOpenCreateProduct}
            className="bg-olive-800 hover:bg-olive-900 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md transition active:scale-95 flex items-center space-x-2 self-start md:self-auto"
          >
            <span>+ Add New Garment</span>
          </button>
        </div>

        {/* Executive Tabs Bar */}
        <div className="sticky top-20 z-20 bg-[#FAF8F5]/95 dark:bg-[#121411]/95 backdrop-blur-md pt-2 pb-0 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-linen-300 dark:border-onyx-800 text-xs font-semibold overflow-x-auto flex items-center space-x-6 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            <span>📊 Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'products'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            <span>👗 Products Catalog</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-linen-200 dark:bg-onyx-800">
              {liveProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            <span>📦 Orders & Shipments</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-linen-200 dark:bg-onyx-800">
              {liveOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'customers'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            <span>👤 Customers</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-linen-200 dark:bg-onyx-800">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'subscribers'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            <span>📬 Subscribers & Messages</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-linen-200 dark:bg-onyx-800">
              {subscribers.length + inquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-3 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'appearance'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            <span>🎨 Palette & Brand</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: EXECUTIVE OVERVIEW DASHBOARD
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* 6 Key MongoDB Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-onyx-500 dark:text-linen-400 tracking-wider">
                  Total Revenue
                </span>
                <p className="text-xl sm:text-2xl font-black text-olive-800 dark:text-camel-400 mt-1">
                  Rs. {totalRevenue.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">● Paid & COD Booked</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-onyx-500 dark:text-linen-400 tracking-wider">
                  Total Orders
                </span>
                <p className="text-xl sm:text-2xl font-black text-onyx-950 dark:text-white mt-1">
                  {liveOrders.length}
                </p>
                <span className="text-[10px] text-onyx-500">In MongoDB Atlas</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-onyx-500 dark:text-linen-400 tracking-wider">
                  Total Garments
                </span>
                <p className="text-xl sm:text-2xl font-black text-onyx-950 dark:text-white mt-1">
                  {liveProducts.length}
                </p>
                <span className="text-[10px] text-camel-600 font-semibold">
                  {liveProducts.filter(p => (p.person || p.gender) === 'women').length}W • {liveProducts.filter(p => (p.person || p.gender) === 'men').length}M
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-onyx-500 dark:text-linen-400 tracking-wider">
                  Customers
                </span>
                <p className="text-xl sm:text-2xl font-black text-onyx-950 dark:text-white mt-1">
                  {customers.length}
                </p>
                <span className="text-[10px] text-onyx-500">Google Verified</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-onyx-500 dark:text-linen-400 tracking-wider">
                  Subscribers
                </span>
                <p className="text-xl sm:text-2xl font-black text-onyx-950 dark:text-white mt-1">
                  {subscribers.length}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Newsletter Active</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-onyx-500 dark:text-linen-400 tracking-wider">
                  Inquiries
                </span>
                <p className="text-xl sm:text-2xl font-black text-onyx-950 dark:text-white mt-1">
                  {inquiries.length}
                </p>
                <span className="text-[10px] text-onyx-500">Concierge Desk</span>
              </div>
            </div>

            {/* Low Inventory Alert Banner (if any item has <= 4 stock) */}
            {lowStockProducts.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-linen-200 dark:border-onyx-800 flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-onyx-950 dark:text-white">
                    Recent Customer Orders
                  </h3>
                  <p className="text-xs text-onyx-500 dark:text-linen-400">
                    Direct from MongoDB Atlas `orders` collection
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-olive-800 dark:text-camel-400 hover:underline"
                >
                  View All Orders ({liveOrders.length}) →
                </button>
              </div>

              {liveOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-onyx-500">
                  No customer orders in MongoDB yet. Place a test order from the storefront!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-linen-100 dark:bg-onyx-950 text-onyx-600 dark:text-linen-400 text-[10px] font-bold uppercase tracking-wider border-b border-linen-200 dark:border-onyx-800">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                      {liveOrders.slice(0, 5).map((ord) => (
                        <tr key={ord.id || ord.orderNumber} className="hover:bg-linen-50 dark:hover:bg-onyx-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-olive-800 dark:text-camel-400">
                            {ord.orderNumber || ord.id}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-onyx-900 dark:text-white">
                              {ord.customer?.firstName} {ord.customer?.lastName}
                            </span>
                            <span className="block text-[11px] text-onyx-500">{ord.customer?.phone}</span>
                          </td>
                          <td className="py-3 px-4 text-onyx-700 dark:text-linen-300 font-medium">
                            {ord.customer?.city || 'Lahore'}
                          </td>
                          <td className="py-3 px-4 font-mono uppercase text-[10px]">
                            <div className="flex items-center space-x-1.5">
                              <span>{ord.paymentMethod === 'cod' ? '💵 COD' : ord.paymentMethod?.toUpperCase()}</span>
                              {ord.paymentReceipt && (
                                <span className="px-1.5 py-0.5 bg-camel-100 text-camel-800 dark:bg-camel-900/50 dark:text-camel-300 font-bold text-[9px]">
                                  📎 PROOF
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-onyx-950 dark:text-white">
                            Rs. {Number(ord.total || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.status || 'processing'}
                              onChange={(e) => handleStatusChange(ord.id || ord.orderNumber, e.target.value)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 cursor-pointer"
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                      productDepartmentFilter === dept.id
                        ? 'bg-olive-800 text-white shadow-sm'
                        : 'bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-700 text-onyx-700 dark:text-linen-300 hover:border-camel-500'
                    }`}
                  >
                    <span>{dept.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      productDepartmentFilter === dept.id ? 'bg-olive-900 text-white' : 'bg-linen-200 dark:bg-onyx-800'
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
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-700 text-onyx-950 dark:text-white outline-none focus:border-camel-500"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-linen-100 dark:bg-onyx-950 text-onyx-600 dark:text-linen-400 text-[10px] font-bold uppercase tracking-wider border-b border-linen-200 dark:border-onyx-800 shadow-sm">
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
                  <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                    {filteredProducts.map((p) => {
                      const totalStock = p.stock !== undefined
                        ? Number(p.stock)
                        : p.stockPerSize
                          ? Object.values(p.stockPerSize).reduce((acc, v) => acc + Number(v), 0)
                          : 0;

                      const dept = (p.person || p.gender || 'women').toLowerCase();

                      return (
                        <tr key={p.id} className="hover:bg-linen-50 dark:hover:bg-onyx-850 transition">
                          {/* Photo */}
                          <td className="py-3 px-4">
                            <div className="w-12 h-14 rounded-lg overflow-hidden bg-linen-200 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 flex-shrink-0">
                              <img
                                src={p.images?.[0] || p.image || "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80"}
                                alt={p.name}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          </td>

                          {/* Title & SKU */}
                          <td className="py-3 px-4 font-bold text-onyx-950 dark:text-white">
                            <div>{p.name}</div>
                            <span className="text-[10px] font-mono font-normal text-onyx-400">
                              SKU: {p.id}
                            </span>
                          </td>

                          {/* Department (Men / Women / Kids) */}
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              dept === 'men'
                                ? 'bg-camel-100 dark:bg-camel-950 text-camel-800 dark:text-camel-300 border border-camel-300'
                                : dept === 'women'
                                  ? 'bg-olive-100 dark:bg-olive-950 text-olive-900 dark:text-olive-300 border border-olive-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {dept === 'men' ? '👨 Men' : dept === 'women' ? '👩 Women' : '👶 Kids'}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 font-medium text-onyx-700 dark:text-linen-300">
                            {p.category || p.slot || 'Apparel'}
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 font-bold text-olive-800 dark:text-camel-400">
                            Rs. {Number(p.price || 0).toLocaleString()}
                          </td>

                          {/* Stock Breakdown */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`font-bold ${totalStock <= 4 ? 'text-amber-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                {totalStock} total
                              </span>
                              {p.stockPerSize && (
                                <span className="text-[10px] text-onyx-400 font-mono">
                                  ({Object.entries(p.stockPerSize).map(([sz, count]) => `${sz}:${count}`).join(' ')})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="px-2.5 py-1 rounded-lg bg-linen-200 dark:bg-onyx-800 text-onyx-800 dark:text-linen-200 font-bold hover:bg-linen-300 text-[11px]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProductClick(p.id, p.name)}
                              className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 text-[11px]"
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
                  className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-700 font-bold text-onyx-800 dark:text-white"
                >
                  <option value="all">All Statuses ({liveOrders.length})</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Payment Selector */}
                <select
                  value={orderFilterPayment}
                  onChange={(e) => setOrderFilterPayment(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-700 font-bold text-onyx-800 dark:text-white"
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
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-700 text-onyx-950 dark:text-white outline-none focus:border-camel-500"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 overflow-hidden shadow-sm">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-onyx-500">
                  No orders matching the active search or filters in MongoDB Atlas.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-linen-100 dark:bg-onyx-950 text-onyx-600 dark:text-linen-400 text-[10px] font-bold uppercase tracking-wider border-b border-linen-200 dark:border-onyx-800 shadow-sm">
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
                    <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id || ord.orderNumber} className="hover:bg-linen-50 dark:hover:bg-onyx-850 transition">
                          <td className="py-3 px-4 font-mono font-bold text-olive-800 dark:text-camel-400">
                            {ord.orderNumber || ord.id}
                          </td>
                          <td className="py-3 px-4 text-onyx-500 text-[11px]">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </td>
                          <td className="py-3 px-4 font-bold text-onyx-900 dark:text-white">
                            {ord.customer?.firstName} {ord.customer?.lastName}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-onyx-700 dark:text-linen-300">
                            {ord.customer?.phone}
                          </td>
                          <td className="py-3 px-4 font-medium text-onyx-700 dark:text-linen-300">
                            {ord.customer?.city || 'Lahore'}
                          </td>
                          <td className="py-3 px-4 font-mono uppercase text-[10px]">
                            <div className="flex items-center space-x-1.5">
                              <span>{ord.paymentMethod === 'cod' ? '💵 COD' : ord.paymentMethod?.toUpperCase()}</span>
                              {ord.paymentReceipt && (
                                <span className="px-1.5 py-0.5 bg-camel-100 text-camel-800 dark:bg-camel-900/50 dark:text-camel-300 font-bold text-[9px]">
                                  📎 PROOF
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-onyx-600 font-mono">
                            {ord.items?.length || 1} pcs
                          </td>
                          <td className="py-3 px-4 font-bold text-onyx-950 dark:text-white">
                            Rs. {Number(ord.total || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.status || 'processing'}
                              onChange={(e) => handleStatusChange(ord.id || ord.orderNumber, e.target.value)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 cursor-pointer"
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
                              className="font-bold text-camel-600 hover:text-camel-800 underline text-xs"
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
                <h3 className="font-editorial text-2xl font-bold text-onyx-950 dark:text-white">
                  Customer Directory ({customers.length})
                </h3>
                <p className="text-xs text-onyx-500 dark:text-linen-400">
                  Registered shopper accounts and customer profiles in MongoDB Atlas `customers` collection
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 overflow-hidden shadow-sm">
              {customers.length === 0 ? (
                <div className="p-12 text-center text-xs text-onyx-500">
                  No customers registered yet. Customer profiles are automatically created when shoppers place an order or sign in with Google.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-linen-100 dark:bg-onyx-950 text-onyx-600 dark:text-linen-400 text-[10px] font-bold uppercase tracking-wider border-b border-linen-200 dark:border-onyx-800 shadow-sm">
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
                    <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                      {customers.map((c) => (
                        <tr key={c._id || c.email} className="hover:bg-linen-50 dark:hover:bg-onyx-850 transition">
                          <td className="py-3 px-4 font-bold text-onyx-950 dark:text-white">
                            {c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Client'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-onyx-700 dark:text-linen-300">
                            {c.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-onyx-700 dark:text-linen-300">
                            {c.phone || '—'}
                          </td>
                          <td className="py-3 px-4 text-onyx-800 dark:text-linen-200">
                            {c.city || '—'}, {c.province || ''}
                          </td>
                          <td className="py-3 px-4 text-onyx-600 dark:text-linen-400 max-w-xs truncate">
                            {c.address || '—'}
                          </td>
                          <td className="py-3 px-4 font-bold text-olive-800 dark:text-camel-400">
                            {c.ordersCount || 0}
                          </td>
                          <td className="py-3 px-4 font-bold text-onyx-950 dark:text-white">
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
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-linen-200 dark:border-onyx-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-onyx-950 dark:text-white">
                    Newsletter Subscribers ({subscribers.length})
                  </h3>
                  <p className="text-xs text-onyx-500 dark:text-linen-400">
                    Direct from MongoDB Atlas `subscribers` collection
                  </p>
                </div>
                <button
                  onClick={handleCopySubscriberEmails}
                  className="px-4 py-2 bg-olive-800 hover:bg-olive-900 text-white text-xs font-bold rounded-xl transition active:scale-95 whitespace-nowrap shadow-sm"
                >
                  {copiedEmails ? '✓ Copied All Emails!' : 'Copy All Emails (CSV)'}
                </button>
              </div>

              {subscribers.length === 0 ? (
                <div className="p-8 text-center text-xs text-onyx-500">
                  No subscribers recorded in MongoDB yet. Try subscribing from the homepage footer!
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-linen-100 dark:bg-onyx-950 text-onyx-600 dark:text-linen-400 text-[10px] font-bold uppercase tracking-wider border-b border-linen-200 dark:border-onyx-800 shadow-sm">
                      <tr>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Source</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Subscribed At</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                      {subscribers.map((sub) => (
                        <tr key={sub._id || sub.email} className="hover:bg-linen-50 dark:hover:bg-onyx-850 transition">
                          <td className="py-3 px-4 font-mono font-bold text-onyx-950 dark:text-white">
                            {sub.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-linen-200 dark:bg-onyx-800 text-onyx-700 dark:text-linen-300 font-mono">
                              {sub.source || 'website'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-semibold uppercase">
                              {sub.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-onyx-500">
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
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-linen-200 dark:border-onyx-800">
                <h3 className="font-editorial text-xl font-bold text-onyx-950 dark:text-white">
                  Concierge & Client Inquiries ({inquiries.length})
                </h3>
                <p className="text-xs text-onyx-500 dark:text-linen-400">
                  Messages submitted through the Concierge / Contact page stored in MongoDB Atlas `inquiries`
                </p>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-8 text-center text-xs text-onyx-500">
                  No inquiries in MongoDB yet.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-linen-100 dark:bg-onyx-950 text-onyx-600 dark:text-linen-400 text-[10px] font-bold uppercase tracking-wider border-b border-linen-200 dark:border-onyx-800 shadow-sm">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Order Ref</th>
                        <th className="py-3 px-4">Message</th>
                        <th className="py-3 px-4">Received At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                      {inquiries.map((inq) => (
                        <tr key={inq._id || inq.createdAt} className="hover:bg-linen-50 dark:hover:bg-onyx-850 transition">
                          <td className="py-3 px-4 font-bold text-onyx-950 dark:text-white">
                            {inq.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-onyx-700 dark:text-linen-300">
                            {inq.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-camel-600">
                            {inq.orderNumber || '—'}
                          </td>
                          <td className="py-3 px-4 text-onyx-700 dark:text-linen-300 max-w-md">
                            {inq.message}
                          </td>
                          <td className="py-3 px-4 text-onyx-500 text-[11px]">
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
          <div className="max-w-2xl bg-white dark:bg-onyx-900 p-8 rounded-3xl border border-linen-300 dark:border-onyx-800 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-editorial text-2xl font-bold text-onyx-950 dark:text-white">
                Store Branding & Palette Settings
              </h3>
              <p className="text-xs text-onyx-500 dark:text-linen-400 mt-0.5">
                Customize brand headline and the four heritage colors
              </p>
            </div>

            <form onSubmit={handleSaveAppearance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 text-xs font-bold text-onyx-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                    Olive Tone (Primary)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={oliveColor}
                      onChange={(e) => setOliveColor(e.target.value)}
                      className="w-9 h-8 rounded border border-linen-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={oliveColor}
                      onChange={(e) => setOliveColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-linen-300 dark:border-onyx-700 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                    Camel Tone (Secondary Accent)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={camelColor}
                      onChange={(e) => setCamelColor(e.target.value)}
                      className="w-9 h-8 rounded border border-linen-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={camelColor}
                      onChange={(e) => setCamelColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-linen-300 dark:border-onyx-700 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-olive-800 hover:bg-olive-900 text-white font-bold text-xs uppercase tracking-wider transition shadow-md"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-onyx-900 rounded-3xl border border-linen-300 dark:border-onyx-800 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-linen-200 dark:border-onyx-800 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-camel-600 dark:text-camel-400">
                  ATELIER CATALOG
                </span>
                <h3 className="font-editorial text-2xl font-bold text-onyx-950 dark:text-white">
                  {editingProductId ? "Edit Garment" : "Add New Garment to MongoDB"}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-onyx-400 hover:text-onyx-900 dark:hover:text-white text-xl p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                  Garment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Heritage Double-Breasted Overcoat"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 text-xs font-bold text-onyx-950 dark:text-white"
                />
              </div>

              {/* Department & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                    Department (Gender) *
                  </label>
                  <select
                    value={productForm.person}
                    onChange={(e) => setProductForm({ ...productForm, person: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 font-bold text-xs"
                  >
                    <option value="women">👩 Women's Collection</option>
                    <option value="men">👨 Men's Collection</option>
                    <option value="kids">👶 Kids Pret</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 font-bold text-xs"
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
                  <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                    Price in PKR (₨) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                    Original / Strikethrough Price (₨)
                  </label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Color Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={productForm.primaryColor}
                    onChange={(e) => setProductForm({ ...productForm, primaryColor: e.target.value })}
                    placeholder="e.g. Olive Green"
                    className="w-full px-3 py-2 rounded-xl border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                    Color Hex Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={productForm.colorHex}
                      onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                      className="w-8 h-8 rounded border border-linen-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={productForm.colorHex}
                      onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-linen-300 dark:border-onyx-700 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                  Product Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 text-xs font-mono"
                />
                {productForm.imageUrl && (
                  <div className="mt-2 w-16 h-20 rounded-lg overflow-hidden border border-linen-300 dark:border-onyx-700">
                    <img src={productForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Stock Quantity Per Size */}
              <div>
                <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                  Available Stock per Size:
                </label>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                    <div key={size}>
                      <span className="block font-mono text-[10px] text-onyx-500 mb-1">{size}</span>
                      <input
                        type="number"
                        min="0"
                        value={productForm[`stock${size}`]}
                        onChange={(e) => setProductForm({ ...productForm, [`stock${size}`]: e.target.value })}
                        className="w-full text-center px-1 py-1.5 rounded-lg border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 font-bold text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-linen-300 dark:border-onyx-700 text-xs font-bold text-onyx-700 dark:text-linen-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-olive-800 hover:bg-olive-900 text-white text-xs font-bold uppercase tracking-wider shadow-md"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-onyx-900 rounded-3xl border border-linen-300 dark:border-onyx-800 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-linen-200 dark:border-onyx-800 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-camel-600">
                  ORDER SPECIFICATION
                </span>
                <h3 className="font-editorial text-2xl font-bold text-onyx-950 dark:text-white">
                  {selectedOrderDetails.orderNumber || selectedOrderDetails.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-onyx-400 hover:text-onyx-900 dark:hover:text-white text-xl p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Info Card */}
              <div className="p-3.5 rounded-2xl bg-linen-100 dark:bg-onyx-850 space-y-1">
                <div className="font-bold text-onyx-900 dark:text-white">
                  👤 Client: {selectedOrderDetails.customer?.firstName} {selectedOrderDetails.customer?.lastName}
                </div>
                <div>Email: <span className="font-mono">{selectedOrderDetails.customer?.email}</span></div>
                <div>Phone: <span className="font-mono font-bold text-olive-800 dark:text-camel-400">{selectedOrderDetails.customer?.phone}</span></div>
                <div>Address: {selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city}</div>
                {selectedOrderDetails.customer?.orderNotes && (
                  <div className="pt-1 text-onyx-500 italic">Notes: "{selectedOrderDetails.customer?.orderNotes}"</div>
                )}
              </div>

              {/* Items List */}
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-onyx-500">
                  Ordered Items:
                </span>
                <div className="mt-2 divide-y divide-linen-200 dark:divide-onyx-800 border border-linen-200 dark:border-onyx-800 rounded-xl overflow-hidden">
                  {(selectedOrderDetails.items || []).map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <strong className="block text-onyx-900 dark:text-white">{item.name}</strong>
                        <span className="text-[11px] text-onyx-500">
                          Size: {item.size || item.selectedSize} • Color: {item.color || item.selectedColor} • Qty: {item.quantity || 1}
                        </span>
                      </div>
                      <span className="font-bold text-olive-800 dark:text-camel-400">
                        Rs. {(item.price * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Pricing Summary */}
              <div className="p-3.5 rounded-2xl bg-linen-50 dark:bg-onyx-800 border border-linen-200 dark:border-onyx-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-onyx-500">Payment Gateway</span>
                  <div className="font-bold uppercase font-mono">{selectedOrderDetails.paymentMethod}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-onyx-500">Payable Total</span>
                  <div className="text-base font-black text-olive-800 dark:text-camel-400">
                    Rs. {Number(selectedOrderDetails.total || selectedOrderDetails.pricing?.finalTotal || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Payment Proof Screenshot Inspection */}
              {selectedOrderDetails.paymentReceipt ? (
                <div className="p-3.5 rounded-none bg-linen-100 dark:bg-onyx-850 border border-linen-300 dark:border-onyx-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-camel-600 dark:text-camel-400">
                      📎 Payment Proof Screenshot:
                    </span>
                    <span className="text-[10px] font-mono text-onyx-500 dark:text-linen-400">
                      {selectedOrderDetails.receiptFileName || 'payment_proof.jpg'}
                    </span>
                  </div>
                  <div
                    onClick={() => setEnlargedReceipt({
                      src: selectedOrderDetails.paymentReceipt,
                      fileName: selectedOrderDetails.receiptFileName
                    })}
                    className="relative group cursor-pointer border border-linen-300 dark:border-onyx-700 bg-white dark:bg-black overflow-hidden flex items-center justify-center p-1"
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
                <label className="block font-bold text-onyx-700 dark:text-linen-300 mb-1">
                  Change Fulfillment Status:
                </label>
                <select
                  value={selectedOrderDetails.status || 'processing'}
                  onChange={(e) => {
                    handleStatusChange(selectedOrderDetails.id || selectedOrderDetails.orderNumber, e.target.value);
                    setSelectedOrderDetails({ ...selectedOrderDetails, status: e.target.value });
                  }}
                  className="w-full px-3 py-2.5 rounded-none border border-linen-300 dark:border-onyx-700 bg-linen-50 dark:bg-onyx-800 font-bold text-xs"
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
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white dark:bg-camel-500 dark:hover:bg-camel-600 dark:text-onyx-950 font-bold uppercase tracking-widest text-xs transition active:scale-95 shadow-sm rounded-none"
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
            className="relative max-w-3xl max-h-[92vh] bg-white dark:bg-onyx-900 border border-neutral-700 p-3 shadow-2xl rounded-none flex flex-col"
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
