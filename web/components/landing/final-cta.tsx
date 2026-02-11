'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  CheckCircle2,
  Search,
  Loader2,
  Building2,
  Truck,
  MapPin,
  AlertCircle,
  ShieldCheck,
  X,
} from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  mcNumber: string;
  subject: string;
  message: string;
};

type CarrierInfo = {
  dotNumber: string;
  mcNumber: string;
  legalName: string;
  dbaName: string;
  phyStreet: string;
  phyCity: string;
  phyState: string;
  phyZipcode: string;
  phone: string;
  totalDrivers: number;
  totalPowerUnits: number;
  statusCode: string;
};

const initialForm: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  mcNumber: '',
  subject: '',
  message: '',
};

const subjectOptions = [
  'General Inquiry',
  'Product Demo',
  'Pricing Question',
  'Technical Support',
  'Partnership',
  'Other',
];

export function FinalCTA() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [carrierInfo, setCarrierInfo] = useState<CarrierInfo | null>(null);
  const [carrierVerified, setCarrierVerified] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'mcNumber') {
      setCarrierVerified(false);
      setCarrierInfo(null);
      setLookupError(null);
    }
  };

  const lookupCarrier = useCallback(async () => {
    const cleaned = form.mcNumber.replace(/[^0-9]/g, '');
    if (!cleaned) {
      setLookupError('Enter a valid MC number first');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setCarrierInfo(null);
    setCarrierVerified(false);

    try {
      const res = await fetch(`/api/fmcsa?type=mc&number=${cleaned}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setLookupError('FMCSA verification is not configured yet.');
        } else if (res.status === 404) {
          setLookupError(`No carrier found for MC #${cleaned}.`);
        } else {
          setLookupError(data.error || 'Lookup failed.');
        }
        return;
      }

      setCarrierInfo(data.carrier);
    } catch {
      setLookupError('Connection error. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  }, [form.mcNumber]);

  const confirmCarrier = () => {
    if (!carrierInfo) return;
    setCarrierVerified(true);
    setForm((prev) => ({
      ...prev,
      company: carrierInfo.dbaName || carrierInfo.legalName,
      mcNumber: carrierInfo.mcNumber || prev.mcNumber,
      phone: prev.phone || carrierInfo.phone,
    }));
  };

  const clearVerification = () => {
    setCarrierInfo(null);
    setCarrierVerified(false);
    setLookupError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, carrierVerified }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = form.name && form.email && form.mcNumber && form.subject && form.message;

  const inputClass =
    'w-full h-11 px-4 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#404040]/20 focus:border-[#404040] transition-all';

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
            Get in touch
          </h2>
          <p className="mt-3 text-neutral-500">
            Fill out the form and we&apos;ll get back to you within a couple of hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                Message sent
              </h3>
              <p className="text-neutral-500 text-sm">
                Thanks, {form.name.split(' ')[0]}. We&apos;ll respond at{' '}
                <span className="text-neutral-700 font-medium">{form.email}</span> shortly.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setForm(initialForm);
                  clearVerification();
                }}
                className="mt-6 text-sm font-medium text-[#404040] hover:text-[#262626] transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-sm font-medium text-neutral-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-sm font-medium text-neutral-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Phone + Company */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-phone" className="text-sm font-medium text-neutral-700">
                    Phone
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 000-0000"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-company" className="text-sm font-medium text-neutral-700">
                    Company
                    {carrierVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline ml-1" />}
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Truck Repair"
                    readOnly={carrierVerified}
                    className={`${inputClass} ${carrierVerified ? '!bg-emerald-50 !border-emerald-200' : ''}`}
                  />
                </div>
              </div>

              {/* MC Number */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="contact-mc" className="text-sm font-medium text-neutral-700">
                    MC Number <span className="text-red-500">*</span>
                  </label>
                  {carrierVerified && (
                    <button
                      type="button"
                      onClick={clearVerification}
                      className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    id="contact-mc"
                    name="mcNumber"
                    type="text"
                    required
                    value={form.mcNumber}
                    onChange={handleChange}
                    placeholder="MC-123456"
                    readOnly={carrierVerified}
                    className={`flex-1 h-11 px-4 text-sm border rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#404040]/20 focus:border-[#404040] transition-all font-mono ${
                      carrierVerified ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-neutral-200'
                    }`}
                  />
                  {!carrierVerified && (
                    <button
                      type="button"
                      onClick={() => lookupCarrier()}
                      disabled={lookupLoading || !form.mcNumber.replace(/[^0-9]/g, '')}
                      className="h-11 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-lg transition-all flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
                    >
                      {lookupLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      Verify
                    </button>
                  )}
                </div>

                {/* Lookup Error */}
                <AnimatePresence>
                  {lookupError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700">{lookupError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Carrier Result */}
                <AnimatePresence>
                  {carrierInfo && !carrierVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="border border-neutral-200 bg-neutral-50 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-neutral-500" />
                          <span className="font-medium text-neutral-900 text-sm">{carrierInfo.legalName}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          carrierInfo.statusCode === 'A'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {carrierInfo.statusCode === 'A' ? 'Active' : carrierInfo.statusCode || 'Unknown'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
                        {carrierInfo.dbaName && carrierInfo.dbaName !== carrierInfo.legalName && (
                          <span>DBA: {carrierInfo.dbaName}</span>
                        )}
                        {carrierInfo.mcNumber && <span className="font-mono">MC {carrierInfo.mcNumber}</span>}
                        {carrierInfo.dotNumber && <span className="font-mono">DOT {carrierInfo.dotNumber}</span>}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                        {(carrierInfo.phyCity || carrierInfo.phyState) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {[carrierInfo.phyCity, carrierInfo.phyState].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {carrierInfo.totalPowerUnits > 0 && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {carrierInfo.totalPowerUnits} units
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={confirmCarrier}
                          className="flex-1 h-9 bg-[#404040] hover:bg-[#262626] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          This is my company
                        </button>
                        <button
                          type="button"
                          onClick={clearVerification}
                          className="h-9 px-3 border border-neutral-200 bg-white text-neutral-600 text-sm rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          Not mine
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Verified Badge */}
                <AnimatePresence>
                  {carrierVerified && carrierInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2.5 p-3 border border-emerald-200 bg-emerald-50 rounded-lg"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-neutral-900">{carrierInfo.legalName}</span>
                        <span className="text-xs text-neutral-500 ml-2">MC {carrierInfo.mcNumber} &middot; Verified</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="text-sm font-medium text-neutral-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25em 1.25em',
                  }}
                >
                  <option value="" disabled>Select a topic</option>
                  {subjectOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-sm font-medium text-neutral-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#404040]/20 focus:border-[#404040] transition-all resize-none"
                />
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full h-11 bg-[#404040] hover:bg-[#262626] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-400 text-center">
                By submitting, you agree to our{' '}
                <Link href="#" className="underline hover:text-neutral-600">
                  Privacy Policy
                </Link>
                . We respond within 2 hours during business hours.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
