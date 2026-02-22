'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Search,
  Tag,
  Brain,
  Cpu,
  Truck,
  Package,
  FileCheck,
  Shield,
  Newspaper,
  TrendingUp,
  Zap,
  Bot,
  Scale,
  Fuel,
  BarChart3,
  Wrench
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: 'ai' | 'trucking' | 'logistics' | 'fmcsa' | 'industry'
  date: string
  readTime: string
  slug: string
  icon?: string
}

const categoryColors = {
  ai: 'bg-purple-100 text-purple-700',
  trucking: 'bg-blue-100 text-blue-700',
  logistics: 'bg-green-100 text-green-700',
  fmcsa: 'bg-red-100 text-red-700',
  industry: 'bg-amber-100 text-amber-700',
}

const categoryGradients = {
  ai: 'from-purple-500 to-indigo-600',
  trucking: 'from-blue-500 to-cyan-500',
  logistics: 'from-green-500 to-emerald-500',
  fmcsa: 'from-red-500 to-rose-500',
  industry: 'from-amber-500 to-orange-500',
}

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  cpu: Cpu,
  truck: Truck,
  package: Package,
  filecheck: FileCheck,
  shield: Shield,
  newspaper: Newspaper,
  trending: TrendingUp,
  zap: Zap,
  bot: Bot,
  scale: Scale,
  fuel: Fuel,
  chart: BarChart3,
  wrench: Wrench,
}

const categoryDefaultIcons: Record<string, string> = {
  ai: 'brain',
  trucking: 'truck',
  logistics: 'package',
  fmcsa: 'shield',
  industry: 'newspaper',
}

const categoryLabels = {
  ai: 'AI & Technology',
  trucking: 'Trucking',
  logistics: 'Logistics',
  fmcsa: 'FMCSA & Compliance',
  industry: 'Industry News',
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How AI is Transforming Fleet Maintenance: 2026 Trends',
    excerpt:
      'Artificial intelligence is revolutionizing how trucking companies predict breakdowns, optimize maintenance schedules, and reduce downtime. Here\'s what you need to know about predictive maintenance, computer vision inspections, and AI-powered diagnostics.',
    category: 'ai',
    date: 'Feb 3, 2026',
    readTime: '5 min read',
    slug: 'ai-transforming-fleet-maintenance-2026',
    icon: 'brain',
  },
  {
    id: '2',
    title: 'FMCSA Updates Drug & Alcohol Clearinghouse Rules for 2026',
    excerpt:
      'The Federal Motor Carrier Safety Administration has announced significant updates to the Drug & Alcohol Clearinghouse requirements. Carriers must comply by Q3 2026 or face penalties.',
    category: 'fmcsa',
    date: 'Feb 1, 2026',
    readTime: '4 min read',
    slug: 'fmcsa-drug-alcohol-clearinghouse-2026',
    icon: 'filecheck',
  },
  {
    id: '3',
    title: 'Diesel Prices Ease as 2026 Outlook Improves',
    excerpt:
      'The EIA reports diesel at $3.71/gal and forecasts a $3.50 average for 2026. Here\'s what\'s driving the decline, how much fleets are actually saving, and what could disrupt the outlook.',
    category: 'trucking',
    date: 'Jan 29, 2026',
    readTime: '3 min read',
    slug: 'diesel-prices-drop-2026',
    icon: 'fuel',
  },
  {
    id: '4',
    title: 'Last-Mile Logistics: Electric Trucks Coming to Repair Shops',
    excerpt:
      'As electric delivery vehicles become mainstream, repair shops need to prepare for new maintenance challenges. We break down what\'s changing and how to train your technicians.',
    category: 'logistics',
    date: 'Jan 25, 2026',
    readTime: '6 min read',
    slug: 'electric-trucks-repair-shops',
    icon: 'zap',
  },
  {
    id: '5',
    title: 'New ELD Mandate Changes: What Owner-Operators Need to Know',
    excerpt:
      'FMCSA is tightening ELD requirements for small carriers. Here\'s a compliance checklist to avoid fines and keep your authority in good standing.',
    category: 'fmcsa',
    date: 'Jan 22, 2026',
    readTime: '4 min read',
    slug: 'eld-mandate-changes-owner-operators',
    icon: 'shield',
  },
  {
    id: '6',
    title: 'ChatGPT for Trucking: 10 Ways AI Assistants Help Fleet Managers',
    excerpt:
      'From writing repair estimates to analyzing driver logs, AI assistants are becoming essential tools for modern fleet operations. Here are practical use cases you can implement today.',
    category: 'ai',
    date: 'Jan 18, 2026',
    readTime: '7 min read',
    slug: 'chatgpt-trucking-fleet-managers',
    icon: 'bot',
  },
  {
    id: '7',
    title: 'Broker-Carrier Fraud on the Rise: How to Protect Your Business',
    excerpt:
      'Double-brokering and identity theft are costing carriers millions. Learn how to verify brokers, protect your loads, and what to do if you become a victim.',
    category: 'industry',
    date: 'Jan 15, 2026',
    readTime: '5 min read',
    slug: 'broker-carrier-fraud-protection',
    icon: 'scale',
  },
  {
    id: '8',
    title: 'Hours of Service Updates: Split Sleeper Berth Pilot Program',
    excerpt:
      'FMCSA is running a pilot program testing 6/4 and 5/5 split sleeper configurations with 256 drivers. Here\'s what\'s actually being tested and what hasn\'t changed.',
    category: 'fmcsa',
    date: 'Jan 12, 2026',
    readTime: '4 min read',
    slug: 'hours-of-service-split-sleeper',
    icon: 'filecheck',
  },
  {
    id: '9',
    title: 'Autonomous Trucks: What Repair Shops Should Expect by 2030',
    excerpt:
      'Self-driving trucks are coming faster than expected. We analyze how autonomous technology will change maintenance requirements and what services will still need human technicians.',
    category: 'ai',
    date: 'Jan 8, 2026',
    readTime: '8 min read',
    slug: 'autonomous-trucks-repair-shops-2030',
    icon: 'cpu',
  },
  {
    id: '10',
    title: 'Freight Recession Recovery: Market Outlook for Q1 2026',
    excerpt:
      'After a challenging 2025, freight rates are showing signs of recovery. Industry analysts share their predictions for spot rates, contract negotiations, and capacity.',
    category: 'logistics',
    date: 'Jan 5, 2026',
    readTime: '6 min read',
    slug: 'freight-recession-recovery-q1-2026',
    icon: 'chart',
  },
  {
    id: '11',
    title: 'CSA Scores Explained: How SMS Impacts Your Insurance Rates',
    excerpt:
      'Understanding your CSA scores is critical for keeping insurance costs down. We break down each BASIC category and share tips for improving your safety profile.',
    category: 'fmcsa',
    date: 'Jan 2, 2026',
    readTime: '5 min read',
    slug: 'csa-scores-insurance-rates',
    icon: 'trending',
  },
  {
    id: '12',
    title: 'Shop Management Software Comparison: 2026 Buyer\'s Guide',
    excerpt:
      'Choosing the right shop management software can save hours every week. We compare features, pricing, and user reviews of the top platforms for truck repair shops.',
    category: 'industry',
    date: 'Dec 28, 2025',
    readTime: '10 min read',
    slug: 'shop-management-software-comparison-2026',
    icon: 'wrench',
  },
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = !selectedCategory || post.category === selectedCategory
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            ShopMule Blog
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Industry insights on AI, trucking regulations, logistics trends, and FMCSA compliance
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-neutral-500 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Filter:
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              All
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key === selectedCategory ? null : key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-neutral-900 text-white'
                    : `${categoryColors[key as keyof typeof categoryColors]} hover:opacity-80`
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => {
            const iconKey = post.icon || categoryDefaultIcons[post.category] || 'newspaper'
            const IconComponent = iconComponents[iconKey] || Newspaper

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="h-full bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-orange-300 hover:shadow-lg transition-all">
                    {/* Image with animated icon */}
                    <div className={`aspect-[16/9] bg-gradient-to-br ${categoryGradients[post.category]} relative overflow-hidden`}>
                      {/* Animated icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          animate={{
                            y: [0, -8, 0],
                          }}
                          transition={{
                            y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 },
                            scale: { duration: 0.2 },
                            rotate: { duration: 0.2 }
                          }}
                          className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors"
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-neutral-700">
                          {categoryLabels[post.category]}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-3 text-sm text-neutral-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      <p className="text-neutral-600 text-sm line-clamp-3">{post.excerpt}</p>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )
          })}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500">No articles found matching your criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory(null)
                setSearchQuery('')
              }}
              className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 bg-neutral-900 rounded-2xl p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Stay updated on industry news
          </h2>
          <p className="text-neutral-400 mb-6 max-w-xl mx-auto">
            Get weekly insights on AI, trucking regulations, and shop management tips delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-neutral-900 font-semibold rounded-lg transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-neutral-500 mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
