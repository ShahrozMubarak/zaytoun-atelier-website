import React, { useState } from 'react';
import { submitContactInquiry } from '../services/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', orderNumber: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email && formData.message) {
      setLoading(true);
      await submitContactInquiry(formData);
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', orderNumber: '', message: '' });
        setSubmitted(false);
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-linen-100 dark:bg-onyx-950 text-onyx-950 dark:text-linen-100 transition-colors py-12 sm:py-16">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
        
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 font-semibold">
            Atelier Concierge
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-onyx-950 dark:text-linen-50">
            How May We Assist You?
          </h1>
          <p className="text-sm text-onyx-600 dark:text-linen-400 font-light leading-relaxed">
            Whether you need sizing advice, bespoke alterations, custom ensemble styling, or order tracking, our Lahore concierge is ready to assist.
          </p>
        </div>

        {/* Two-Column Grid: Left Information & FAQs, Right Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column (5 cols): Atelier Info & Direct Contact */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Atelier Card */}
            <div className="p-6 rounded-3xl bg-linen-200/50 dark:bg-onyx-900/50 border border-linen-300 dark:border-onyx-800 space-y-4">
              <h3 className="font-editorial text-xl font-bold">Lahore Atelier & Showroom</h3>
              <p className="text-xs text-onyx-600 dark:text-linen-400 font-light leading-relaxed">
                Plot 14-B, MM Alam Road, Gulberg III, Lahore, Punjab, Pakistan
              </p>
              <div className="pt-2 text-xs font-mono space-y-1 text-onyx-700 dark:text-linen-300">
                <p>Mon – Sat: 11:00 AM – 9:00 PM PKT</p>
                <p>Sunday: By Private Appointment Only</p>
              </div>
            </div>

            {/* Quick Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-2xl bg-olive-900/10 dark:bg-onyx-900 border border-olive-800/20 dark:border-onyx-800 hover:border-olive-800 transition block group"
              >
                <div className="flex items-center space-x-2 text-olive-800 dark:text-camel-400 mb-1">
                  <span className="font-bold text-sm">💬 WhatsApp</span>
                </div>
                <p className="text-[11px] font-mono text-onyx-900 dark:text-linen-100">+92 300 1234567</p>
                <p className="text-[10px] text-onyx-500 dark:text-linen-400 mt-1">Instant sizing & styling concierge</p>
              </a>

              <a
                href="mailto:concierge@zaytoun.com"
                className="p-5 rounded-2xl bg-linen-200/50 dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 hover:border-onyx-950 dark:hover:border-linen-200 transition block group"
              >
                <div className="flex items-center space-x-2 text-camel-600 dark:text-camel-400 mb-1">
                  <span className="font-bold text-sm">✉ Concierge Email</span>
                </div>
                <p className="text-[11px] font-mono text-onyx-900 dark:text-linen-100">atelier@zaytoun.pk</p>
                <p className="text-[10px] text-onyx-500 dark:text-linen-400 mt-1">Replies within 4 business hours</p>
              </a>
            </div>

            {/* Exchange Policy Summary */}
            <div className="p-6 rounded-3xl bg-linen-100 dark:bg-onyx-900/40 border border-linen-300 dark:border-onyx-800 space-y-2">
              <h4 className="font-editorial text-base font-bold text-onyx-950 dark:text-linen-50">
                14-Day Nationwide Returns & Exchanges
              </h4>
              <p className="text-xs text-onyx-600 dark:text-linen-400 font-light leading-relaxed">
                If the fit isn’t quite perfect, hand it back to our courier rider or WhatsApp our team for a free pickup and size replacement anywhere in Pakistan.
              </p>
            </div>

          </div>

          {/* Right Column (7 cols): Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-linen-100 dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 shadow-sm">
              <h3 className="font-editorial text-2xl font-bold mb-6">Send an Inquiry</h3>

              {submitted ? (
                <div className="py-12 text-center space-y-3 bg-olive-900/10 rounded-2xl border border-olive-800/20">
                  <span className="text-3xl">✓</span>
                  <h4 className="font-editorial text-xl font-bold text-olive-800 dark:text-camel-400">
                    Message Received
                  </h4>
                  <p className="text-xs text-onyx-600 dark:text-linen-300 max-w-sm mx-auto">
                    Our atelier team in Lahore has received your note and will contact you shortly via email or WhatsApp.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-onyx-600 dark:text-linen-400 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Zainab Khan"
                        className="w-full px-4 py-2.5 rounded-xl bg-linen-200/70 dark:bg-onyx-950 border border-linen-300 dark:border-onyx-800 text-xs focus:outline-none focus:border-olive-800 dark:focus:border-camel-400 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-onyx-600 dark:text-linen-400 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="zainab@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-linen-200/70 dark:bg-onyx-950 border border-linen-300 dark:border-onyx-800 text-xs focus:outline-none focus:border-olive-800 dark:focus:border-camel-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-onyx-600 dark:text-linen-400 mb-1">
                      Order / Tracking Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="e.g. ZYT-2026-8941"
                      className="w-full px-4 py-2.5 rounded-xl bg-linen-200/70 dark:bg-onyx-950 border border-linen-300 dark:border-onyx-800 text-xs focus:outline-none focus:border-olive-800 dark:focus:border-camel-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-onyx-600 dark:text-linen-400 mb-1">
                      Message / Sizing Question *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what you're looking for, or ask about fit and alterations..."
                      className="w-full px-4 py-2.5 rounded-xl bg-linen-200/70 dark:bg-onyx-950 border border-linen-300 dark:border-onyx-800 text-xs focus:outline-none focus:border-olive-800 dark:focus:border-camel-400 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-olive-800 hover:bg-olive-900 dark:bg-camel-500 dark:hover:bg-camel-600 text-linen-100 dark:text-onyx-950 font-medium text-xs uppercase tracking-widest transition shadow-md active:scale-95"
                  >
                    Send to Atelier Concierge
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
