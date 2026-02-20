'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "We went from chaos to organized in a week. The time tracking alone saved us thousands in lost billable hours.",
    author: "Mike Rodriguez",
    role: "Owner, Rodriguez Truck Repair",
    location: "Houston, TX",
  },
  {
    quote: "Finally, software that understands repair shops. My technicians picked it up in minutes, not days.",
    author: "James Williams",
    role: "Owner, Williams Auto & Diesel",
    location: "Atlanta, GA",
  },
  {
    quote: "The simplicity is what sold us. No bloat, just the tools we actually need to run our shop.",
    author: "Sarah Chen",
    role: "Service Manager, FleetMax Services",
    location: "Denver, CO",
  },
  {
    quote: "We cut our invoicing time in half. Customers get payment links instantly and we get paid faster.",
    author: "Tommy Nguyen",
    role: "Owner, Nguyen Brothers Diesel",
    location: "Dallas, TX",
  },
  {
    quote: "The inventory tracking pays for itself. We haven't had a surprise stockout since we switched.",
    author: "Dave Kowalski",
    role: "Parts Manager, Kowalski Heavy Equipment",
    location: "Chicago, IL",
  },
  {
    quote: "I can see exactly what every tech is working on from my phone. That visibility changed how I manage the floor.",
    author: "Linda Morales",
    role: "Shop Foreman, Central Valley Truck Care",
    location: "Fresno, CA",
  },
  {
    quote: "Switched from pen and paper after 20 years. Wish I'd done it sooner. My guys actually like using this one.",
    author: "Earl Patterson",
    role: "Owner, Patterson Truck & Trailer",
    location: "Memphis, TN",
  },
  {
    quote: "The work order flow is exactly how a real shop works. Diagnose, approve, work, done. No extra steps.",
    author: "Marcus Johnson",
    role: "Lead Mechanic, Johnson Fleet Services",
    location: "Phoenix, AZ",
  },
  {
    quote: "Fleet billing used to take me a full day at month end. Now it's 20 minutes. That's not an exaggeration.",
    author: "Ray Delgado",
    role: "Owner, Southwest Fleet Repair",
    location: "Albuquerque, NM",
  },
];

export function Testimonials() {
  return (
    <section className="py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-neutral-900 tracking-tight">
            Loved by repair shops.
          </h2>
          <p className="mt-4 text-xl text-neutral-500">
            Real owners. Real shops. Real results.
          </p>
        </motion.div>

        {/* 3-column grid — no carousel */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="break-inside-avoid bg-neutral-50 rounded-2xl p-6 border border-neutral-100"
            >
              <p className="text-neutral-700 leading-relaxed text-[15px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 pt-4 border-t border-neutral-200">
                <p className="font-semibold text-sm text-neutral-900">{t.author}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{t.role}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
