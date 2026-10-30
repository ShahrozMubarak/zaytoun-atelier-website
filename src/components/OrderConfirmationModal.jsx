import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

/**
 * OrderConfirmationModal - POS Card Terminal & Thermal Invoice Slip Extrusion
 * Modeled after the hardware printer and thermal invoice extrusion engine.
 */
export default function OrderConfirmationModal({ order, isOpen, onClose }) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [isTornOff, setIsTornOff] = useState(false);
  const [isExtruding, setIsExtruding] = useState(false);
  const [isCardInserted, setIsCardInserted] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [oledStatus, setOledStatus] = useState("PROCESSING ORDER...");
  const [oledStep, setOledStep] = useState("AUTHORIZING");
  const [oledProgress, setOledProgress] = useState("35%");
  const [ledStatus, setLedStatus] = useState("amber"); // 'amber' | 'emerald'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const audioCtxRef = useRef(null);
  const timersRef = useRef([]);

  if (!order || (isOpen !== undefined && !isOpen)) return null;

  const orderId = order.orderNumber || order.id || `ZYT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingNumber = order.trackingNumber || `TCS-${Math.floor(10000000 + Math.random() * 90000000)}-PK`;
  const trackingUrl = `${window.location.origin}/track/${orderId}`;
  const orderItems = order.items && order.items.length > 0 ? order.items : [];
  const orderDate = new Date(order.date || order.createdAt || Date.now());
  const formattedDate = orderDate.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
  const formattedTime = orderDate.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const orderTotal = Number(order.total || order.pricing?.finalTotal || 0);

  // Audio synthesis engine (Web Audio API)
  const getAudioContext = () => {
    if (!soundEnabled) return null;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  const playPosSound = (type) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      if (type === 'beep') {
        // Dual-tone EMV authorization approval chime
        [1320, 1760].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.15);
        });
      } else if (type === 'stepper') {
        // Stepper-motor thermal roller feed clicks
        for (let i = 0; i < 18; i++) {
          const tOffset = now + i * 0.11;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220 + (i % 3) * 30, tOffset);
          gain.gain.setValueAtTime(0.035, tOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, tOffset + 0.045);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(tOffset);
          osc.stop(tOffset + 0.05);
        }
      } else if (type === 'tear') {
        // Crisp serrated paper tear sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch {
      // Audio context may be restricted without gesture
    }
  };

  // Run the automatic extrusion animation sequence
  const startPrintSequence = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    setIsTornOff(false);
    setIsExtruding(false);
    setIsCardInserted(false);
    setIsVibrating(false);
    setLedStatus("amber");
    setOledStep("AUTHORIZING");
    setOledStatus("PROCESSING ORDER...");
    setOledProgress("30%");

    // 1. Card dips into top slot
    timersRef.current.push(setTimeout(() => {
      setIsCardInserted(true);
    }, 120));

    // 2. Chime + start thermal roller extrusion
    timersRef.current.push(setTimeout(() => {
      playPosSound('beep');
      playPosSound('stepper');
      setLedStatus("emerald");
      setOledStep("PRINTING");
      setOledStatus("PRINTING INVOICE SLIP...");
      setOledProgress("80%");
      setIsVibrating(true);
      setIsExtruding(true);
    }, 550));

    // 3. Extrusion completes
    timersRef.current.push(setTimeout(() => {
      setIsVibrating(false);
      setOledStep("COMPLETE");
      setOledStatus("READY • TEAR RECEIPT BELOW");
      setOledProgress("100%");
    }, 3000));
  };

  useEffect(() => {
    startPrintSequence();
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, [orderId]);

  // Interactive Tear Off action
  const handleTearOff = () => {
    if (isTornOff) return;
    setIsTornOff(true);
    setOledStatus("RECEIPT DETACHED • THANK YOU");
    playPosSound('tear');
  };

  // Save / Print Invoice
  const handleSaveInvoice = () => {
    window.print();
  };

  // Download Plaintext Receipt File
  const handleDownloadInvoiceFile = () => {
    const textContent = `=====================================================
ZAYTOUN ATELIER — OFFICIAL TAX INVOICE & CONSIGNMENT SLIP
=====================================================
Invoice #: ${orderId}
Timestamp: ${formattedDate} at ${formattedTime}
Courier: TCS Express (Tracking: ${trackingNumber})
Status: Paid / Studio Verified

CLIENT DETAILS:
Name: ${order.customer?.firstName} ${order.customer?.lastName || ''}
Email: ${order.customer?.email}
Phone: ${order.customer?.phone}
Address: ${order.customer?.address}, ${order.customer?.city}

ITEMS PURCHASED:
${orderItems.map((item, i) => `${i + 1}. ${item.name || item.title} (Size: ${item.selectedSize || item.size || 'M'}, Color: ${item.selectedColor || item.colorName || 'Camel'}) x${item.quantity || 1} - Rs. ${(item.price || 0) * (item.quantity || 1)}`).join('\n')}

Subtotal: Rs. ${orderTotal}
Shipping: TCS Express Insured (Complimentary)
TOTAL PAID: Rs. ${orderTotal}

Live Tracking Link:
${trackingUrl}
=====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zaytoun-Invoice-${orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Share Invoice via Web Share API or WhatsApp
  const handleShareInvoice = async () => {
    const shareText = `Assalam-o-Alaikum! My Zaytoun Atelier order #${orderId} has been confirmed. Total: Rs. ${orderTotal.toLocaleString()}. Track consignment with TCS Express: ${trackingUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Zaytoun Atelier Invoice #${orderId}`,
          text: shareText,
          url: trackingUrl
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    // Fallback: Copy link
    navigator.clipboard.writeText(trackingUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  // WhatsApp Direct Share
  const handleWhatsAppShare = () => {
    const msg = `*ZAYTOUN ATELIER — ORDER RECEIPT*
Order ID: #${orderId}
Client: ${order.customer?.firstName} ${order.customer?.lastName || ''}
Total: Rs. ${orderTotal.toLocaleString()}
Courier: TCS Express (${trackingNumber})

Track Order: ${trackingUrl}`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Copy Tracking Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  // Go to Live Courier Tracking
  const handleGoToTracking = () => {
    if (onClose) onClose();
    navigate(`/track/${orderId}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-4xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* =========================================================================
            LEFT COLUMN: HARDWARE & INVOICE CONTROLS PANEL (5 COLS)
        ========================================================================= */}
        <div className="lg:col-span-5 bg-white border border-[#E6D3B3] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-[#1A1A1A]">
          <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A6865A]">
                  TCS DISPATCH GENERATED
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black mt-1">
                Order #{orderId}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[#E6D3B3] flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="text-xs font-black uppercase tracking-wider text-black bg-[#FAF9F6] p-3 border border-[#E6D3B3] rounded-xl flex items-center justify-between">
            <span>TCS EXPRESS CONSIGNMENT</span>
            <span className="font-mono text-[#C69F6F]">{trackingNumber}</span>
          </div>

          {/* Action Buttons: Save, Share, Tear */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-bold">
              INVOICE SLIP ACTIONS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleTearOff}
                className={`py-3 px-3 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  isTornOff
                    ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-default'
                    : 'bg-[#C69F6F] hover:bg-[#b58f5f] text-white shadow-sm'
                }`}
              >
                <span>✂️</span>
                <span>{isTornOff ? 'Receipt Torn' : 'Tear Off Slip'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveInvoice}
                className="py-3 px-3 rounded-xl border border-[#E6D3B3] hover:bg-[#FAF9F6] text-black font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>💾</span>
                <span>Save / Print</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareInvoice}
                className="py-2.5 px-3 rounded-xl border border-[#E6D3B3] hover:bg-[#FAF9F6] text-black font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📤</span>
                <span>{shareSuccess ? '✓ Shared!' : copiedLink ? '✓ Copied Link' : 'Share Receipt'}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Logistics & Live Courier Tracking */}
          <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EFE9DF] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500 font-bold uppercase text-[10px]">TCS Consignment</span>
              <span className="font-mono font-bold text-black">{trackingNumber}</span>
            </div>
            <button
              onClick={handleGoToTracking}
              className="w-full py-2.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Track Live with TCS Express →</span>
            </button>
          </div>

          {/* Sound & Controls */}
          <div className="pt-2 border-t border-[#EFE9DF] flex items-center justify-between text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playPosSound('beep');
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition ${
                soundEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-neutral-100 text-neutral-500 border-neutral-200'
              }`}
            >
              {soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'}
            </button>

            <button
              type="button"
              onClick={startPrintSequence}
              className="text-[11px] font-bold text-[#A6865A] hover:underline cursor-pointer"
            >
              ↻ Replay Print
            </button>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleDownloadInvoiceFile}
              className="w-full text-center text-[11px] font-mono text-neutral-400 hover:text-black hover:underline cursor-pointer"
            >
              Download Plaintext (.txt) Invoice
            </button>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: POS MACHINE HEAD & EXTRUDING THERMAL SLIP (7 COLS)
        ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col items-center justify-start pt-2 pb-6 pos-machine-wrapper">

          {/* Compact Clean Simple POS Terminal Head (Pure White / Camel Details) */}
          <div
            id="pos-terminal-chassis"
            className={`pos-terminal-body w-full max-w-[320px] bg-[#FAF9F6] text-[#111827] p-3.5 border border-[#E6D3B3] shadow-xl ${
              isVibrating ? 'printing-vibrate' : ''
            }`}
          >
            {/* Top EMV Card Slot */}
            <div className="pos-card-slot-top mb-2.5">
              <div
                id="pos-animated-card"
                className={`pos-emv-card ${isCardInserted ? 'card-inserted' : ''}`}
                style={{ backgroundColor: '#C69F6F' }}
              />
            </div>

            {/* Terminal Brand Header */}
            <div className="flex items-center justify-between text-[10px] font-mono px-1 mb-2">
              <div className="flex items-center gap-1.5">
                <span
                  id="pos-led-dot"
                  className={`w-2 h-2 rounded-full ${
                    ledStatus === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span className="font-bold tracking-wider text-black">ZAYTOUN ATELIER POS</span>
              </div>
              <button
                type="button"
                onClick={startPrintSequence}
                className="px-2 py-0.5 rounded bg-white hover:bg-neutral-100 border border-[#E6D3B3] text-black text-[9px] font-bold transition cursor-pointer"
              >
                FEED
              </button>
            </div>

            {/* Status OLED Screen */}
            <div className="rounded-xl bg-white border border-[#E6D3B3] px-3 py-2 mb-3 shadow-2xs">
              <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
                <span className="font-bold text-[#A6865A]">{oledStep}</span>
                <span className="text-black font-black font-mono">Rs. {orderTotal.toLocaleString()}</span>
              </div>
              <div className="font-mono text-[11px] font-bold text-black mt-0.5 truncate">
                {oledStatus}
              </div>
              <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full transition-all duration-500 bg-[#C69F6F] rounded-full"
                  style={{ width: oledProgress }}
                />
              </div>
            </div>

            {/* Recessed Paper Roller Mouth & Metallic Serrated Blade */}
            <div className="pos-paper-mouth">
              <div className="pos-serrated-blade" />
            </div>
          </div>

          {/* Strict Clipping Stage for the Emerging Invoice Paper */}
          <div className="pos-receipt-clip-stage w-full max-w-[320px]">
            <div
              id="printable-thermal-slip"
              className={`thermal-invoice-slip rounded-b-sm border border-[#EFE9DF] ${
                isExtruding ? 'extruding' : ''
              } ${isTornOff ? 'torn-off' : ''}`}
            >
              <div className="p-5 sm:p-6 font-mono text-xs space-y-3.5 bg-[#FCFBF9] text-[#0A0B0E]">
                
                {/* Invoice Header */}
                <div className="text-center border-b border-dashed border-black/25 pb-3">
                  <div className="font-black text-sm tracking-tight text-black uppercase">
                    ZAYTOUN ATELIER
                  </div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                    Official Serialized Tax Invoice
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    INV #{orderId} • {formattedDate}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-1 text-[11px] border-b border-dashed border-black/25 pb-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">CLIENT:</span>
                    <span className="font-bold text-black uppercase">{order.customer?.firstName} {order.customer?.lastName || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">EMAIL:</span>
                    <span className="text-black">{order.customer?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">DESTINATION:</span>
                    <span className="font-bold text-black">{order.customer?.city || 'Karachi, PK'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">PAYMENT:</span>
                    <span className="font-bold uppercase text-[#A6865A]">{order.paymentMethod || 'COD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">COURIER:</span>
                    <span className="font-bold text-black">TCS Express</span>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-2 text-[11px] border-b border-dashed border-black/25 pb-3">
                  {orderItems.length === 0 ? (
                    <div className="flex justify-between font-bold">
                      <span>Core Atelier Piece</span>
                      <span>Rs. {orderTotal.toLocaleString()}</span>
                    </div>
                  ) : (
                    orderItems.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between font-bold">
                          <span className="truncate pr-2">{item.name || item.title}</span>
                          <span>Rs. {Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-neutral-500 text-[10px]">
                          <span>Size: {item.selectedSize || item.size || 'M'} • Qty: {item.quantity || 1}</span>
                          <span>{item.selectedColor || item.colorName || 'Camel'}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between text-neutral-500 text-[10px] pt-1">
                    <span>Express Insured Courier</span>
                    <span className="text-emerald-700 font-bold">FREE</span>
                  </div>
                </div>

                {/* Total & Approval Stamp */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">TOTAL PAID</span>
                    <span className="font-black text-base text-black font-mono">
                      Rs. {orderTotal.toLocaleString()}
                    </span>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded border-2 font-bold text-[10px] tracking-widest uppercase"
                    style={{ borderColor: '#C69F6F', color: '#C69F6F' }}
                  >
                    PAID • TCS AUTH
                  </span>
                </div>

                {/* CSS Barcode Graphic */}
                <div className="pt-2 text-center space-y-1">
                  <div
                    className="h-8 w-full mx-auto"
                    style={{
                      background: 'repeating-linear-gradient(90deg, #0A0B0E 0px, #0A0B0E 2px, transparent 2px, transparent 4px, #0A0B0E 4px, #0A0B0E 7px, transparent 7px, transparent 9px, #0A0B0E 9px, #0A0B0E 11px, transparent 11px, transparent 14px)'
                    }}
                  />
                  <div className="text-[9px] tracking-[0.25em] text-neutral-500 uppercase">
                    *ZYT-2026-{orderId}*
                  </div>
                </div>

              </div>

              {/* Zigzag Perforated Tear Edge */}
              <div className="thermal-zigzag-bottom" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
