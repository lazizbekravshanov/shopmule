'use client';

import { motion } from 'framer-motion';
import {
  Fingerprint,
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  Shield,
} from 'lucide-react';

const mobileFeatures = [
  {
    icon: Fingerprint,
    title: 'PIN & Biometric Clock-In',
    description: 'Techs punch in with a secure PIN or device biometrics. No buddy punching.',
  },
  {
    icon: MapPin,
    title: 'GPS Geofencing',
    description: 'Auto-verify location on every punch. Configurable radius per shop.',
  },
  {
    icon: Camera,
    title: 'Photo Verification',
    description: 'Optional photo capture on clock-in for audit-proof attendance records.',
  },
  {
    icon: WifiOff,
    title: 'Offline Mode',
    description: 'Works without signal. Punches sync automatically when connectivity returns.',
  },
];

const punchSteps = [
  { time: '6:58 AM', action: 'Arriving at shop', icon: MapPin, status: 'done' },
  { time: '7:00 AM', action: 'Clocked in via PIN', icon: Fingerprint, status: 'done' },
  { time: '7:02 AM', action: 'Assigned to WO-1024', icon: Clock, status: 'done' },
  { time: '12:00 PM', action: 'Break started', icon: Clock, status: 'active' },
];

export function MobileShowcase() {
  return (
    <section className="py-32 bg-neutral-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
              Mobile-First
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight mb-6">
              Your shop in
              <br />
              <span className="text-neutral-400">your pocket.</span>
            </h2>
            <p className="text-lg text-neutral-500 leading-relaxed mb-10 max-w-lg">
              Techs clock in from the field. Managers approve punches from anywhere.
              Every action is GPS-verified, timestamped, and audit-ready.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              {mobileFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white text-neutral-700 shadow-sm">
                    <feature.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">{feature.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-[300px] bg-neutral-900 rounded-[3rem] p-3 shadow-2xl shadow-neutral-900/20">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-neutral-900 rounded-b-2xl z-10" />

                {/* Screen */}
                <div className="bg-white rounded-[2.25rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-8 pt-4 pb-2">
                    <span className="text-xs font-semibold text-neutral-900">7:00 AM</span>
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-neutral-900" />
                      <div className="w-6 h-3 border border-neutral-900 rounded-sm relative">
                        <div className="absolute inset-0.5 bg-green-500 rounded-[1px]" style={{ width: '75%' }} />
                      </div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="px-6 pt-4 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">SM</span>
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">ShopMule</span>
                    </div>
                  </div>

                  {/* Clock-In Card */}
                  <div className="px-5 pb-3">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-900">Clocked In</p>
                          <p className="text-xs text-green-700">Mike&apos;s Truck Repair</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-700">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Within geofence (12m)</span>
                        <Shield className="w-3.5 h-3.5 ml-auto" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="px-5 pb-6">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Today</p>
                    <div className="space-y-0">
                      {punchSteps.map((step, index) => (
                        <div key={index} className="flex gap-3 relative">
                          {/* Timeline Line */}
                          {index < punchSteps.length - 1 && (
                            <div className="absolute left-[15px] top-8 w-0.5 h-full bg-neutral-200" />
                          )}
                          {/* Icon */}
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center z-10 ${
                            step.status === 'active'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            <step.icon className="w-4 h-4" />
                          </div>
                          {/* Content */}
                          <div className="pb-4">
                            <p className="text-sm font-medium text-neutral-900">{step.action}</p>
                            <p className="text-xs text-neutral-400">{step.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Nav */}
                  <div className="border-t border-neutral-100 px-6 py-3 flex items-center justify-around">
                    <div className="flex flex-col items-center gap-0.5">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className="text-[10px] font-medium text-orange-500">Time</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Camera className="w-5 h-5 text-neutral-400" />
                      <span className="text-[10px] text-neutral-400">Photo</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <MapPin className="w-5 h-5 text-neutral-400" />
                      <span className="text-[10px] text-neutral-400">Map</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute -inset-8 bg-orange-200/30 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
