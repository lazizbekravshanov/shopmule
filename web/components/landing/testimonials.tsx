'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    quote: "We went from chaos to organized in a week. The time tracking alone saved us thousands in lost billable hours.",
    author: "Mike Rodriguez",
    role: "Owner",
    company: "Rodriguez Truck Repair",
    location: "Houston, TX",
    rating: 5,
  },
  {
    quote: "Finally, software that understands repair shops. My technicians picked it up in minutes, not days.",
    author: "James Williams",
    role: "Owner",
    company: "Williams Auto & Diesel",
    location: "Atlanta, GA",
    rating: 5,
  },
  {
    quote: "The simplicity is what sold us. No bloat, just the tools we actually need to run our shop.",
    author: "Sarah Chen",
    role: "Service Manager",
    company: "FleetMax Services",
    location: "Denver, CO",
    rating: 5,
  },
  {
    quote: "We cut our invoicing time in half. Customers get payment links instantly and we get paid faster. Game changer.",
    author: "Tommy Nguyen",
    role: "Owner",
    company: "Nguyen Brothers Diesel",
    location: "Dallas, TX",
    rating: 5,
  },
  {
    quote: "The inventory tracking pays for itself. We haven't had a surprise stockout since we switched to ShopMule.",
    author: "Dave Kowalski",
    role: "Parts Manager",
    company: "Kowalski Heavy Equipment",
    location: "Chicago, IL",
    rating: 5,
  },
  {
    quote: "I can see exactly what every tech is working on from my phone. That visibility changed how I manage the floor.",
    author: "Linda Morales",
    role: "Shop Foreman",
    company: "Central Valley Truck Care",
    location: "Fresno, CA",
    rating: 5,
  },
  {
    quote: "Switched from pen and paper after 20 years. Wish I'd done it sooner. My guys actually like using this one.",
    author: "Earl Patterson",
    role: "Owner",
    company: "Patterson Truck & Trailer",
    location: "Memphis, TN",
    rating: 5,
  },
  {
    quote: "The work order flow is exactly how a real shop works. Diagnose, approve, work, done. No extra steps.",
    author: "Marcus Johnson",
    role: "Lead Mechanic",
    company: "Johnson Fleet Services",
    location: "Phoenix, AZ",
    rating: 4,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 380;
    el.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      // If we're at the end, scroll back to start
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 380, behavior: 'smooth' });
      }
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  return (
    <section className="py-24 bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
              Testimonials
            </span>
            <h2 className="mt-2 text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
              Trusted by shops.
            </h2>
            <p className="mt-3 text-neutral-500 max-w-lg">
              See what repair shop owners and managers are saying about ShopMule.
            </p>
          </motion.div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
          )}

          {/* Right fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />
          )}

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex-shrink-0 w-[340px] md:w-[360px] snap-start"
              >
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 h-full flex flex-col hover:border-neutral-300 hover:shadow-sm transition-all">
                  {/* Stars */}
                  <StarRating rating={testimonial.rating} />

                  {/* Quote */}
                  <p className="mt-4 text-neutral-700 leading-relaxed flex-1">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="mt-6 pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-neutral-500">
                          {testimonial.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">
                          {testimonial.author}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-2">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 pt-8 border-t border-neutral-200 grid grid-cols-3 gap-8 text-center"
        >
          <div>
            <div className="text-3xl font-bold text-neutral-900">500+</div>
            <div className="text-sm text-neutral-500 mt-1">Repair shops</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-neutral-900">4.9/5</div>
            <div className="text-sm text-neutral-500 mt-1">Average rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-neutral-900">98%</div>
            <div className="text-sm text-neutral-500 mt-1">Renewal rate</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
