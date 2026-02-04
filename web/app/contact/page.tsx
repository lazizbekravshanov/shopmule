'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Clock,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Search,
  Loader2,
  Building2,
  Truck,
  AlertCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  mcNumber: string;
  usdotNumber: string;
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
  usdotNumber: '',
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

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FMCSA verification state
  const [carrierInfo, setCarrierInfo] = useState<CarrierInfo | null>(null);
  const [carrierVerified, setCarrierVerified] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupType, setLookupType] = useState<'dot' | 'mc' | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Reset verification when numbers change
    if (name === 'mcNumber' || name === 'usdotNumber') {
      setCarrierVerified(false);
      setCarrierInfo(null);
      setLookupError(null);
    }
  };

  const lookupCarrier = useCallback(async (type: 'dot' | 'mc') => {
    const number = type === 'dot' ? form.usdotNumber : form.mcNumber;
    const cleaned = number.replace(/[^0-9]/g, '');

    if (!cleaned) {
      setLookupError(`Enter a valid ${type === 'dot' ? 'USDOT' : 'MC'} number first`);
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setCarrierInfo(null);
    setCarrierVerified(false);
    setLookupType(type);

    try {
      const res = await fetch(`/api/fmcsa?type=${type}&number=${cleaned}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setLookupError('FMCSA verification is not configured yet. Enter your details manually.');
        } else if (res.status === 404) {
          setLookupError(`No carrier found for ${type === 'dot' ? 'USDOT' : 'MC'} #${cleaned}. Please verify the number.`);
        } else {
          setLookupError(data.error || 'Lookup failed. Please try again.');
        }
        return;
      }

      setCarrierInfo(data.carrier);
    } catch {
      setLookupError('Connection error. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  }, [form.usdotNumber, form.mcNumber]);

  const confirmCarrier = () => {
    if (!carrierInfo) return;

    setCarrierVerified(true);
    setForm((prev) => ({
      ...prev,
      company: carrierInfo.dbaName || carrierInfo.legalName,
      usdotNumber: carrierInfo.dotNumber || prev.usdotNumber,
      mcNumber: carrierInfo.mcNumber || prev.mcNumber,
      phone: prev.phone || carrierInfo.phone,
    }));
  };

  const clearVerification = () => {
    setCarrierInfo(null);
    setCarrierVerified(false);
    setLookupError(null);
    setLookupType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const isValid = form.name && form.email && form.mcNumber && form.usdotNumber && form.subject && form.message;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="font-bold text-xl text-neutral-900">ShopMule</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="py-20 bg-neutral-50 border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                Contact Us
              </span>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
                Get in touch
              </h1>
              <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto">
                Have a question or want to see a demo? Fill out the form below and
                our team will get back to you within a couple of hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Form + Sidebar */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-3"
              >
                {isSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                      Message sent
                    </h2>
                    <p className="text-neutral-600 mb-1">
                      Thanks for reaching out, {form.name.split(' ')[0]}!
                    </p>
                    <p className="text-neutral-500 text-sm">
                      We&apos;ll get back to you at <strong className="text-neutral-700">{form.email}</strong> within a couple of hours.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-3">
                      <Link
                        href="/"
                        className="px-5 py-2.5 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        Back to Home
                      </Link>
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setForm(initialForm);
                          clearVerification();
                        }}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-[#ee7a14] hover:bg-[#d96a0a] rounded-lg transition-colors"
                      >
                        Send Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name + Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-neutral-700">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="John Smith"
                          className="w-full h-11 px-4 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ee7a14]/20 focus:border-[#ee7a14] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="john@company.com"
                          className="w-full h-11 px-4 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ee7a14]/20 focus:border-[#ee7a14] transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone + Company */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-neutral-700">
                          Phone
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="(555) 000-0000"
                          className="w-full h-11 px-4 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ee7a14]/20 focus:border-[#ee7a14] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium text-neutral-700">
                          Company {carrierVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline ml-1" />}
                        </label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          value={form.company}
                          onChange={handleChange}
                          placeholder="Acme Truck Repair"
                          readOnly={carrierVerified}
                          className={`w-full h-11 px-4 text-sm border rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ee7a14]/20 focus:border-[#ee7a14] transition-all ${
                            carrierVerified
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-white border-neutral-200'
                          }`}
                        />
                      </div>
                    </div>

                    {/* MC + USDOT with FMCSA Verification */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-neutral-700">
                          Carrier Identification <span className="text-red-500">*</span>
                        </p>
                        {carrierVerified && (
                          <button
                            type="button"
                            onClick={clearVerification}
                            className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Clear verification
                          </button>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="usdotNumber" className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                            USDOT Number
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="usdotNumber"
                              name="usdotNumber"
                              type="text"
                              required
                              value={form.usdotNumber}
                              onChange={handleChange}
                              placeholder="1234567"
                              readOnly={carrierVerified}
                              className={`flex-1 h-11 px-4 text-sm border rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ee7a14]/20 focus:border-[#ee7a14] transition-all font-mono ${
                                carrierVerified
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-white border-neutral-200'
                              }`}
                            />
                            {!carrierVerified && (
                              <button
                                type="button"
                                onClick={() => lookupCarrier('dot')}
                                disabled={lookupLoading || !form.usdotNumber.replace(/[^0-9]/g, '')}
                                className="h-11 px-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium flex-shrink-0"
                                title="Verify with FMCSA"
                              >
                                {lookupLoading && lookupType === 'dot' ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Search className="w-3.5 h-3.5" />
                                )}
                                Verify
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="mcNumber" className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                            MC Number
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="mcNumber"
                              name="mcNumber"
                              type="text"
                              required
                              value={form.mcNumber}
                              onChange={handleChange}
                              placeholder="MC-123456"
                              readOnly={carrierVerified}
                              className={`flex-1 h-11 px-4 text-sm border rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ee7a14]/20 focus:border-[#ee7a14] transition-all font-mono ${
                                carrierVerified
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-white border-neutral-200'
                              }`}
                            />
                            {!carrierVerified && (
                              <button
                                type="button"
                                onClick={() => lookupCarrier('mc')}
                                disabled={lookupLoading || !form.mcNumber.replace(/[^0-9]/g, '')}
                                className="h-11 px-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium flex-shrink-0"
                                title="Verify with FMCSA"
                              >
                                {lookupLoading && lookupType === 'mc' ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Search className="w-3.5 h-3.5" />
                                )}
                                Verify
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400">
                        Enter either number and click Verify to look up your company via FMCSA SAFER.
                      </p>

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

                      {/* Carrier Result Card */}
                      <AnimatePresence>
                        {carrierInfo && !carrierVerified && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="border border-blue-200 bg-blue-50 rounded-xl p-5"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-neutral-900">Carrier Found</h4>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                                carrierInfo.statusCode === 'A'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                {carrierInfo.statusCode === 'A' ? 'Active' : carrierInfo.statusCode || 'Unknown'}
                              </span>
                            </div>

                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="font-semibold text-neutral-900 text-base">
                                  {carrierInfo.legalName}
                                </p>
                                {carrierInfo.dbaName && carrierInfo.dbaName !== carrierInfo.legalName && (
                                  <p className="text-neutral-500">DBA: {carrierInfo.dbaName}</p>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200">
                                <div>
                                  <p className="text-neutral-500 text-xs">USDOT</p>
                                  <p className="font-mono font-medium text-neutral-900">{carrierInfo.dotNumber || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-neutral-500 text-xs">MC</p>
                                  <p className="font-mono font-medium text-neutral-900">{carrierInfo.mcNumber || '—'}</p>
                                </div>
                              </div>

                              {(carrierInfo.phyCity || carrierInfo.phyState) && (
                                <div className="flex items-center gap-1.5 text-neutral-600">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {[carrierInfo.phyStreet, carrierInfo.phyCity, carrierInfo.phyState, carrierInfo.phyZipcode]
                                    .filter(Boolean)
                                    .join(', ')}
                                </div>
                              )}

                              <div className="flex items-center gap-4 text-neutral-500">
                                {carrierInfo.totalPowerUnits > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Truck className="w-3.5 h-3.5" />
                                    {carrierInfo.totalPowerUnits} units
                                  </span>
                                )}
                                {carrierInfo.totalDrivers > 0 && (
                                  <span>{carrierInfo.totalDrivers} drivers</span>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-blue-200 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={confirmCarrier}
                                className="flex-1 h-10 bg-[#ee7a14] hover:bg-[#d96a0a] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                This is my company
                              </button>
                              <button
                                type="button"
                                onClick={clearVerification}
                                className="h-10 px-4 border border-neutral-200 bg-white text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
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
                            className="border border-emerald-200 bg-emerald-50 rounded-xl p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-neutral-900 truncate">
                                  {carrierInfo.legalName}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  USDOT {carrierInfo.dotNumber} &middot; MC {carrierInfo.mcNumber} &middot; Verified via FMCSA SAFER
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-neutral-700">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full h-11 px-4 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#ee7a14]/20 focus:border-[#ee7a14] transition-all appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.25em 1.25em',
                        }}
                      >
                        <option value="" disabled>
                          Select a topic
                        </option>
                        {subjectOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-neutral-700">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help..."
                        className="w-full px-4 py-3 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#ee7a14]/20 focus:border-[#ee7a14] transition-all resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className="w-full h-12 bg-[#ee7a14] hover:bg-[#d96a0a] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
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
                      .
                    </p>
                  </form>
                )}
              </motion.div>

              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Response Time */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-neutral-900">Fast Response</h3>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Our team typically responds within <strong>2 hours</strong> during
                    business hours (Mon-Fri, 8am-6pm CST).
                  </p>
                </div>

                {/* FMCSA Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-neutral-900">FMCSA Verification</h3>
                  </div>
                  <p className="text-sm text-neutral-600">
                    We verify your carrier info through FMCSA SAFER to speed up onboarding
                    and ensure accurate records.
                  </p>
                </div>

                {/* Contact Info */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-5">
                  <h3 className="font-semibold text-neutral-900">Other ways to reach us</h3>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Email</p>
                      <a
                        href="mailto:hello@shopmule.com"
                        className="text-sm text-neutral-500 hover:text-[#ee7a14] transition-colors"
                      >
                        hello@shopmule.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Phone</p>
                      <a
                        href="tel:+18005551234"
                        className="text-sm text-neutral-500 hover:text-[#ee7a14] transition-colors"
                      >
                        (800) 555-1234
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Office</p>
                      <p className="text-sm text-neutral-500">Austin, TX</p>
                    </div>
                  </div>
                </div>

                {/* FAQ Callout */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    Common questions?
                  </h3>
                  <p className="text-sm text-neutral-500 mb-3">
                    Check our FAQ for instant answers to the most common questions.
                  </p>
                  <Link
                    href="/#faq"
                    className="text-sm font-medium text-[#ee7a14] hover:text-[#d96a0a] transition-colors"
                  >
                    View FAQ &rarr;
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} ShopMule
          </p>
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
