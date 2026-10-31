import React, { useState } from 'react';
import { submitContactInquiry } from '../services/api';
import SymbioteButton from '../components/SymbioteButton';

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
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-onyx-950 text-neutral-900 dark:text-neutral-100 transition-colors py-12 sm:py-20 select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
        
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold">
            Atelier Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1C1612] dark:text-white">
            How May We Assist You?
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
            Our atelier concierge in Lahore is available for bespoke inquiries, styling guidance, and order support.
          </p>
        </div>

        {/* Two-Column Grid: Left Information, Right Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column (5 cols): Atelier Info & Direct Contact */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Atelier Card */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#1A1613] border border-[#E8E0D5] dark:border-[#2C241D] space-y-3 shadow-2xs">
              <h3 className="font-serif text-lg font-bold text-[#1C1612] dark:text-white">Lahore Atelier & Showroom</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                Plot 14-B, MM Alam Road, Gulberg III, Lahore, Pakistan
              </p>
              <div className="pt-2 text-xs font-mono space-y-1 text-neutral-700 dark:text-neutral-300">
                <p>Mon – Sat: 11:00 AM – 9:00 PM PKT</p>
                <p>Sunday: By Private Appointment</p>
              </div>
            </div>

            {/* Quick Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-2xl bg-white dark:bg-[#1A1613] border border-[#E8E0D5] dark:border-[#2C241D] hover:border-[#9A6E3E] transition block group shadow-2xs"
              >
                <div className="flex items-center space-x-2 text-[#9A6E3E] mb-1">
                  <span className="font-bold text-xs uppercase tracking-wider">WhatsApp</span>
                </div>
                <p className="text-xs font-mono text-neutral-900 dark:text-white font-bold">+92 300 1234567</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Instant stylist assistance</p>
              </a>

              <a
                href="mailto:concierge@foolisharc.com"
                className="p-5 rounded-2xl bg-white dark:bg-[#1A1613] border border-[#E8E0D5] dark:border-[#2C241D] hover:border-[#9A6E3E] transition block group shadow-2xs"
              >
                <div className="flex items-center space-x-2 text-[#9A6E3E] mb-1">
                  <span className="font-bold text-xs uppercase tracking-wider">Email Concierge</span>
                </div>
                <p className="text-xs font-mono text-neutral-900 dark:text-white font-bold">atelier@foolisharc.com</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Replies within 4 business hours</p>
              </a>
            </div>

          </div>

          {/* Right Column (7 cols): Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#1A1613] border border-[#E8E0D5] dark:border-[#2C241D] shadow-2xs">
              <h3 className="font-serif text-xl font-bold mb-1 text-[#1C1612] dark:text-white">Send an Inquiry</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                Direct inquiry to our Lahore studio concierge.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-3 bg-[#FAF6F0] dark:bg-[#201A16] rounded-2xl border border-[#E8E0D5] dark:border-[#332A22]">
                  <span className="text-3xl text-[#9A6E3E]">✓</span>
                  <h4 className="text-lg font-serif font-bold text-[#1C1612] dark:text-white">
                    Inquiry Received
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-sm mx-auto">
                    Our atelier concierge has received your note and will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ayesha Malik"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-medium text-black dark:text-white focus:outline-none focus:border-[#9A6E3E] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ayesha@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-medium text-black dark:text-white focus:outline-none focus:border-[#9A6E3E] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                      Order Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="e.g. TCS-99482104-LHE"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-mono font-medium text-black dark:text-white focus:outline-none focus:border-[#9A6E3E] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Details regarding your sizing or inquiry..."
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-medium text-black dark:text-white focus:outline-none focus:border-[#9A6E3E] transition resize-none"
                    />
                  </div>

                  <SymbioteButton
                    type="submit"
                    disabled={loading}
                    theme="camel"
                    containerClassName="w-full"
                    className="w-full py-4 rounded-xl bg-[#1C1612] hover:bg-[#9A6E3E] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>SENDING INQUIRY...</span>
                    ) : (
                      <span>SUBMIT INQUIRY →</span>
                    )}
                  </SymbioteButton>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
