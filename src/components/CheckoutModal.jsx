import React, { useState, useEffect, useRef } from 'react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  cartItems: propCartItems,
  pricing,
  onOrderCompleted,
  onConfirmOrder,
  user = null
}) {
  if (!isOpen) return null;

  const rawList = propCartItems || cart || [];
  const normalizedCartItems = rawList.map(item => {
    const p = item.product || item;
    return {
      product: p,
      id: p.id || item.id,
      name: p.name || item.name || 'Garment',
      price: Number(p.price || item.price || 0),
      size: item.selectedSize || item.size || 'M',
      color: item.selectedColor || item.colorName || item.color || p.primaryColor || 'Olive',
      quantity: Number(item.quantity || 1)
    };
  });

  const subtotal = normalizedCartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const activePricing = pricing || {
    subtotal,
    discountAmount: 0,
    shippingFee: subtotal >= 15000 || subtotal === 0 ? 0 : 250,
    finalTotal: subtotal >= 15000 || subtotal === 0 ? subtotal : subtotal + 250
  };

  // Checkout Steps: 1: 'shipping', 2: 'payment'
  const [step, setStep] = useState('shipping');
  
  // Shipping Form State (pre-filled with clean Google user profile if signed in)
  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || (user?.name ? user.name.split(' ')[0].replace(/[^a-zA-Z\s]/g, '') : ""),
    lastName: user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ').replace(/[^a-zA-Z\s]/g, '') : ""),
    email: user?.email || "",
    phone: user?.phone ? user.phone.replace(/[^0-9]/g, '').slice(0, 11) : "",
    address: user?.address ? user.address.replace(/[<>{}$~%^*=;`+?]/g, '') : "",
    city: user?.city ? user.city.replace(/[^a-zA-Z\s]/g, '') : "Lahore",
    province: user?.province ? user.province.replace(/[^a-zA-Z\s]/g, '') : "Punjab",
    postalCode: user?.postalCode ? user.postalCode.replace(/[^0-9]/g, '').slice(0, 6) : "",
    orderNotes: ""
  }));

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState({});

  // Receipt Proof Attachment States (for JazzCash / EasyPaisa / Bank)
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const fileInputRef = useRef(null);

  // Automatically sync customer name and email when Google user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || (user.name ? user.name.split(' ')[0].replace(/[^a-zA-Z\s]/g, '') : ""),
        lastName: prev.lastName || user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ').replace(/[^a-zA-Z\s]/g, '') : ""),
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Selected Payment Method: 'cod' | 'card' | 'jazzcash' | 'easypaisa'
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Credit Card state
  const [cardData, setCardData] = useState({
    name: "HUZAIFA KHAN",
    number: "4242 •••• •••• 4242",
    expiry: "12/28",
    cvv: "382"
  });

  // JazzCash state (empty initial values, digits only)
  const [jazzcashPhone, setJazzcashPhone] = useState("");
  const [jazzcashCnic, setJazzcashCnic] = useState("");

  // EasyPaisa state (empty initial values, digits only)
  const [easypaisaPhone, setEasypaisaPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const PAKISTANI_CITIES = [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", 
    "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", 
    "Hyderabad", "Abbottabad", "Bahawalpur", "Sargodha"
  ];

  // Active Real-Time Input Filtering: Prevents typing invalid characters into fields
  const handleInputChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === 'firstName' || name === 'lastName') {
      // Disallow numbers, signs, and symbols. Letters and spaces only.
      value = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'phone') {
      // Disallow letters, signs, and symbols. Digits only, max 11 digits.
      value = value.replace(/[^0-9]/g, '').slice(0, 11);
    } else if (name === 'city' || name === 'province') {
      // Disallow numbers and special characters. Letters and spaces only.
      value = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'postalCode') {
      // Disallow letters and symbols. Digits only, max 6 digits.
      value = value.replace(/[^0-9]/g, '').slice(0, 6);
    } else if (name === 'address') {
      // Strip potentially malicious code characters (<, >, {, }, $, ~, %, ^, *, =, ;, `, +, ?)
      value = value.replace(/[<>{}$~%^*=;`+?]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleReceiptFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setReceiptError("File exceeds 5MB limit. Please upload a smaller compressed image or PDF.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setReceiptError("Invalid file type. Please upload a PNG, JPG, WEBP screenshot or PDF receipt.");
      return;
    }

    setReceiptFile(file);
    setReceiptFileName(file.name);
    setReceiptError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setReceiptFileName("");
    setReceiptError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!user || user.authProvider !== 'google' || !user.googleVerified) {
      alert("⚠️ Google Verification Required: You must sign in with Google before you can order.");
      return;
    }

    const errors = {};

    // 1. First Name: Letters only, min 2 chars
    const cleanFirstName = (formData.firstName || "").trim();
    if (!cleanFirstName || cleanFirstName.length < 2) {
      errors.firstName = "First name is required (min 2 letters, no numbers or signs).";
    } else if (!/^[a-zA-Z\s]{2,70}$/.test(cleanFirstName)) {
      errors.firstName = "First name cannot contain numbers or special characters.";
    }

    // 2. Last Name: Letters only, min 1 char
    const cleanLastName = (formData.lastName || "").trim();
    if (!cleanLastName || cleanLastName.length < 1) {
      errors.lastName = "Last name is required (letters only, no numbers or signs).";
    } else if (!/^[a-zA-Z\s]{1,70}$/.test(cleanLastName)) {
      errors.lastName = "Last name cannot contain numbers or special characters.";
    }

    // 3. Email: Strict email pattern
    const activeEmail = (user?.email || formData.email || "").trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(activeEmail)) {
      errors.email = "Please enter a valid, complete email address (e.g. name@domain.com).";
    }

    // 4. Phone: Strictly 11 digits starting with 03
    const phoneClean = (formData.phone || "").replace(/[^0-9]/g, "");
    const pkPhoneRegex = /^03[0-9]{9}$/;
    if (!pkPhoneRegex.test(phoneClean)) {
      errors.phone = "Mobile phone must be strictly 11 digits starting with 03 (e.g. 03001234567). No letters or symbols allowed.";
    }

    // 5. Address: Minimum 8 characters
    if (!formData.address || formData.address.trim().length < 8) {
      errors.address = "Complete delivery address must be at least 8 characters long (house, street, sector).";
    }

    // 6. City: Letters and spaces only, min 2 chars
    if (!formData.city || formData.city.trim().length < 2) {
      errors.city = "Please select or specify your delivery city.";
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(formData.city.trim())) {
      errors.city = "City name can only contain letters and spaces.";
    }

    // 7. Postal Code: Optional, but if provided, must be digits only
    if (formData.postalCode && !/^[0-9]{4,6}$/.test(formData.postalCode.trim())) {
      errors.postalCode = "Postal code must contain 4 to 6 digits only (no letters).";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setStep('payment');
  };

  const handleFinalizeOrder = () => {
    // 🛑 STRICT VERIFICATION CHECK: Customer CANNOT order without Google verification
    if (!user || user.authProvider !== 'google' || !user.googleVerified) {
      alert("⚠️ Google Verification Required: You must be signed in with Google to place an order.");
      return;
    }

    // Require valid 11-digit sender phone for JazzCash / EasyPaisa
    if (paymentMethod === 'jazzcash') {
      const cleanJc = (jazzcashPhone || '').replace(/[^0-9]/g, '');
      if (!/^03[0-9]{9}$/.test(cleanJc)) {
        alert("⚠️ JazzCash Sender Phone Error: Please enter a valid 11-digit mobile number starting with 03 (e.g. 03001234567). Digits only.");
        return;
      }
    }

    if (paymentMethod === 'easypaisa') {
      const cleanEp = (easypaisaPhone || '').replace(/[^0-9]/g, '');
      if (!/^03[0-9]{9}$/.test(cleanEp)) {
        alert("⚠️ EasyPaisa Sender Phone Error: Please enter a valid 11-digit mobile number starting with 03 (e.g. 03451234567). Digits only.");
        return;
      }
    }

    // Require receipt attachment for JazzCash / EasyPaisa / Bank Transfer
    if (['jazzcash', 'easypaisa', 'bank'].includes(paymentMethod)) {
      if (!receiptPreview) {
        setReceiptError(`Payment Receipt Required: Please attach proof of your ${paymentMethod.toUpperCase()} transaction before completing order.`);
        alert(`⚠️ Payment Receipt Required: Please upload your ${paymentMethod.toUpperCase()} transaction screenshot to place this order.`);
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedOrderNumber = `ZYT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const verifiedEmail = user?.email || formData.email;
      const orderPayload = {
        orderNumber: generatedOrderNumber,
        id: generatedOrderNumber,
        customer: {
          ...formData,
          email: verifiedEmail,
          googleVerified: true,
          googleId: user.googleId || ''
        },
        paymentMethod,
        paymentReceipt: receiptPreview || null,
        receiptFileName: receiptFileName || null,
        receiptUploadedAt: receiptPreview ? new Date().toISOString() : null,
        status: 'pending',
        items: normalizedCartItems,
        total: activePricing.finalTotal,
        pricing: activePricing,
        createdAt: new Date().toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      if (onConfirmOrder) onConfirmOrder(orderPayload);
      if (onOrderCompleted) onOrderCompleted(orderPayload);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-onyx-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-none max-w-3xl w-full overflow-hidden shadow-2xl border border-linen-300 relative fade-in">
        
        {/* Modal Top Header */}
        <div className="p-5 bg-linen-100 border-b border-linen-300 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-editorial text-xl font-bold text-onyx-950">ZAYTOUN & CO.</span>
              <span className="text-xs bg-olive-700 text-white px-2 py-0.5 rounded-none font-semibold uppercase tracking-wider">
                Secure 256-Bit SSL Checkout
              </span>
            </div>
            <p className="text-xs text-onyx-600 mt-0.5">
              Nationwide Express Apparel Delivery with TCS, Leopards & Trax
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-none text-onyx-500 hover:text-onyx-950 hover:bg-linen-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-2 bg-linen-200 border-b border-linen-300 text-xs font-semibold text-center">
          <div className={`py-2.5 transition ${step === 'shipping' ? 'bg-olive-700 text-white' : 'text-onyx-700'}`}>
            1. Delivery Address
          </div>
          <div className={`py-2.5 transition ${step === 'payment' ? 'bg-olive-700 text-white' : 'text-onyx-700'}`}>
            2. Payment & Confirmation
          </div>
        </div>

        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: SHIPPING & CONTACT */}
          {step === 'shipping' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <h3 className="font-editorial text-lg font-bold text-onyx-950 flex items-center justify-between">
                <span>Shipping Address & Contact Information</span>
                <span className="text-xs text-olive-800 font-sans font-medium">Step 1 of 2</span>
              </h3>

              {user && (
                <div className="flex items-center space-x-2.5 p-3 rounded-none bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold">Ordering as Google Verified Client: </span>
                    <span>{user.name} ({user.email})</span>
                  </div>
                  <span className="w-2 h-2 rounded-none bg-emerald-500 animate-ping"></span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">First Name (Letters only) *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Shahroz"
                    required
                    className={`w-full bg-linen-50 border rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700 ${
                      formErrors.firstName ? 'border-red-500 bg-red-50/20' : 'border-linen-300'
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-600 text-[11px] font-bold mt-1">⚠️ {formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Last Name (Letters only) *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Mubarak"
                    required
                    className={`w-full bg-linen-50 border rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700 ${
                      formErrors.lastName ? 'border-red-500 bg-red-50/20' : 'border-linen-300'
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-600 text-[11px] font-bold mt-1">⚠️ {formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Mobile Phone (11 Digits, e.g. 03001234567) *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="03001234567"
                    maxLength={11}
                    required
                    className={`w-full bg-linen-50 border rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700 font-mono font-medium ${
                      formErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-linen-300'
                    }`}
                  />
                  {formErrors.phone ? (
                    <p className="text-red-600 text-[11px] font-bold mt-1">⚠️ {formErrors.phone}</p>
                  ) : (
                    <span className="text-[10px] text-onyx-500">Digits only (03XXXXXXXXX). Required for courier delivery updates</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-onyx-800">Email Address (Google Account)</label>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 border border-emerald-200 dark:border-emerald-800">
                      ✓ Google Verified
                    </span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={user?.email || formData.email}
                    readOnly
                    required
                    className="w-full bg-neutral-100 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 rounded-none p-2.5 text-xs text-onyx-700 dark:text-neutral-300 font-mono cursor-not-allowed"
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-[11px] font-bold mt-1">⚠️ {formErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-onyx-800 mb-1">Complete Street Address (House/Apartment, Street, Area) *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. House 42-B, Street 14, Phase 6, DHA"
                  required
                  className={`w-full bg-linen-50 border rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700 ${
                    formErrors.address ? 'border-red-500 bg-red-50/20' : 'border-linen-300'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-red-600 text-[11px] font-bold mt-1">⚠️ {formErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">City *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-linen-50 border border-linen-300 rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700 font-medium"
                  >
                    {PAKISTANI_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Province</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full bg-linen-50 border border-linen-300 rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Postal Code (Digits only)</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="54000"
                    maxLength={6}
                    className={`w-full bg-linen-50 border rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700 font-mono ${
                      formErrors.postalCode ? 'border-red-500 bg-red-50/20' : 'border-linen-300'
                    }`}
                  />
                  {formErrors.postalCode && (
                    <p className="text-red-600 text-[11px] font-bold mt-1">⚠️ {formErrors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-semibold text-onyx-800 mb-1">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  placeholder="e.g. Ring bell twice, deliver to security guard"
                  className="w-full bg-linen-50 border border-linen-300 rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
                />
              </div>

              {/* Action Button */}
              <div className="pt-4 flex justify-between items-center border-t border-linen-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-onyx-600 hover:text-onyx-950 font-medium"
                >
                  Return to Cart
                </button>
                <button
                  type="submit"
                  className="bg-olive-700 hover:bg-olive-800 text-linen-100 font-bold px-6 py-3 rounded-none text-xs uppercase tracking-wider transition shadow"
                >
                  Continue to Payment Options →
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD SELECTION */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-onyx-950">Select Payment Method</h3>
                  <p className="text-xs text-onyx-600">Choose your preferred gateway to finalize your order.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-onyx-500">Payable Amount</span>
                  <div className="font-bold text-olive-800 text-lg">Rs. {activePricing.finalTotal.toLocaleString()}</div>
                </div>
              </div>

              {/* 4 Interactive Payment Options Grid */}
              <div className="space-y-3">
                
                {/* 1. Cash on Delivery (COD) */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-none border-2 transition cursor-pointer flex items-start space-x-3 ${
                    paymentMethod === 'cod'
                      ? 'border-olive-700 bg-olive-50/40 ring-1 ring-olive-700'
                      : 'border-linen-300 hover:border-onyx-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-olive-700 focus:ring-olive-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">💵</span>
                        <strong className="text-xs sm:text-sm font-bold text-onyx-950">Cash on Delivery (COD)</strong>
                        <span className="text-[10px] bg-camel-100 text-camel-800 font-bold px-2 py-0.5 rounded">Most Popular</span>
                      </div>
                      <span className="text-xs font-semibold text-onyx-700">TCS / Trax / Leopards</span>
                    </div>
                    <p className="text-xs text-onyx-600 mt-1">
                      Pay cash directly to the courier rider upon receiving your luxury package at your doorstep.
                    </p>
                  </div>
                </div>

                {/* 2. Credit / Debit Card */}
                <div 
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-none border-2 transition cursor-pointer flex items-start space-x-3 ${
                    paymentMethod === 'card'
                      ? 'border-olive-700 bg-olive-50/40 ring-1 ring-olive-700'
                      : 'border-linen-300 hover:border-onyx-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-1 text-olive-700 focus:ring-olive-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">💳</span>
                        <strong className="text-xs sm:text-sm font-bold text-onyx-950">Credit / Debit Card</strong>
                        <span className="text-[10px] bg-olive-100 text-olive-800 font-bold px-2 py-0.5 rounded">Instant 5% Off</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-onyx-700">
                        <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">VISA</span>
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">Mastercard</span>
                        <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">PayFast</span>
                      </div>
                    </div>
                    <p className="text-xs text-onyx-600 mt-1">
                      Secure checkout via Safepay / 3D-Secure 2.0. All Pakistani and International Visa and Mastercard accepted.
                    </p>
                  </div>
                </div>

                {/* 3. JazzCash */}
                <div 
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`p-4 rounded-none border-2 transition cursor-pointer flex items-start space-x-3 ${
                    paymentMethod === 'jazzcash'
                      ? 'border-red-600 bg-red-50/30 ring-1 ring-red-600'
                      : 'border-linen-300 hover:border-onyx-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'jazzcash'}
                    onChange={() => setPaymentMethod('jazzcash')}
                    className="mt-1 text-red-600 focus:ring-red-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-none bg-red-600 text-white flex items-center justify-center text-[10px] font-black">JC</span>
                        <strong className="text-xs sm:text-sm font-bold text-red-700">JazzCash Mobile Wallet</strong>
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">Instant MPIN</span>
                      </div>
                      <span className="text-xs font-semibold text-onyx-700">Direct Push</span>
                    </div>
                    <p className="text-xs text-onyx-600 mt-1">
                      Pay directly from your JazzCash wallet balance. You will receive an instant push prompt on your mobile screen to enter your MPIN.
                    </p>
                  </div>
                </div>

                {/* 4. EasyPaisa */}
                <div 
                  onClick={() => setPaymentMethod('easypaisa')}
                  className={`p-4 rounded-none border-2 transition cursor-pointer flex items-start space-x-3 ${
                    paymentMethod === 'easypaisa'
                      ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600'
                      : 'border-linen-300 hover:border-onyx-400 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'easypaisa'}
                    onChange={() => setPaymentMethod('easypaisa')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-none bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">EP</span>
                        <strong className="text-xs sm:text-sm font-bold text-emerald-800">EasyPaisa Mobile Account</strong>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">USSD Prompt</span>
                      </div>
                      <span className="text-xs font-semibold text-onyx-700">Telenor / All Nets</span>
                    </div>
                    <p className="text-xs text-onyx-600 mt-1">
                      Pay instantly via EasyPaisa app notification or USSD popup (*786#). Zero transaction surcharge.
                    </p>
                  </div>
                </div>

              </div>

              {/* Sub-Forms depending on selected payment method */}
              <div className="p-4 rounded-none bg-linen-100 border border-linen-300">
                {paymentMethod === 'cod' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-olive-800 font-bold">
                      <span>✓ Cash On Delivery Selected</span>
                    </div>
                    <p className="text-onyx-700">
                      Rider will collect <strong>Rs. {activePricing.finalTotal.toLocaleString()}</strong> in cash at <strong>{formData.address}, {formData.city}</strong>.
                    </p>
                    <p className="text-onyx-500 text-[11px]">
                      Your order will be booked immediately and dispatched with real-time tracking updates.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-onyx-900 mb-2">Card Details:</div>
                    <div>
                      <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                        className="w-full bg-white border border-linen-300 rounded p-2 text-xs uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">Card Number</label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        className="w-full bg-white border border-linen-300 rounded p-2 text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full bg-white border border-linen-300 rounded p-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">CVV (3 Digits)</label>
                        <input
                          type="password"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full bg-white border border-linen-300 rounded p-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'jazzcash' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-red-200 pb-2">
                      <span className="font-bold text-red-800 uppercase tracking-wide">JazzCash Transfer Instructions</span>
                      <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded-none font-bold">Manual Verification</span>
                    </div>

                    <div className="p-3 bg-white border border-red-200 rounded-none space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-onyx-500 font-sans">Send Payment To:</span>
                        <strong className="text-red-700">0300-8472910</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-onyx-500 font-sans">Account Title:</span>
                        <strong className="text-onyx-900">ZAYTOUN ATELIER</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-onyx-500 font-sans">Payable Total:</span>
                        <strong className="text-black font-bold">Rs. {activePricing.finalTotal.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">Your Sender Mobile Number (11 Digits) *</label>
                        <input
                          type="tel"
                          value={jazzcashPhone}
                          onChange={(e) => setJazzcashPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                          placeholder="03001234567"
                          maxLength={11}
                          className="w-full bg-white border border-linen-300 rounded-none p-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">Transaction ID / TID (from SMS)</label>
                        <input
                          type="text"
                          value={jazzcashCnic}
                          onChange={(e) => setJazzcashCnic(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20))}
                          placeholder="e.g. 19283746592"
                          maxLength={20}
                          className="w-full bg-white border border-linen-300 rounded-none p-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'easypaisa' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="font-bold text-emerald-800 uppercase tracking-wide">EasyPaisa Transfer Instructions</span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-none font-bold">Manual Verification</span>
                    </div>

                    <div className="p-3 bg-white border border-emerald-200 rounded-none space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-onyx-500 font-sans">Send Payment To:</span>
                        <strong className="text-emerald-700">0345-8472910</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-onyx-500 font-sans">Account Title:</span>
                        <strong className="text-onyx-900">ZAYTOUN ATELIER</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-onyx-500 font-sans">Payable Total:</span>
                        <strong className="text-black font-bold">Rs. {activePricing.finalTotal.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">Your Sender EasyPaisa Number (11 Digits) *</label>
                      <input
                        type="tel"
                        value={easypaisaPhone}
                        onChange={(e) => setEasypaisaPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                        placeholder="03451234567"
                        maxLength={11}
                        className="w-full bg-white border border-linen-300 rounded-none p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* MANDATORY PAYMENT RECEIPT PROOF ATTACHMENT BOX */}
                {['jazzcash', 'easypaisa', 'bank'].includes(paymentMethod) && (
                  <div className="mt-4 pt-4 border-t border-linen-300">
                    <div className="p-4 bg-white border-2 border-dashed border-camel-500 dark:border-camel-600 rounded-none space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-xs uppercase tracking-wide text-onyx-950 flex items-center space-x-1.5">
                            <span>📎</span>
                            <span>Upload Payment Screenshot / Receipt *</span>
                          </strong>
                          <p className="text-[11px] text-onyx-500 mt-0.5">
                            Screenshot of successful transfer showing TID, date &amp; amount. Required before order confirmation.
                          </p>
                        </div>
                        {receiptPreview && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-none border border-emerald-300">
                            ✓ Proof Attached
                          </span>
                        )}
                      </div>

                      {!receiptPreview ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center p-5 bg-linen-50 border border-linen-300 hover:border-black transition cursor-pointer text-center group"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/jpg,application/pdf"
                            onChange={handleReceiptFileChange}
                            className="hidden"
                          />
                          <svg className="w-8 h-8 text-camel-600 group-hover:scale-110 transition-transform mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-neutral-800 transition"
                          >
                            Choose File / Upload Screenshot
                          </button>
                          <span className="text-[10px] text-onyx-400 mt-1 font-mono">Accepts PNG, JPG, WEBP, PDF (Max 5MB)</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-linen-100 border border-linen-300 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={receiptPreview}
                              alt="Receipt Preview"
                              className="w-14 h-16 object-cover border border-linen-300 shadow-sm bg-white"
                            />
                            <div>
                              <strong className="block text-xs text-onyx-950 truncate max-w-[220px]">
                                {receiptFileName}
                              </strong>
                              <span className="text-[10px] text-emerald-700 font-bold block">
                                Ready to be verified by Atelier Studio
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveReceipt}
                            className="text-xs text-red-600 hover:text-red-800 font-bold uppercase underline tracking-wider"
                          >
                            Remove / Replace
                          </button>
                        </div>
                      )}

                      {receiptError && (
                        <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs font-bold flex items-center space-x-2">
                          <span>⚠️</span>
                          <span>{receiptError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="pt-4 flex justify-between items-center border-t border-linen-200">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="text-xs text-onyx-600 hover:text-onyx-950 font-medium"
                >
                  ← Back to Address
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeOrder}
                  disabled={isSubmitting}
                  className="bg-olive-700 hover:bg-olive-800 text-linen-100 font-bold px-8 py-3.5 rounded-none text-xs uppercase tracking-wider transition shadow-lg flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Registering Order...</span>
                    </>
                  ) : (
                    <span>Confirm & Place Order • Rs. {activePricing.finalTotal.toLocaleString()} →</span>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
