'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  Clock,
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
  Bot
} from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: 'ai' | 'trucking' | 'logistics' | 'fmcsa' | 'industry'
  date: string
  readTime: string
  image: string
  slug: string
  featured?: boolean
  icon?: 'brain' | 'cpu' | 'truck' | 'package' | 'filecheck' | 'shield' | 'newspaper' | 'trending' | 'zap' | 'bot'
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

const iconComponents = {
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
}

const categoryDefaultIcons = {
  ai: 'brain',
  trucking: 'truck',
  logistics: 'package',
  fmcsa: 'shield',
  industry: 'newspaper',
}

function AnimatedIcon({ icon, category }: { icon?: string; category: string }) {
  const iconKey = (icon || categoryDefaultIcons[category as keyof typeof categoryDefaultIcons] || 'newspaper') as keyof typeof iconComponents
  const IconComponent = iconComponents[iconKey]

  return (
    <motion.div
      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryGradients[category as keyof typeof categoryGradients]} flex items-center justify-center shadow-lg`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.2 },
        rotate: { duration: 0.2 }
      }}
    >
      <IconComponent className="w-6 h-6 text-white" />
    </motion.div>
  )
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
      'Artificial intelligence is revolutionizing how trucking companies predict breakdowns, optimize maintenance schedules, and reduce downtime. Here\'s what you need to know.',
    category: 'ai',
    date: 'Feb 3, 2026',
    readTime: '5 min read',
    image: '/blog/ai-fleet.jpg',
    slug: 'ai-transforming-fleet-maintenance-2026',
    featured: true,
    icon: 'brain',
  },
  {
    id: '2',
    title: 'FMCSA Updates Drug & Alcohol Clearinghouse Rules for 2026',
    excerpt:
      'The Federal Motor Carrier Safety Administration has announced significant updates to the Drug & Alcohol Clearinghouse requirements. Carriers must comply by Q3 2026.',
    category: 'fmcsa',
    date: 'Feb 1, 2026',
    readTime: '4 min read',
    image: '/blog/fmcsa-update.jpg',
    slug: 'fmcsa-drug-alcohol-clearinghouse-2026',
    icon: 'filecheck',
  },
  {
    id: '3',
    title: 'Diesel Prices Drop 12% as Supply Chain Normalizes',
    excerpt:
      'After years of volatility, diesel prices are finally stabilizing. What this means for your operating costs and how to lock in savings for your fleet.',
    category: 'trucking',
    date: 'Jan 29, 2026',
    readTime: '3 min read',
    image: '/blog/diesel-prices.jpg',
    slug: 'diesel-prices-drop-2026',
    icon: 'trending',
  },
  {
    id: '4',
    title: 'Last-Mile Logistics: Electric Trucks Coming to Repair Shops',
    excerpt:
      'As electric delivery vehicles become mainstream, repair shops need to prepare for new maintenance challenges. We break down what\'s changing.',
    category: 'logistics',
    date: 'Jan 25, 2026',
    readTime: '6 min read',
    image: '/blog/ev-trucks.jpg',
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
    image: '/blog/eld-mandate.jpg',
    slug: 'eld-mandate-changes-owner-operators',
    icon: 'shield',
  },
  {
    id: '6',
    title: 'ChatGPT for Trucking: 10 Ways AI Assistants Help Fleet Managers',
    excerpt:
      'From writing repair estimates to analyzing driver logs, AI assistants are becoming essential tools for modern fleet operations. Here are practical use cases.',
    category: 'ai',
    date: 'Jan 18, 2026',
    readTime: '7 min read',
    image: '/blog/ai-assistant.jpg',
    slug: 'chatgpt-trucking-fleet-managers',
    icon: 'bot',
  },
]

export function BlogPreview() {
  const featuredPost = blogPosts.find((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured).slice(0, 4)

  return (
    <section id="blog" className="py-20 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
              <Tag className="w-3 h-3" />
              Industry Insights
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
              Latest from our blog
            </h2>
            <p className="text-neutral-600 max-w-xl">
              Stay updated on AI, trucking regulations, logistics trends, and FMCSA compliance news
            </p>
          </div>
          <Link
            href="/blog"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
          >
            View all articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Post */}
          {featuredPost && (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:row-span-2"
            >
              <Link href={`/blog/${featuredPost.slug}`} className="group block h-full">
                <div className="relative h-full bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-300 hover:shadow-xl transition-all">
                  {/* Image placeholder with animated icon */}
                  <div className={`aspect-[16/10] bg-gradient-to-br ${categoryGradients[featuredPost.category]} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    {/* Floating animated icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      >
                        {(() => {
                          const iconKey = (featuredPost.icon || categoryDefaultIcons[featuredPost.category]) as keyof typeof iconComponents
                          const IconComponent = iconComponents[iconKey]
                          return <IconComponent className="w-12 h-12 text-white" />
                        })()}
                      </motion.div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/90 ${categoryColors[featuredPost.category].replace('bg-purple-100', '').replace('bg-blue-100', '').replace('bg-green-100', '').replace('bg-red-100', '').replace('bg-amber-100', '')}`}>
                        {categoryLabels[featuredPost.category]}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-neutral-700">
                      Featured
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3 group-hover:text-amber-600 transition-colors">
                      {featuredPost.title}
                    </h3>

                    <p className="text-neutral-600 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 text-amber-600 font-medium">
                      Read more
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          )}

          {/* Regular Posts Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {regularPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="h-full bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-amber-300 hover:shadow-lg transition-all">
                    {/* Image placeholder with animated icon */}
                    <div className={`aspect-[16/9] bg-gradient-to-br ${categoryGradients[post.category]} relative overflow-hidden`}>
                      {/* Floating animated icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                          animate={{
                            y: [0, -6, 0],
                          }}
                          transition={{
                            y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 },
                            scale: { duration: 0.2 }
                          }}
                          className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                        >
                          {(() => {
                            const iconKey = (post.icon || categoryDefaultIcons[post.category]) as keyof typeof iconComponents
                            const IconComponent = iconComponents[iconKey]
                            return <IconComponent className="w-7 h-7 text-white" />
                          })()}
                        </motion.div>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 text-neutral-700">
                          {categoryLabels[post.category]}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                        <span>{post.date}</span>
                        <span>·</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 className="font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Category Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="text-sm text-neutral-500">Browse by topic:</span>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Link
              key={key}
              href={`/blog?category=${key}`}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-opacity hover:opacity-80 ${
                categoryColors[key as keyof typeof categoryColors]
              }`}
            >
              {label}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
