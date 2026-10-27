import React, { useState, useEffect } from 'react';
import * as FormeEngine from '../engine/formeEngine';
import { fetchSubscribersFromDB, deleteSubscriberFromDB, fetchCustomersFromDB, fetchInquiriesFromDB } from '../services/api';

export default function AdminDashboard({
  orders,
  onUpdateOrderStatus,
  products,
  onAddProduct,
  onUpdateProductStock,
  onUpdateProductPrice,
  onDeleteProduct,
  onImportCatalog,
  themeConfig,
  onUpdateTheme,
  onCloseAdmin,
  onTryOnProduct
}) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'appearance' | 'orders' | 'logistics' | 'subscribers'
  
  // Subscribers & Customers State (MongoDB)
  const [subscribers, setSubscribers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [copiedEmails, setCopiedEmails] = useState(false);

  useEffect(() => {
    fetchSubscribersFromDB().then(data => {
      if (Array.isArray(data)) setSubscribers(data);
    });
    fetchCustomersFromDB().then(data => {
      if (Array.isArray(data)) setCustomers(data);
    });
    fetchInquiriesFromDB().then(data => {
      if (Array.isArray(data)) setInquiries(data);
    });
  }, [activeTab]);

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm("Remove this subscriber from MongoDB?")) return;
    const ok = await deleteSubscriberFromDB(id);
    if (ok) {
      setSubscribers(prev => prev.filter(s => s._id !== id));
    }
  };

  const handleCopySubscriberEmails = () => {
    if (subscribers.length === 0) return;
    const list = subscribers.map(s => s.email).join(', ');
    navigator.clipboard.writeText(list);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 3000);
  };

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit'
  const [editProductId, setEditProductId] = useState(null);

  // Guide Dialog State
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Order filters
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderFilterPayment, setOrderFilterPayment] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Editor Form State
  const [formState, setFormState] = useState({
    name: 'The Artisan Linen Shirt',
    person: 'women',
    slot: 'top',
    style: 'shirt',
    price: 13500,
    originalPrice: 16000,
    colorName: 'Olive Green',
    colorHex: '#364634',
    description: 'A relaxed silhouette tailored from breathable natural fibers.',
    stockXS: 4,
    stockS: 8,
    stockM: 10,
    stockL: 5,
    stockXL: 2,
    assetX: 100,
    assetY: 125,
    assetWidth: 200,
    assetHeight: 200,
    customSrc: ''
  });

  // Appearance Form State
  const [brandName, setBrandName] = useState(themeConfig?.brand || "ZAYTOUN & CO.");
  const [oliveColor, setOliveColor] = useState(themeConfig?.olive || "#364634");
  const [camelColor, setCamelColor] = useState(themeConfig?.camel || "#C69F6F");
  const [linenColor, setLinenColor] = useState(themeConfig?.linen || "#FAF8F5");
  const [onyxColor, setOnyxColor] = useState(themeConfig?.onyx || "#111315");

  const presetThemes = [
    {
      name: "ZAYTOUN Heritage",
      olive: "#364634",
      camel: "#C69F6F",
      linen: "#FAF8F5",
      onyx: "#111315"
    },
    {
      name: "Sahara Dune",
      olive: "#2D3F2C",
      camel: "#C29B68",
      linen: "#F7F4EE",
      onyx: "#17181A"
    },
    {
      name: "Noir & Antique Gold",
      olive: "#1F2321",
      camel: "#D4AF37",
      linen: "#FFFFFF",
      onyx: "#0C0D0E"
    },
    {
      name: "Terracotta & Sage",
      olive: "#5E735B",
      camel: "#99583D",
      linen: "#F5F2EB",
      onyx: "#1C1917"
    }
  ];

  const handleApplyPreset = (preset) => {
    setOliveColor(preset.olive);
    setCamelColor(preset.camel);
    setLinenColor(preset.linen);
    setOnyxColor(preset.onyx);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditorMode('create');
    setEditProductId(null);
    setFormState({
      name: 'New Atelier Piece',
      person: 'women',
      slot: 'top',
      style: 'knit',
      price: 12500,
      originalPrice: 15000,
      colorName: 'Olive Green',
      colorHex: '#364634',
      description: 'Crafted in pure earth tones with structured drape.',
      stockXS: 5,
      stockS: 10,
      stockM: 10,
      stockL: 5,
      stockXL: 2,
      assetX: 100,
      assetY: 125,
      assetWidth: 200,
      assetHeight: 200,
      customSrc: ''
    });
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditorMode('edit');
    setEditProductId(product.id);
    const activeColor = product.colors?.[0] || { name: 'Olive Green', hex: '#364634' };
    setFormState({
      name: product.name,
      person: product.person || 'women',
      slot: product.slot || 'top',
      style: product.style || 'knit',
      price: product.price || 10000,
      originalPrice: product.originalPrice || product.price,
      colorName: activeColor.name,
      colorHex: activeColor.hex,
      description: product.description || '',
      stockXS: product.stockPerSize?.XS ?? 5,
      stockS: product.stockPerSize?.S ?? 10,
      stockM: product.stockPerSize?.M ?? 10,
      stockL: product.stockPerSize?.L ?? 5,
      stockXL: product.stockPerSize?.XL ?? 2,
      assetX: product.asset?.x ?? 100,
      assetY: product.asset?.y ?? 125,
      assetWidth: product.asset?.width ?? 200,
      assetHeight: product.asset?.height ?? 200,
      customSrc: product.asset?.src ?? ''
    });
    setIsEditorOpen(true);
  };

  // File cutout upload
  const handleImageCutoutUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Image is too large. Please use a PNG or WebP under 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormState((prev) => ({
        ...prev,
        style: 'custom',
        customSrc: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Dynamic preview garment for live sticky mannequin in editor
  const previewGarment = {
    id: editProductId || 'forme-preview',
    name: formState.name,
    person: formState.person,
    slot: formState.slot,
    style: formState.style,
    price: Number(formState.price),
    description: formState.description,
    colors: [{ name: formState.colorName, hex: formState.colorHex }],
    asset:
      formState.style === 'custom' && formState.customSrc
        ? {
            src: formState.customSrc,
            x: Number(formState.assetX),
            y: Number(formState.assetY),
            width: Number(formState.assetWidth),
            height: Number(formState.assetHeight)
          }
        : undefined
  };

  const editorMannequinSvg = FormeEngine.mannequin(formState.person, [
    { product: previewGarment, variant: 0 }
  ]);

  // Handle Form Submit (Add or Update)
  const handleSubmitPiece = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      alert("Please enter a garment title.");
      return;
    }

    const cleanName = formState.name.trim().replace(/[<>]/g, '');
    const cleanDesc = (formState.description || '').trim().replace(/[<>]/g, '');
    const validPrice = Math.max(100, Math.min(2000000, Number(formState.price) || 1000));
    const validOrigPrice = Math.max(validPrice, Math.min(2000000, Number(formState.originalPrice) || validPrice));
    const validHex = /^#[0-9A-Fa-f]{6}$/.test(formState.colorHex) ? formState.colorHex : '#364634';

    const targetId = editProductId || `forme-${Date.now().toString(36)}`;
    const newPiece = {
      id: targetId,
      name: cleanName,
      slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      person: formState.person,
      category:
        formState.person === 'women'
          ? "Women's Pret"
          : formState.person === 'men'
          ? "Men's Collection"
          : "Kids Pret",
      slot: formState.slot,
      style: formState.style,
      collection: "Earth Edit 2026",
      price: validPrice,
      originalPrice: validOrigPrice,
      badge: editorMode === 'create' ? "New Arrival" : "Atelier Curated",
      rating: 5.0,
      reviewCount: 1,
      primaryColor: formState.colorName,
      colors: [
        { name: formState.colorName, hex: validHex, bgClass: `bg-[${validHex}]` },
        { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
        { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" }
      ],
      sizes: formState.person === 'kids' ? ["4–5", "6–7", "8–9", "10–11"] : ["XS", "S", "M", "L", "XL"],
      stockPerSize: {
        XS: Math.max(0, parseInt(formState.stockXS, 10) || 0),
        S: Math.max(0, parseInt(formState.stockS, 10) || 0),
        M: Math.max(0, parseInt(formState.stockM, 10) || 0),
        L: Math.max(0, parseInt(formState.stockL, 10) || 0),
        XL: Math.max(0, parseInt(formState.stockXL, 10) || 0)
      },
      images: [
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
      ],
      description: cleanDesc,
      fabric: "100% Sustainable Linen / Mongolian Cashmere Blend",
      care: "Delicate dry clean or hand wash cold.",
      fit: "Tailored comfortable silhouette.",
      asset: previewGarment.asset
    };

    if (editorMode === 'edit') {
      onDeleteProduct(targetId);
    }
    onAddProduct(newPiece);
    setIsEditorOpen(false);
  };

  // Export JSON Catalog
  const handleExportCatalog = () => {
    const catalogData = {
      version: 1,
      theme: {
        brand: themeConfig?.brand || "ZAYTOUN & CO.",
        olive: themeConfig?.olive || "#364634",
        camel: themeConfig?.camel || "#C69F6F"
      },
      products: products
    };

    const blob = new Blob([JSON.stringify(catalogData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Import JSON Catalog
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const validated = FormeEngine.validateCatalog(json);
        onImportCatalog(validated.products);
        if (validated.theme) {
          onUpdateTheme(validated.theme);
        }
        alert(`Successfully imported catalog with ${validated.products.length} garments.`);
      } catch (err) {
        alert("Invalid catalog JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Save Appearance
  const handleSaveAppearance = (e) => {
    e.preventDefault();
    onUpdateTheme({
      brand: brandName.trim() || "ZAYTOUN & CO.",
      olive: oliveColor,
      camel: camelColor,
      linen: linenColor,
      onyx: onyxColor
    });
    alert("Store colors and brand appearance updated successfully!");
  };

  const handleResetAppearance = () => {
    setBrandName("ZAYTOUN & CO.");
    setOliveColor("#364634");
    setCamelColor("#C69F6F");
    setLinenColor("#FAF8F5");
    setOnyxColor("#111315");
    onUpdateTheme({
      brand: "ZAYTOUN & CO.",
      olive: "#364634",
      camel: "#C69F6F",
      linen: "#FAF8F5",
      onyx: "#111315"
    });
  };

  // Order stats & filtering
  const totalRevenue = orders.reduce((acc, order) => {
    return acc + (order.pricing?.finalTotal || order.amount || 0);
  }, 0);

  const filteredOrders = orders.filter((order) => {
    const statusMatches =
      orderFilterStatus === 'all' ||
      (order.status || 'Processing').toLowerCase() === orderFilterStatus.toLowerCase();
    const paymentMatches =
      orderFilterPayment === 'all' || order.paymentMethod === orderFilterPayment;
    const q = orderSearchQuery.trim().toLowerCase();
    const searchMatches =
      !q ||
      (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
      (order.customer?.firstName && order.customer.firstName.toLowerCase().includes(q)) ||
      (order.customer?.lastName && order.customer.lastName.toLowerCase().includes(q)) ||
      (order.customer?.city && order.customer.city.toLowerCase().includes(q));

    return statusMatches && paymentMatches && searchMatches;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Processing':
        return 'bg-blue-100 text-blue-900 border border-blue-300';
      case 'Dispatched':
        return 'bg-purple-100 text-purple-900 border border-purple-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      default:
        return 'bg-olive-100 text-olive-900 border border-olive-300';
    }
  };

  const getPaymentBadge = (method) => {
    switch (method) {
      case 'cod':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'card':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'jazzcash':
        return 'bg-red-100 text-red-900 border-red-200';
      case 'easypaisa':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#191C17] text-onyx-950 dark:text-linen-100 font-sans flex flex-col transition-colors">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#191C17]/90 backdrop-blur-md border-b border-linen-300 dark:border-onyx-800 px-4 sm:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-editorial text-2xl font-bold tracking-[0.2em] uppercase">
            {themeConfig?.brand || "ZAYTOUN"}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-camel-700 dark:text-camel-400 border-l border-linen-300 dark:border-onyx-800 pl-3">
            Atelier Studio
          </span>
        </div>

        <button
          onClick={onCloseAdmin}
          className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-onyx-800 dark:text-linen-200 hover:text-olive-700 dark:hover:text-camel-400 transition"
        >
          <span>← Return to Storefront</span>
        </button>
      </header>

      {/* Main Studio Container */}
      <main className="max-w-[1500px] w-full mx-auto px-4 sm:px-8 py-10 flex-1 space-y-8">
        
        {/* FORME-Inspired Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-camel-700 dark:text-camel-400">
              YOUR STORE, YOUR WAY
            </div>
            <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-onyx-950 dark:text-linen-50 mt-1">
              The studio<span className="text-camel-600">.</span>
            </h1>
            <p className="text-xs sm:text-sm text-onyx-600 dark:text-linen-300 mt-1">
              A little space to curate your collection and align garments on your 2D mannequin model.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-olive-800 hover:bg-olive-900 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-sm shadow-md transition active:scale-95 flex items-center space-x-2 self-start sm:self-auto"
          >
            <span>+ Add a piece</span>
          </button>
        </div>

        {/* Studio Note Banner */}
        <div className="p-4 rounded-xl bg-linen-200/60 dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 text-onyx-700 dark:text-linen-200">
            <span className="text-base text-olive-700 dark:text-camel-400">ℹ</span>
            <span>
              This atelier studio saves edits in this browser. Export your catalog as <strong>products.json</strong> to share or deploy, and test live Try-On on the model directly.
            </span>
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="text-xs font-bold text-olive-800 dark:text-camel-400 hover:underline flex items-center space-x-1 whitespace-nowrap self-start sm:self-auto"
          >
            <span>Integration guide</span>
            <span>↗</span>
          </button>
        </div>

        {/* Tabs Bar (Sticky with horizontal scroll) */}
        <div className="sticky top-20 z-20 bg-[#FAF8F5]/95 dark:bg-[#191C17]/95 backdrop-blur-md pt-2 pb-0 -mx-4 sm:-mx-8 px-4 sm:px-8 border-b border-linen-300 dark:border-onyx-800 text-xs font-semibold overflow-x-auto flex items-center space-x-6 sm:space-x-8 scrollbar-none">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 transition relative whitespace-nowrap ${
              activeTab === 'products'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-3 transition relative ${
              activeTab === 'appearance'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            Appearance & Palette
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 transition relative ${
              activeTab === 'orders'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            Customer Orders & Pakistani Gateways ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('logistics')}
            className={`pb-3 transition relative ${
              activeTab === 'logistics'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            Logistics & Couriers (TCS / Leopards / Trax)
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`pb-3 transition relative ${
              activeTab === 'subscribers'
                ? 'text-onyx-950 dark:text-linen-50 font-bold border-b-2 border-olive-700 dark:border-camel-400'
                : 'text-onyx-500 dark:text-linen-400 hover:text-onyx-900'
            }`}
          >
            Audience & Subscribers ({subscribers.length})
          </button>
        </div>

        {/* =========================================================================
            TAB 1: PRODUCTS TABLE (Exact FORME Studio layout)
        ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div className="text-xs text-onyx-500 dark:text-linen-400">
                <span>{products.length} pieces in catalog</span> •{' '}
                <span>{products.filter((p) => p.person === 'women').length} Women</span> •{' '}
                <span>{products.filter((p) => p.person === 'men').length} Men</span> •{' '}
                <span>{products.filter((p) => p.person === 'kids').length} Kids</span>
              </div>

              <div className="flex items-center space-x-3">
                <label className="border border-linen-300 dark:border-onyx-700 hover:border-camel-400 text-onyx-800 dark:text-linen-200 text-xs font-semibold px-4 py-2 rounded cursor-pointer transition flex items-center space-x-1.5">
                  <span>↑ Import JSON</span>
                  <input type="file" accept=".json,application/json" onChange={handleImportFile} className="hidden" />
                </label>
                <button
                  onClick={handleExportCatalog}
                  className="border border-linen-300 dark:border-onyx-700 hover:border-camel-400 text-onyx-800 dark:text-linen-200 text-xs font-semibold px-4 py-2 rounded transition flex items-center space-x-1.5"
                >
                  <span>↓ Export catalog</span>
                </button>
              </div>
            </div>

            {/* Products Table (Scrollable with Sticky Header) */}
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-xl border border-linen-300 dark:border-onyx-800 bg-white dark:bg-onyx-900 shadow-sm scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-linen-100 dark:bg-onyx-950 text-onyx-500 dark:text-linen-400 border-b border-linen-200 dark:border-onyx-800 font-bold uppercase tracking-wider text-[10px] shadow-sm">
                  <tr>
                    <th className="py-3.5 px-5">Piece</th>
                    <th className="py-3.5 px-4">Collection</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Try-on Asset</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                  {products.map((p) => {
                    const primaryColor = p.colors?.[0] || { name: 'Olive Green', hex: '#364634' };
                    return (
                      <tr key={p.id} className="hover:bg-linen-50 dark:hover:bg-onyx-800/40 transition">
                        
                        {/* Piece Name & Thumbnail */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-3.5">
                            <div
                              className="w-10 h-12 bg-linen-100 dark:bg-onyx-950 rounded overflow-hidden flex items-center justify-center p-0.5 flex-shrink-0"
                              dangerouslySetInnerHTML={{ __html: FormeEngine.thumb(p, 0) }}
                            />
                            <div>
                              <strong className="block text-onyx-950 dark:text-linen-50 text-xs font-bold">
                                {p.name}
                              </strong>
                              <small className="block text-[10px] text-onyx-500 dark:text-linen-400">
                                {primaryColor.name} • {p.style || p.slot}
                              </small>
                            </div>
                          </div>
                        </td>

                        {/* Collection */}
                        <td className="py-3.5 px-4 capitalize font-medium text-onyx-700 dark:text-linen-300">
                          {p.person}
                        </td>

                        {/* Category Slot */}
                        <td className="py-3.5 px-4 uppercase tracking-wider text-[11px] font-semibold text-onyx-600 dark:text-linen-400">
                          {p.slot}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-bold text-olive-800 dark:text-camel-300">
                          Rs. {p.price.toLocaleString()}
                        </td>

                        {/* Try-on asset badge */}
                        <td className="py-3.5 px-4">
                          {p.style === 'custom' ? (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-camel-100 dark:bg-onyx-800 text-camel-800 dark:text-camel-300">
                              Custom Cutout (X:{p.asset?.x || 100} Y:{p.asset?.y || 125})
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-medium bg-linen-200 dark:bg-onyx-800 text-onyx-700 dark:text-linen-300 uppercase">
                              Vector {p.style || p.slot}
                            </span>
                          )}
                        </td>

                        {/* Row Actions */}
                        <td className="py-3.5 px-5 text-right space-x-3">
                          {onTryOnProduct && (
                            <button
                              onClick={() => onTryOnProduct(p)}
                              className="font-bold text-olive-700 dark:text-camel-400 hover:underline"
                              title="Equip on storefront model"
                            >
                              👗 Try on Model
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="font-semibold text-onyx-700 dark:text-linen-300 hover:text-onyx-950 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${p.name}" from catalog?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="font-semibold text-red-600 dark:text-red-400 hover:underline"
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
        )}

        {/* =========================================================================
            TAB 2: APPEARANCE & PALETTE (Live Store Customizer)
        ========================================================================= */}
        {activeTab === 'appearance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form & Presets (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 p-8 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-camel-700 dark:text-camel-400">
                  STORE THEME & PALETTE
                </span>
                <h2 className="font-editorial text-3xl font-bold text-onyx-950 dark:text-linen-50 mt-1">
                  Customize Store Colors & Brand
                </h2>
                <p className="text-xs text-onyx-600 dark:text-linen-300 mt-1">
                  Adjust your primary accents, backgrounds, and brand name. Changes take effect across the entire website instantly.
                </p>
              </div>

              {/* Curated Preset Themes */}
              <div className="space-y-2">
                <label className="block font-bold text-onyx-800 dark:text-linen-200 text-xs">
                  Quick Preset Palettes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {presetThemes.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="p-2.5 rounded-xl border border-linen-300 dark:border-onyx-800 hover:border-camel-500 text-left transition active:scale-95 bg-linen-100/60 dark:bg-onyx-950/60"
                    >
                      <div className="flex items-center space-x-1.5 mb-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.olive }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.camel }} />
                        <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.linen }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-onyx-800 dark:text-linen-200 block truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveAppearance} className="space-y-5 text-xs">
                <div>
                  <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1.5">
                    Store Brand Name
                  </label>
                  <input
                    type="text"
                    maxLength={28}
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2.5 text-xs text-onyx-950 dark:text-linen-50 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Accent (Olive) */}
                  <div>
                    <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1.5">
                      Primary Accent Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={oliveColor}
                        onChange={(e) => setOliveColor(e.target.value)}
                        className="w-10 h-10 rounded border border-linen-300 dark:border-onyx-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={oliveColor}
                        onChange={(e) => setOliveColor(e.target.value)}
                        className="flex-1 bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Secondary Accent (Camel) */}
                  <div>
                    <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1.5">
                      Secondary Accent Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={camelColor}
                        onChange={(e) => setCamelColor(e.target.value)}
                        className="w-10 h-10 rounded border border-linen-300 dark:border-onyx-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={camelColor}
                        onChange={(e) => setCamelColor(e.target.value)}
                        className="flex-1 bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Light Canvas Background (Linen) */}
                  <div>
                    <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1.5">
                      Light Canvas Background
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={linenColor}
                        onChange={(e) => setLinenColor(e.target.value)}
                        className="w-10 h-10 rounded border border-linen-300 dark:border-onyx-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={linenColor}
                        onChange={(e) => setLinenColor(e.target.value)}
                        className="flex-1 bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Dark Mode Background (Onyx) */}
                  <div>
                    <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1.5">
                      Dark Mode Canvas
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={onyxColor}
                        onChange={(e) => setOnyxColor(e.target.value)}
                        className="w-10 h-10 rounded border border-linen-300 dark:border-onyx-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={onyxColor}
                        onChange={(e) => setOnyxColor(e.target.value)}
                        className="flex-1 bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center space-x-4 border-t border-linen-300 dark:border-onyx-800">
                  <button
                    type="submit"
                    className="bg-olive-800 hover:bg-olive-900 text-white font-bold text-xs uppercase tracking-widest px-7 py-3.5 rounded-full shadow-md transition active:scale-95"
                    style={{ backgroundColor: oliveColor }}
                  >
                    Save & Apply Colors ✓
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAppearance}
                    className="text-xs font-semibold text-onyx-600 dark:text-linen-400 hover:underline"
                  >
                    Restore Default Palette
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Live Storefront Preview Card (5 cols) */}
            <div className="lg:col-span-5 bg-linen-200/50 dark:bg-onyx-900/60 rounded-2xl border border-linen-300 dark:border-onyx-800 p-6 shadow-sm space-y-5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-camel-600 dark:text-camel-400 font-mono">
                Live Storefront Preview
              </span>

              {/* Sample Header & Card in Light Mode */}
              <div
                className="p-5 rounded-2xl border border-black/10 shadow-md space-y-4"
                style={{ backgroundColor: linenColor, color: onyxColor }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-black/10">
                  <span className="font-editorial text-lg font-bold uppercase tracking-widest">
                    {brandName}
                  </span>
                  <span
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full text-white font-bold"
                    style={{ backgroundColor: oliveColor }}
                  >
                    Atelier
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-mono opacity-60">Sample Product</span>
                  <p className="font-editorial text-base font-bold">Cashmere Knitwear</p>
                  <p className="font-editorial text-lg font-bold" style={{ color: camelColor }}>
                    Rs. 14,200
                  </p>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-full text-white font-bold text-xs uppercase tracking-wider shadow"
                  style={{ backgroundColor: oliveColor }}
                >
                  Add to Bag
                </button>
              </div>

              {/* Sample Card in Dark Mode */}
              <div
                className="p-5 rounded-2xl border border-white/10 shadow-md space-y-4 text-white"
                style={{ backgroundColor: onyxColor }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="font-editorial text-lg font-bold uppercase tracking-widest">
                    {brandName}
                  </span>
                  <span
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full text-black font-bold"
                    style={{ backgroundColor: camelColor }}
                  >
                    Night Mode
                  </span>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-full text-black font-bold text-xs uppercase tracking-wider shadow"
                  style={{ backgroundColor: camelColor }}
                >
                  Explore Capsule
                </button>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 3: CUSTOMER ORDERS & PAKISTANI GATEWAYS
        ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-onyx-900 p-5 rounded-xl border border-linen-300 dark:border-onyx-800">
                <span className="text-[10px] uppercase font-bold text-onyx-400 dark:text-linen-500">Gross Revenue</span>
                <div className="font-editorial text-2xl font-bold text-olive-800 dark:text-camel-300 mt-1">
                  Rs. {totalRevenue.toLocaleString()}
                </div>
              </div>
              <div className="bg-white dark:bg-onyx-900 p-5 rounded-xl border border-linen-300 dark:border-onyx-800">
                <span className="text-[10px] uppercase font-bold text-onyx-400 dark:text-linen-500">Total Registered Orders</span>
                <div className="font-editorial text-2xl font-bold text-onyx-950 dark:text-linen-50 mt-1">
                  {orders.length}
                </div>
              </div>
              <div className="bg-white dark:bg-onyx-900 p-5 rounded-xl border border-linen-300 dark:border-onyx-800">
                <span className="text-[10px] uppercase font-bold text-onyx-400 dark:text-linen-500">Avg Order Value</span>
                <div className="font-editorial text-2xl font-bold text-onyx-950 dark:text-linen-50 mt-1">
                  Rs. {orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString() : 0}
                </div>
              </div>
              <div className="bg-white dark:bg-onyx-900 p-5 rounded-xl border border-linen-300 dark:border-onyx-800">
                <span className="text-[10px] uppercase font-bold text-onyx-400 dark:text-linen-500">Fulfillment Success</span>
                <div className="font-editorial text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  99.2%
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <select
                  value={orderFilterStatus}
                  onChange={(e) => setOrderFilterStatus(e.target.value)}
                  className="bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 rounded px-3 py-2 text-xs font-semibold"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={orderFilterPayment}
                  onChange={(e) => setOrderFilterPayment(e.target.value)}
                  className="bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 rounded px-3 py-2 text-xs font-semibold"
                >
                  <option value="all">All Gateways</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="card">Credit Card (3DS)</option>
                  <option value="jazzcash">JazzCash Wallet</option>
                  <option value="easypaisa">EasyPaisa USSD</option>
                </select>
              </div>

              <input
                type="search"
                placeholder="Search orders, phone, city..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 rounded px-3 py-2 text-xs w-full sm:w-64"
              />
            </div>

            {/* Orders Table (Scrollable with Sticky Header) */}
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-xl border border-linen-300 dark:border-onyx-800 bg-white dark:bg-onyx-900 shadow-sm scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-linen-100 dark:bg-onyx-950 text-onyx-500 dark:text-linen-400 border-b border-linen-200 dark:border-onyx-800 font-bold uppercase tracking-wider text-[10px] shadow-sm">
                  <tr>
                    <th className="py-3.5 px-5">Order #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4">Gateway</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-onyx-500 dark:text-linen-400">
                        No orders found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      const amount = o.pricing?.finalTotal || o.amount || 0;
                      return (
                        <tr key={o.orderNumber} className="hover:bg-linen-50 dark:hover:bg-onyx-800/40 transition">
                          <td className="py-3.5 px-5 font-mono font-bold text-olive-800 dark:text-camel-300">
                            {o.orderNumber}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-onyx-950 dark:text-linen-50">
                            {o.customer?.firstName} {o.customer?.lastName}
                          </td>
                          <td className="py-3.5 px-4 text-onyx-700 dark:text-linen-300">
                            {o.customer?.city || "Pakistan"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getPaymentBadge(o.paymentMethod)}`}>
                              {o.paymentMethod?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-onyx-950 dark:text-linen-50">
                            Rs. {amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={o.status || 'Processing'}
                              onChange={(e) => onUpdateOrderStatus(o.orderNumber, e.target.value)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer ${getStatusBadge(o.status || 'Processing')}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(o)}
                              className="font-bold text-camel-700 dark:text-camel-400 hover:underline"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 4: LOGISTICS & COURIERS
        ========================================================================= */}
        {activeTab === 'logistics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-white dark:bg-onyx-900 p-6 rounded-2xl border border-linen-300 dark:border-onyx-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Leopards Express Courier</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-onyx-600 dark:text-linen-400">Primary nationwide courier for COD cash collection and 24h major city air cargo.</p>
              <div className="pt-2 text-[11px] text-onyx-500 space-y-1">
                <div>API Endpoint: <code>api.leopardscourier.com/v2</code></div>
                <div>Tariff: Flat Rs. 250 (Free over Rs. 15,000)</div>
              </div>
            </div>

            <div className="bg-white dark:bg-onyx-900 p-6 rounded-2xl border border-linen-300 dark:border-onyx-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">TCS Express Logistics</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-onyx-600 dark:text-linen-400">Same-day delivery in Lahore, Karachi, and Islamabad/Rawalpindi.</p>
              <div className="pt-2 text-[11px] text-onyx-500 space-y-1">
                <div>API Endpoint: <code>api.tcsexpress.com/shipping</code></div>
                <div>COD Return Cycle: 48 Hours</div>
              </div>
            </div>

            <div className="bg-white dark:bg-onyx-900 p-6 rounded-2xl border border-linen-300 dark:border-onyx-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Trax Logistics & CallCourier</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Backup</span>
              </div>
              <p className="text-onyx-600 dark:text-linen-400">Automated fallback courier for rural and remote area delivery routes.</p>
              <div className="pt-2 text-[11px] text-onyx-500 space-y-1">
                <div>Route Coverage: 850+ Pakistani cities</div>
                <div>Automated SMS Tracking: Enabled</div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: AUDIENCE, SUBSCRIBERS & CUSTOMERS (Stored in MongoDB)
        ========================================================================= */}
        {activeTab === 'subscribers' && (
          <div className="space-y-8 fade-in">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-onyx-900 p-5 rounded-2xl border border-linen-300 dark:border-onyx-800">
                <span className="text-xs text-onyx-500 dark:text-linen-400 font-medium">Newsletter Subscribers</span>
                <p className="text-2xl font-editorial font-bold text-olive-800 dark:text-camel-400 mt-1">{subscribers.length}</p>
                <span className="text-[11px] text-green-600 font-medium">● Stored in MongoDB</span>
              </div>
              <div className="bg-white dark:bg-onyx-900 p-5 rounded-2xl border border-linen-300 dark:border-onyx-800">
                <span className="text-xs text-onyx-500 dark:text-linen-400 font-medium">Customer Profiles</span>
                <p className="text-2xl font-editorial font-bold text-onyx-950 dark:text-linen-50 mt-1">{customers.length}</p>
                <span className="text-[11px] text-onyx-500">From verified checkouts</span>
              </div>
              <div className="bg-white dark:bg-onyx-900 p-5 rounded-2xl border border-linen-300 dark:border-onyx-800">
                <span className="text-xs text-onyx-500 dark:text-linen-400 font-medium">Concierge Inquiries</span>
                <p className="text-2xl font-editorial font-bold text-onyx-950 dark:text-linen-50 mt-1">{inquiries.length}</p>
                <span className="text-[11px] text-onyx-500">Bespoke styling requests</span>
              </div>
            </div>

            {/* Newsletter Subscribers Section */}
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-linen-200 dark:border-onyx-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-onyx-950 dark:text-linen-50">
                    Newsletter Subscribers (MongoDB Collection: `subscribers`)
                  </h3>
                  <p className="text-xs text-onyx-500 dark:text-linen-400">
                    Collected directly from footer subscription, homepage CTA, and order checkouts.
                  </p>
                </div>
                <button
                  onClick={handleCopySubscriberEmails}
                  className="px-4 py-2 bg-olive-800 hover:bg-olive-900 text-white text-xs font-bold rounded-lg transition active:scale-95 whitespace-nowrap"
                >
                  {copiedEmails ? '✓ Copied All Emails!' : 'Copy All Emails (CSV)'}
                </button>
              </div>

              {subscribers.length === 0 ? (
                <div className="p-8 text-center text-xs text-onyx-500">
                  No subscribers recorded in MongoDB yet. Try subscribing from the homepage footer!
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto scrollbar-thin">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 bg-linen-100 dark:bg-onyx-850 text-onyx-700 dark:text-linen-300 border-b border-linen-200 dark:border-onyx-800 shadow-sm">
                      <tr>
                        <th className="py-3 px-4 font-bold">Email Address</th>
                        <th className="py-3 px-4 font-bold">Source</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold">Date Subscribed</th>
                        <th className="py-3 px-4 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                      {subscribers.map((sub) => (
                        <tr key={sub._id || sub.email} className="hover:bg-linen-50 dark:hover:bg-onyx-850 transition">
                          <td className="py-3 px-4 font-mono font-medium text-onyx-950 dark:text-linen-100">
                            {sub.email}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-linen-200 dark:bg-onyx-800 text-onyx-700 dark:text-linen-300 font-mono">
                              {sub.source || 'website'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 font-semibold uppercase">
                              {sub.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-onyx-500 dark:text-linen-400">
                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteSubscriber(sub._id)}
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

            {/* Customers Profiles Section */}
            <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-linen-200 dark:border-onyx-800">
                <h3 className="font-editorial text-lg font-bold text-onyx-950 dark:text-linen-50">
                  Customer Directory (MongoDB Collection: `customers`)
                </h3>
                <p className="text-xs text-onyx-500 dark:text-linen-400">
                  Verified customer profiles automatically synchronized with checkout orders.
                </p>
              </div>

              {customers.length === 0 ? (
                <div className="p-8 text-center text-xs text-onyx-500">
                  No customer profiles registered in MongoDB yet. Complete a checkout to see profiles automatically populate here!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-linen-100 dark:bg-onyx-850 text-onyx-700 dark:text-linen-300 border-b border-linen-200 dark:border-onyx-800">
                      <tr>
                        <th className="py-3 px-4 font-bold">Customer Name</th>
                        <th className="py-3 px-4 font-bold">Email</th>
                        <th className="py-3 px-4 font-bold">Phone</th>
                        <th className="py-3 px-4 font-bold">Location</th>
                        <th className="py-3 px-4 font-bold">Orders</th>
                        <th className="py-3 px-4 text-right font-bold">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-linen-200 dark:divide-onyx-800">
                      {customers.map((cust) => (
                        <tr key={cust._id || cust.email} className="hover:bg-linen-50 dark:hover:bg-onyx-850 transition">
                          <td className="py-3 px-4 font-bold text-onyx-950 dark:text-linen-100">
                            {cust.name || `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'Client'}
                          </td>
                          <td className="py-3 px-4 font-mono text-onyx-700 dark:text-linen-300">
                            {cust.email}
                          </td>
                          <td className="py-3 px-4 font-mono text-onyx-600 dark:text-linen-400">
                            {cust.phone || '—'}
                          </td>
                          <td className="py-3 px-4 text-onyx-600 dark:text-linen-400">
                            {cust.city ? `${cust.city}, ${cust.province || 'Pakistan'}` : 'Pakistan'}
                          </td>
                          <td className="py-3 px-4 font-bold">
                            {cust.ordersCount || cust.orderHistory?.length || 1}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-olive-800 dark:text-camel-400">
                            Rs. {(cust.totalSpent || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Inquiries Section */}
            {inquiries.length > 0 && (
              <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-linen-200 dark:border-onyx-800">
                  <h3 className="font-editorial text-lg font-bold text-onyx-950 dark:text-linen-50">
                    Concierge Inquiries (MongoDB Collection: `inquiries`)
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {inquiries.map((inq) => (
                    <div key={inq._id} className="p-4 rounded-xl bg-linen-50 dark:bg-onyx-850 border border-linen-200 dark:border-onyx-800 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-onyx-950 dark:text-linen-100">{inq.name} ({inq.email})</span>
                        <span className="text-[10px] text-onyx-400">{inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                      {inq.orderNumber && <p className="font-mono text-[11px] text-olive-700">Order Ref: {inq.orderNumber}</p>}
                      <p className="text-onyx-700 dark:text-linen-300">{inq.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* =========================================================================
          FORME 2-COLUMN PRODUCT EDITOR MODAL
          Left: Fields & Sliders
          Right: Sticky Live Mannequin Preview
      ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
            
            {/* Modal Heading */}
            <div className="flex items-center justify-between pb-4 border-b border-linen-200 dark:border-onyx-800 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-camel-700 dark:text-camel-400">
                  THE STUDIO
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-onyx-950 dark:text-linen-50 mt-0.5">
                  {editorMode === 'create' ? "Add a piece" : "Edit piece"}
                </h2>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-onyx-400 hover:text-onyx-900 dark:hover:text-white p-2 text-xl"
              >
                ✕
              </button>
            </div>

            {/* 2-Column Editor Layout */}
            <form onSubmit={handleSubmitPiece}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left Column: Form Fields */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={70}
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. The Weekend Linen Shirt"
                      className="w-full bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2.5 text-xs text-onyx-950 dark:text-linen-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">Collection</label>
                      <select
                        value={formState.person}
                        onChange={(e) => setFormState({ ...formState, person: e.target.value })}
                        className="w-full bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs"
                      >
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                        <option value="kids">Kids</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">Category (Slot)</label>
                      <select
                        value={formState.slot}
                        onChange={(e) => {
                          const newSlot = e.target.value;
                          const defaultStyle = FormeEngine.STYLES[newSlot]?.[0] || 'knit';
                          setFormState({ ...formState, slot: newSlot, style: defaultStyle });
                        }}
                        className="w-full bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs"
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="outer">Layer / Outerwear</option>
                        <option value="dress">Dress</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">Price in PKR (₨)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="200000"
                        value={formState.price}
                        onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                        className="w-full bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">Colour Name</label>
                      <input
                        type="text"
                        required
                        value={formState.colorName}
                        onChange={(e) => setFormState({ ...formState, colorName: e.target.value })}
                        className="w-full bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">Colour Hex</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formState.colorHex}
                        onChange={(e) => setFormState({ ...formState, colorHex: e.target.value })}
                        className="w-9 h-8 rounded border border-linen-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formState.colorHex}
                        onChange={(e) => setFormState({ ...formState, colorHex: e.target.value })}
                        className="flex-1 bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">Short Description</label>
                    <input
                      type="text"
                      maxLength={120}
                      value={formState.description}
                      onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                      placeholder="A relaxed layer for everyday dressing."
                      className="w-full bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-onyx-800 dark:text-linen-200 mb-1">Preview Vector Style</label>
                    <select
                      value={formState.style}
                      onChange={(e) => setFormState({ ...formState, style: e.target.value })}
                      className="w-full bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded p-2 text-xs"
                    >
                      {(FormeEngine.STYLES[formState.slot] || []).map((s) => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                      <option value="custom">★ Uploaded Garment Cutout Image</option>
                    </select>
                  </div>

                  {/* Cutout Upload and Coordinate Sliders */}
                  <div className="border border-dashed border-linen-300 dark:border-onyx-700 p-4 rounded-xl space-y-3 bg-linen-50/50 dark:bg-onyx-950">
                    <strong className="block text-onyx-900 dark:text-linen-100">Upload Transparent Garment Image</strong>
                    <span className="block text-[11px] text-onyx-500">Transparent PNG or WebP · Front facing cutout</span>
                    <input
                      type="file"
                      accept="image/png,image/webp"
                      onChange={handleImageCutoutUpload}
                      className="text-xs"
                    />

                    {formState.style === 'custom' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span>Horizontal (X):</span>
                            <strong>{formState.assetX}px</strong>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="300"
                            value={formState.assetX}
                            onChange={(e) => setFormState({ ...formState, assetX: Number(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span>Vertical (Y):</span>
                            <strong>{formState.assetY}px</strong>
                          </div>
                          <input
                            type="range"
                            min="-50"
                            max="600"
                            value={formState.assetY}
                            onChange={(e) => setFormState({ ...formState, assetY: Number(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span>Width:</span>
                            <strong>{formState.assetWidth}px</strong>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="500"
                            value={formState.assetWidth}
                            onChange={(e) => setFormState({ ...formState, assetWidth: Number(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span>Height:</span>
                            <strong>{formState.assetHeight}px</strong>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="600"
                            value={formState.assetHeight}
                            onChange={(e) => setFormState({ ...formState, assetHeight: Number(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Column: Sticky Live Mannequin Preview */}
                <div className="sticky top-4 bg-gradient-to-b from-[#E7E8DC] to-[#D5D9C8] dark:from-[#2B3224] dark:to-[#1F2519] p-6 rounded-2xl border border-linen-300 dark:border-onyx-800 text-center flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-olive-800 dark:text-camel-300 mb-2">
                    LIVE ALIGNMENT PREVIEW
                  </span>

                  <div
                    className="w-full max-w-[280px] h-[400px] flex items-center justify-center filter drop-shadow-lg"
                    dangerouslySetInnerHTML={{ __html: editorMannequinSvg }}
                  />

                  <p className="text-[11px] text-onyx-600 dark:text-linen-300 mt-3">
                    Shown live on the <strong>{formState.person}</strong> mannequin form.
                  </p>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="pt-6 mt-6 border-t border-linen-200 dark:border-onyx-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded text-xs font-semibold text-onyx-700 dark:text-linen-300 hover:bg-linen-100 dark:hover:bg-onyx-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-olive-800 hover:bg-olive-900 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded shadow transition active:scale-95"
                >
                  Save piece ✓
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Guide Dialog (Fully Scrollable) */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4 scrollbar-thin">
            <h2 className="font-editorial text-2xl font-bold">A home for your wardrobe.</h2>
            <ol className="text-xs space-y-3 text-onyx-600 dark:text-linen-300 list-decimal pl-4">
              <li><strong>Add your pieces:</strong> Use the Studio to add products. Pick built-in shapes or upload transparent cutouts with coordinate alignment.</li>
              <li><strong>Export your catalog:</strong> Download products.json. It contains all garments, placements, and color palettes.</li>
              <li><strong>Try on the model:</strong> Click "Try on Model" from any row to instantly see it draped on the storefront 2D mannequin!</li>
              <li><strong>Pakistani Gateways:</strong> Seamlessly process Cash on Delivery (COD), Credit Cards (3D Secure), JazzCash, and EasyPaisa.</li>
            </ol>
            <button
              onClick={() => setIsGuideOpen(false)}
              className="w-full bg-olive-800 hover:bg-olive-900 text-white font-bold text-xs uppercase py-3 rounded transition"
            >
              Got it ✓
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal (Fully Scrollable) */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-onyx-900 rounded-2xl border border-linen-300 dark:border-onyx-800 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs scrollbar-thin">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-editorial text-lg font-bold">Order Details: {selectedOrderDetails.orderNumber}</h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-lg p-1 hover:text-camel-500">✕</button>
            </div>
            <div>
              <strong>Customer:</strong> {selectedOrderDetails.customer?.firstName} {selectedOrderDetails.customer?.lastName}<br />
              <strong>Phone:</strong> {selectedOrderDetails.customer?.phone}<br />
              <strong>Address:</strong> {selectedOrderDetails.customer?.address}, {selectedOrderDetails.customer?.city}<br />
              <strong>Payment Gateway:</strong> {selectedOrderDetails.paymentMethod?.toUpperCase()}<br />
              <strong>Total:</strong> Rs. {(selectedOrderDetails.pricing?.finalTotal || selectedOrderDetails.amount || 0).toLocaleString()}
            </div>
            <div className="border-t pt-3 space-y-1">
              <strong>Items:</strong>
              {selectedOrderDetails.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.product?.name || "Garment"} ({it.size || "M"} / {it.color || "Standard"}) × {it.quantity || 1}</span>
                  <span className="font-bold">Rs. {((it.product?.price || 0) * (it.quantity || 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full bg-olive-800 hover:bg-olive-900 text-white font-bold py-2 rounded uppercase text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
