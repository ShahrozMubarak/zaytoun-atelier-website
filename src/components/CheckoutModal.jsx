import React, { useState, useEffect } from 'react';

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
  
  // Shipping Form State (pre-filled with Google user profile if signed in)
  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || (user?.name ? user.name.split(' ')[0] : ""),
    lastName: user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : ""),
    email: user?.email || "",
    phone: user?.phone || "03001234567",
    address: user?.address || "House 42-B, Street 14, Phase 6, DHA",
    city: user?.city || "Lahore",
    province: user?.province || "Punjab",
    postalCode: user?.postalCode || "54000",
    orderNotes: "Please deliver between 2 PM and 6 PM."
  }));

  // Automatically sync customer name and email when Google user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || (user.name ? user.name.split(' ')[0] : prev.firstName),
        lastName: user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : prev.lastName),
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

  // JazzCash state
  const [jazzcashPhone, setJazzcashPhone] = useState("03001234567");
  const [jazzcashCnic, setJazzcashCnic] = useState("42101-1234567-1");

  // EasyPaisa state
  const [easypaisaPhone, setEasypaisaPhone] = useState("03451234567");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const PAKISTANI_CITIES = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", 
    "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", 
    "Hyderabad", "Abbottabad", "Bahawalpur", "Sargodha"
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!user || user.authProvider !== 'google' || !user.googleVerified) {
      alert("⚠️ Google Verification Required: You must sign in with Google before you can order.");
      return;
    }
    if (!formData.phone || !formData.address || !formData.city) {
      alert("Please fill in your phone number, street address, and city.");
      return;
    }
    setStep('payment');
  };

  const handleFinalizeOrder = () => {
    // 🛑 STRICT VERIFICATION CHECK: Customer CANNOT order without Google verification
    if (!user || user.authProvider !== 'google' || !user.googleVerified) {
      alert("⚠️ Google Verification Required: You must be signed in with Google to place an order.");
      return;
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
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-linen-50 border border-linen-300 rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-linen-50 border border-linen-300 rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Mobile Phone (for Courier Delivery) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-onyx-500 font-bold">+92</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="03001234567"
                      required
                      className="w-full bg-linen-50 border border-linen-300 rounded-none p-2.5 pl-11 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700 font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-onyx-500">Required for COD verification and rider updates</span>
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
                  className="w-full bg-linen-50 border border-linen-300 rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
                />
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
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-linen-50 border border-linen-300 rounded-none p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
                  />
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
                    <div className="text-xs font-bold text-red-800">JazzCash Mobile Account Details:</div>
                    <div>
                      <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">JazzCash Mobile Number *</label>
                      <input
                        type="tel"
                        value={jazzcashPhone}
                        onChange={(e) => setJazzcashPhone(e.target.value)}
                        placeholder="03001234567"
                        className="w-full bg-white border border-linen-300 rounded p-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">CNIC (Last 6 Digits for Security)</label>
                      <input
                        type="text"
                        value={jazzcashCnic}
                        onChange={(e) => setJazzcashCnic(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-white border border-linen-300 rounded p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'easypaisa' && (
                  <div className="space-y-3 text-xs">
                    <div className="text-xs font-bold text-emerald-800">EasyPaisa Account Details:</div>
                    <div>
                      <label className="block text-[11px] font-semibold text-onyx-700 mb-0.5">EasyPaisa Mobile Number *</label>
                      <input
                        type="tel"
                        value={easypaisaPhone}
                        onChange={(e) => setEasypaisaPhone(e.target.value)}
                        placeholder="03451234567"
                        className="w-full bg-white border border-linen-300 rounded p-2 text-xs font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-onyx-600">
                      Ensure your EasyPaisa wallet has at least <strong>Rs. {activePricing.finalTotal.toLocaleString()}</strong> balance.
                    </p>
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
