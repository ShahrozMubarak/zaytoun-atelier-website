import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderConfirmationModal({ order, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const orderId = order.orderNumber || order.id || 'ZYT-2026-9041';
  const trackingUrl = `${window.location.origin}/track/${orderId}`;

  const paymentLabels = {
    cod: { label: "Cash on Delivery", badge: "COD Pending Courier Collection", color: "text-amber-800 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300" },
    card: { label: "Credit / Debit Card (3DS)", badge: "Payment Authorized", color: "text-blue-800 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300" },
    jazzcash: { label: "JazzCash Mobile Wallet", badge: "Paid via JazzCash", color: "text-red-800 bg-red-100 dark:bg-red-900/40 dark:text-red-300" },
    easypaisa: { label: "EasyPaisa Account", badge: "Paid via EasyPaisa", color: "text-emerald-800 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300" }
  };

  const currentPay = paymentLabels[order.paymentMethod] || paymentLabels.cod;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleGoToTracking = () => {
    if (onClose) onClose();
    navigate(`/track/${orderId}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-onyx-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-onyx-900 rounded-none max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-linen-300 dark:border-onyx-800 relative fade-in text-center space-y-6">
        
        {/* Celebration Icon */}
        <div className="w-16 h-16 rounded-none bg-olive-700 text-linen-100 mx-auto flex items-center justify-center text-3xl shadow-lg">
          ✓
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <span className="text-[11px] uppercase font-mono tracking-widest text-camel-600 dark:text-camel-400 font-bold">
            Wear Less, Wear Longer • Order Confirmed
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-onyx-950 dark:text-linen-50">
            Thank You For Your Patronage
          </h2>
          <p className="text-xs text-onyx-600 dark:text-linen-400">
            A confirmation email and SMS with your live tracking link has been sent to <strong className="text-onyx-950 dark:text-linen-100">{order.customer?.email}</strong>.
          </p>
        </div>

        {/* Shareable Tracking Link Banner */}
        <div className="p-4 rounded-none bg-linen-100 dark:bg-onyx-950 border border-linen-300 dark:border-onyx-800 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-onyx-500 dark:text-linen-400 font-bold">
              Your Shareable Tracking Link:
            </span>
            <button
              onClick={handleCopyLink}
              className="text-[11px] font-mono font-bold text-camel-700 dark:text-camel-400 hover:underline"
            >
              {copied ? '✓ Link Copied!' : '📋 Copy Link'}
            </button>
          </div>
          <div className="p-2.5 rounded-none bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 font-mono text-xs text-olive-800 dark:text-camel-300 break-all select-all flex items-center justify-between">
            <span>{trackingUrl}</span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-linen-50 dark:bg-onyx-950/60 rounded-none p-5 border border-linen-300 dark:border-onyx-800 text-left space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-linen-200 dark:border-onyx-800 gap-2">
            <div>
              <span className="text-onyx-500 dark:text-linen-400 text-[11px]">Consignment ID:</span>
              <div className="font-mono text-base font-bold text-olive-800 dark:text-camel-400">{orderId}</div>
            </div>
            <div className="sm:text-right">
              <span className="text-onyx-500 dark:text-linen-400 text-[11px]">Payment Mode:</span>
              <div>
                <span className={`inline-block font-bold text-[10px] px-2.5 py-0.5 rounded-none ${currentPay.color}`}>
                  {currentPay.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-onyx-800 dark:text-linen-200">
            <div>
              <strong className="block text-onyx-500 dark:text-linen-400 text-[10px] uppercase tracking-wider mb-0.5">Delivery Destination:</strong>
              <div className="font-semibold text-onyx-950 dark:text-linen-50">{order.customer?.firstName} {order.customer?.lastName}</div>
              <div>{order.customer?.address}</div>
              <div>{order.customer?.city}, {order.customer?.province || 'Punjab'}</div>
              <div>Phone: +92 {order.customer?.phone}</div>
            </div>

            <div>
              <strong className="block text-onyx-500 dark:text-linen-400 text-[10px] uppercase tracking-wider mb-0.5">Summary:</strong>
              <div>Estimated Delivery: <strong>2 - 4 Business Days</strong></div>
              <div>Courier: <strong>TCS Express / Leopards</strong></div>
              <div className="font-bold text-olive-800 dark:text-camel-400 text-sm mt-1">
                Total Payable: Rs. {(order.total || order.pricing?.finalTotal || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleGoToTracking}
            className="flex-1 bg-olive-800 hover:bg-olive-900 dark:bg-camel-500 dark:hover:bg-camel-600 text-linen-100 dark:text-onyx-950 font-bold py-3 rounded-none text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center space-x-2"
          >
            <span>Track Order Now →</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 bg-linen-200 dark:bg-onyx-800 hover:bg-linen-300 text-onyx-900 dark:text-linen-100 font-bold py-3 rounded-none text-xs uppercase tracking-wider transition"
          >
            🖨️ Invoice
          </button>
          <button
            onClick={onClose}
            className="px-5 border border-linen-300 dark:border-onyx-700 hover:bg-linen-100 dark:hover:bg-onyx-800 text-onyx-800 dark:text-linen-200 font-medium py-3 rounded-none text-xs uppercase tracking-wider transition"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}
