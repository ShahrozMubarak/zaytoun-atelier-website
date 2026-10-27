import React, { useState } from 'react';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  cartItems: propCartItems,
  pricing,
  onOrderCompleted,
  onConfirmOrder
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

  // Checkout Steps: 1: 'shipping', 2: 'payment', 3: 'verification' (OTP/MPIN/3DS), 4: 'processing'
  const [step, setStep] = useState('shipping');
  
  // Shipping Form State
  const [formData, setFormData] = useState({
    firstName: "Huzaifa",
    lastName: "Khan",
    email: "shaahrozdogar@gmail.com",
    phone: "03001234567",
    address: "House 42-B, Street 14, Phase 6, DHA",
    city: "Lahore",
    province: "Punjab",
    postalCode: "54000",
    orderNotes: "Please deliver between 2 PM and 6 PM."
  });

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
  const [mpin, setMpin] = useState("");

  // EasyPaisa state
  const [easypaisaPhone, setEasypaisaPhone] = useState("03451234567");

  // OTP for COD Verification
  const [codOtp, setCodOtp] = useState("7492");
  const [userEnteredOtp, setUserEnteredOtp] = useState("");

  // Bank 3DS OTP
  const [cardOtp, setCardOtp] = useState("");

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
    if (!formData.phone || !formData.address || !formData.city) {
      alert("Please fill in your phone number, street address, and city.");
      return;
    }
    setStep('payment');
  };

  const handleStartPaymentVerification = () => {
    setStep('verification');
  };

  const handleFinalizeOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedOrderNumber = `ZYT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderPayload = {
        orderNumber: generatedOrderNumber,
        id: generatedOrderNumber,
        customer: formData,
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
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-linen-300 relative fade-in">
        
        {/* Modal Top Header */}
        <div className="p-5 bg-linen-100 border-b border-linen-300 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-editorial text-xl font-bold text-onyx-950">ZAYTOUN & CO.</span>
              <span className="text-xs bg-olive-700 text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Secure 256-Bit SSL Checkout
              </span>
            </div>
            <p className="text-xs text-onyx-600 mt-0.5">
              Nationwide Express Apparel Delivery with TCS, Leopards & Trax
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-onyx-500 hover:text-onyx-950 hover:bg-linen-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-3 bg-linen-200 border-b border-linen-300 text-xs font-semibold text-center">
          <div className={`py-2.5 transition ${step === 'shipping' ? 'bg-olive-700 text-white' : 'text-onyx-700'}`}>
            1. Delivery Address
          </div>
          <div className={`py-2.5 transition ${step === 'payment' ? 'bg-olive-700 text-white' : 'text-onyx-700'}`}>
            2. Payment Method
          </div>
          <div className={`py-2.5 transition ${step === 'verification' ? 'bg-olive-700 text-white' : 'text-onyx-700'}`}>
            3. Verification & Confirm
          </div>
        </div>

        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: SHIPPING & CONTACT */}
          {step === 'shipping' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <h3 className="font-editorial text-lg font-bold text-onyx-950 flex items-center justify-between">
                <span>Shipping Address & Contact Information</span>
                <span className="text-xs text-olive-800 font-sans font-medium">Step 1 of 3</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-linen-50 border border-linen-300 rounded-lg p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
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
                    className="w-full bg-linen-50 border border-linen-300 rounded-lg p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Mobile Phone (for Courier & OTP) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-onyx-500 font-bold">+92</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="03001234567"
                      required
                      className="w-full bg-linen-50 border border-linen-300 rounded-lg p-2.5 pl-11 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700 font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-onyx-500">Required for COD verification and rider updates</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Email Address (for Invoice & Tracking)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-linen-50 border border-linen-300 rounded-lg p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
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
                  className="w-full bg-linen-50 border border-linen-300 rounded-lg p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">City *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-linen-50 border border-linen-300 rounded-lg p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700 font-medium"
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
                    className="w-full bg-linen-50 border border-linen-300 rounded-lg p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx-800 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-linen-50 border border-linen-300 rounded-lg p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
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
                  className="w-full bg-linen-50 border border-linen-300 rounded-lg p-2.5 text-xs text-onyx-900 focus:outline-none focus:ring-1 focus:ring-olive-700"
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
                  className="bg-olive-700 hover:bg-olive-800 text-linen-100 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow"
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
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start space-x-3 ${
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
                      Pay cash to courier rider upon receiving your package at your doorstep. Includes instant SMS OTP verification to prevent fake bookings.
                    </p>
                  </div>
                </div>

                {/* 2. Credit / Debit Card */}
                <div 
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start space-x-3 ${
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
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start space-x-3 ${
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
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">JC</span>
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
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start space-x-3 ${
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
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">EP</span>
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
              <div className="p-4 rounded-xl bg-linen-100 border border-linen-300">
                {paymentMethod === 'cod' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-olive-800 font-bold">
                      <span>✓ Cash On Delivery Selected</span>
                    </div>
                    <p className="text-onyx-700">
                      Rider will collect <strong>Rs. {activePricing.finalTotal.toLocaleString()}</strong> in cash at <strong>{formData.address}, {formData.city}</strong>.
                    </p>
                    <p className="text-onyx-500 text-[11px]">
                      A 4-digit verification code will be generated to confirm your active contact number.
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
                  onClick={handleStartPaymentVerification}
                  className="bg-olive-700 hover:bg-olive-800 text-linen-100 font-bold px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow"
                >
                  Confirm & Verify Payment →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INTERACTIVE GATEWAY VERIFICATION & SIMULATION */}
          {step === 'verification' && (
            <div className="space-y-6 text-center py-4">
              
              {/* COD Verification Screen */}
              {paymentMethod === 'cod' && (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-full bg-olive-100 text-olive-800 mx-auto flex items-center justify-center text-2xl shadow-inner">
                    📱
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-onyx-950">
                    Verify Your Mobile for Cash on Delivery
                  </h3>
                  <p className="text-xs text-onyx-600 leading-relaxed">
                    To prevent fraudulent orders and confirm courier dispatch to <strong className="text-onyx-900">{formData.city}</strong>, we have sent a 4-digit SMS OTP to <strong className="text-olive-800">+92 {formData.phone}</strong>.
                  </p>

                  <div className="p-3 bg-linen-200 rounded-lg text-xs font-mono text-onyx-800">
                    <span>Simulated SMS Message: </span>
                    <strong className="text-olive-800">Your ZAYTOUN & CO. verification code is: {codOtp}</strong>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-onyx-800 mb-1">Enter 4-Digit Code</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={userEnteredOtp}
                      onChange={(e) => setUserEnteredOtp(e.target.value)}
                      placeholder={codOtp}
                      className="w-40 mx-auto text-center font-mono text-xl tracking-widest bg-linen-50 border-2 border-olive-700 rounded-lg py-2 focus:outline-none"
                    />
                  </div>

                  <p className="text-[11px] text-onyx-500">
                    Didn't receive SMS? <button onClick={() => setCodOtp(`${Math.floor(1000 + Math.random() * 9000)}`)} className="underline text-olive-800 font-bold">Resend OTP</button>
                  </p>
                </div>
              )}

              {/* Credit Card 3DS Verification */}
              {paymentMethod === 'card' && (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 mx-auto flex items-center justify-center text-2xl shadow-inner">
                    🔒
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-onyx-950">
                    Verified by VISA / Mastercard ID Check (3D-Secure 2.0)
                  </h3>
                  <p className="text-xs text-onyx-600">
                    Authorizing payment of <strong className="text-olive-800">Rs. {activePricing.finalTotal.toLocaleString()}</strong> to <strong className="text-onyx-900">ZAYTOUN ATELIER (PVT) LTD</strong>.
                  </p>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 text-left font-mono space-y-1">
                    <div>Merchant: Zaytoun & Co. Official</div>
                    <div>Card: {cardData.number}</div>
                    <div>Simulated Bank OTP: <strong className="text-blue-800">9281</strong></div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-onyx-800 mb-1">Enter Bank 3DS OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={cardOtp}
                      onChange={(e) => setCardOtp(e.target.value)}
                      placeholder="9281"
                      className="w-40 mx-auto text-center font-mono text-xl tracking-widest bg-linen-50 border-2 border-blue-700 rounded-lg py-2 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* JazzCash MPIN Prompt */}
              {paymentMethod === 'jazzcash' && (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center text-2xl shadow-inner">
                    🔴
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-red-700">
                    JazzCash USSD Push Prompt
                  </h3>
                  <p className="text-xs text-onyx-600">
                    A direct debit request for <strong className="text-red-700">Rs. {activePricing.finalTotal.toLocaleString()}</strong> has been dispatched to your JazzCash wallet: <strong className="text-onyx-950">{jazzcashPhone}</strong>.
                  </p>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-left space-y-2 text-xs">
                    <div className="font-bold text-red-900">📱 Mobile Prompt Instructions:</div>
                    <ol className="list-decimal list-inside text-onyx-700 space-y-1">
                      <li>Check your phone screen for the JazzCash pop-up dialog.</li>
                      <li>Verify the amount: <strong>Rs. {activePricing.finalTotal.toLocaleString()}</strong>.</li>
                      <li>Enter your 4-digit secret JazzCash MPIN to authorize.</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-onyx-800 mb-1">Simulate MPIN Entry</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={mpin}
                      onChange={(e) => setMpin(e.target.value)}
                      placeholder="••••"
                      className="w-32 mx-auto text-center font-mono text-xl tracking-widest bg-linen-50 border-2 border-red-600 rounded-lg py-2 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* EasyPaisa USSD Prompt */}
              {paymentMethod === 'easypaisa' && (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center text-2xl shadow-inner">
                    🟢
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-emerald-800">
                    EasyPaisa In-App / USSD Approval
                  </h3>
                  <p className="text-xs text-onyx-600">
                    Payment request generated for <strong className="text-emerald-800">Rs. {activePricing.finalTotal.toLocaleString()}</strong> to mobile <strong className="text-onyx-950">{easypaisaPhone}</strong>.
                  </p>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-2 text-xs">
                    <div className="font-bold text-emerald-950">⚡ Instant Approval Steps:</div>
                    <ul className="list-disc list-inside text-onyx-700 space-y-1">
                      <li>Open your <strong>EasyPaisa App</strong> and tap on the notification badge.</li>
                      <li>Or respond directly to the pop-up on your phone screen with your EasyPaisa PIN.</li>
                      <li>Upon approval, your order confirmation will generate instantly.</li>
                    </ul>
                  </div>

                  <div className="inline-flex items-center space-x-2 text-xs text-emerald-700 font-semibold bg-emerald-100 px-3 py-1.5 rounded-full animate-pulse">
                    <span>📡 Waiting for EasyPaisa Webhook Signal...</span>
                  </div>
                </div>
              )}

              {/* Final Confirm Button */}
              <div className="pt-6 border-t border-linen-300 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="text-xs text-onyx-600 hover:text-onyx-950 font-medium"
                >
                  ← Choose Different Method
                </button>
                <button
                  onClick={handleFinalizeOrder}
                  disabled={isSubmitting}
                  className="bg-olive-700 hover:bg-olive-800 text-linen-100 font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>Authorize & Place Order • Rs. {activePricing.finalTotal.toLocaleString()}</span>
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
