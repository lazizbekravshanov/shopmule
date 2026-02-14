'use client';

import { motion } from 'framer-motion';
import {
  Truck,
  ShieldCheck,
  FileSearch,
  MapPinned,
  Gauge,
  Wrench,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

const truckingFeatures = [
  {
    icon: ShieldCheck,
    title: 'FMCSA Compliance',
    description: 'Verify carrier authority, MC numbers, and safety ratings directly from SAFER. Stay compliant without the research.',
    highlight: true,
  },
  {
    icon: FileSearch,
    title: 'DOT Inspection Ready',
    description: 'Structured checklists for DOT annual and periodic inspections. Generate inspection reports customers can hand to officers.',
  },
  {
    icon: MapPinned,
    title: 'Fleet Tracking',
    description: 'Manage vehicles across multiple customer fleets. Track service history by unit number, VIN, or license plate.',
  },
  {
    icon: Gauge,
    title: 'PM Scheduling',
    description: 'Preventive maintenance schedules based on mileage or time intervals. Never let a customer miss a service window.',
  },
  {
    icon: AlertTriangle,
    title: 'Recall Monitoring',
    description: 'Automatic NHTSA recall checks by VIN. Notify fleet managers when their units have open recalls.',
  },
  {
    icon: ClipboardList,
    title: 'Multi-Unit Work Orders',
    description: 'Handle fleet drop-offs with batch work orders. Process 10 trucks at once—same customer, separate jobs.',
  },
];

const vehicleTypes = [
  'Class 8 Trucks',
  'Trailers & Reefers',
  'Box Trucks',
  'Vocational Vehicles',
  'Buses & Coaches',
  'Emergency Vehicles',
];

export function BuiltForTrucking() {
  return (
    <section className="py-32 bg-neutral-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
            <Truck className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Purpose-Built</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
            Not another generic
            <br />
            <span className="text-neutral-500">shop tool.</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            ShopMule was built from day one for heavy truck and fleet service centers.
            FMCSA lookups, DOT checklists, and multi-unit fleet management are native—not bolted on.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {truckingFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`rounded-2xl p-7 border transition-all duration-500 ${
                feature.highlight
                  ? 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40'
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <div className={`w-11 h-11 flex items-center justify-center rounded-xl mb-5 ${
                feature.highlight
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-white/[0.06] text-neutral-300'
              }`}>
                <feature.icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Vehicle Types Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Wrench className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
              We service shops that work on
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {vehicleTypes.map((type) => (
              <span
                key={type}
                className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-full text-sm text-neutral-300 font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
