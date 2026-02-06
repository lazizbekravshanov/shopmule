'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Share2, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const categoryColors = {
  ai: 'bg-purple-100 text-purple-700',
  trucking: 'bg-blue-100 text-blue-700',
  logistics: 'bg-green-100 text-green-700',
  fmcsa: 'bg-red-100 text-red-700',
  industry: 'bg-amber-100 text-amber-700',
}

const categoryLabels = {
  ai: 'AI & Technology',
  trucking: 'Trucking',
  logistics: 'Logistics',
  fmcsa: 'FMCSA & Compliance',
  industry: 'Industry News',
}

// Sample blog post content
const blogPostsContent: Record<string, {
  title: string
  category: keyof typeof categoryColors
  date: string
  readTime: string
  author: string
  content: string
}> = {
  'ai-transforming-fleet-maintenance-2026': {
    title: 'How AI is Transforming Fleet Maintenance: 2026 Trends',
    category: 'ai',
    date: 'Feb 3, 2026',
    readTime: '5 min read',
    author: 'ShopMule Team',
    content: `
      <p class="lead">Artificial intelligence is no longer a futuristic concept in the trucking industry—it's here, and it's revolutionizing how fleets approach maintenance. From predictive analytics to computer vision inspections, AI tools are helping repair shops and fleet managers reduce downtime, cut costs, and keep trucks on the road longer.</p>

      <h2>Predictive Maintenance: Catching Problems Before They Happen</h2>
      <p>Traditional maintenance schedules are based on mileage or time intervals, but AI-powered predictive maintenance analyzes real-time data from sensors throughout the vehicle to identify potential failures before they occur.</p>
      <p>Modern trucks generate terabytes of data from their onboard systems. AI algorithms can process this data to detect patterns that indicate wear, stress, or impending failure in components like:</p>
      <ul>
        <li>Engine and transmission systems</li>
        <li>Brake components and air systems</li>
        <li>Electrical systems and batteries</li>
        <li>Cooling and HVAC systems</li>
        <li>Suspension and steering components</li>
      </ul>

      <h2>Computer Vision for Inspections</h2>
      <p>AI-powered cameras can now perform visual inspections that once required human eyes. Drive-through inspection systems can scan a truck in minutes and identify:</p>
      <ul>
        <li>Tire wear patterns and tread depth</li>
        <li>Brake pad thickness</li>
        <li>Fluid leaks</li>
        <li>Body damage and corrosion</li>
        <li>Light outages</li>
      </ul>
      <p>These systems don't get tired, don't miss details, and provide consistent, documented inspections every time.</p>

      <h2>AI Diagnostics in the Shop</h2>
      <p>When a truck does come in for repair, AI diagnostic tools help technicians identify problems faster. By analyzing fault codes, sensor data, and repair history, AI can suggest the most likely causes and recommend repair procedures.</p>
      <p>Some advanced systems even provide step-by-step repair guidance with augmented reality overlays, reducing the learning curve for less experienced technicians.</p>

      <h2>Parts Inventory Optimization</h2>
      <p>AI is also transforming how shops manage parts inventory. By analyzing repair patterns, seasonal trends, and fleet composition, AI systems can:</p>
      <ul>
        <li>Predict which parts will be needed</li>
        <li>Optimize reorder points</li>
        <li>Reduce dead stock</li>
        <li>Suggest vendor consolidation opportunities</li>
      </ul>

      <h2>What This Means for Repair Shops</h2>
      <p>For repair shops that embrace AI, the benefits are significant:</p>
      <ul>
        <li><strong>Higher throughput:</strong> Faster diagnostics mean more trucks serviced per day</li>
        <li><strong>Better customer relationships:</strong> Proactive maintenance recommendations build trust</li>
        <li><strong>Reduced comebacks:</strong> AI helps catch issues the first time</li>
        <li><strong>Competitive advantage:</strong> Shops with AI capabilities attract tech-forward fleets</li>
      </ul>

      <h2>Getting Started with AI in Your Shop</h2>
      <p>You don't need to overhaul your entire operation to benefit from AI. Start with shop management software that incorporates AI features like:</p>
      <ul>
        <li>Automated work order suggestions based on vehicle history</li>
        <li>Intelligent scheduling that optimizes technician assignments</li>
        <li>Parts ordering recommendations based on upcoming jobs</li>
        <li>Customer communication automation</li>
      </ul>
      <p>ShopMule includes AI-powered features designed specifically for truck repair shops, helping you work smarter without requiring a computer science degree.</p>

      <h2>The Bottom Line</h2>
      <p>AI in fleet maintenance isn't about replacing human expertise—it's about augmenting it. The shops that thrive in 2026 and beyond will be those that combine skilled technicians with intelligent tools that make their work more efficient and accurate.</p>
    `,
  },
  'fmcsa-drug-alcohol-clearinghouse-2026': {
    title: 'FMCSA Updates Drug & Alcohol Clearinghouse Rules for 2026',
    category: 'fmcsa',
    date: 'Feb 1, 2026',
    readTime: '4 min read',
    author: 'ShopMule Compliance Team',
    content: `
      <p class="lead">The Federal Motor Carrier Safety Administration has announced significant updates to the Drug & Alcohol Clearinghouse requirements that all carriers must understand and implement by Q3 2026.</p>

      <h2>What's Changing?</h2>
      <p>The FMCSA's latest rule updates expand the Clearinghouse requirements in several key areas:</p>

      <h3>1. Expanded Query Requirements</h3>
      <p>Carriers must now conduct Clearinghouse queries for a broader range of positions, including:</p>
      <ul>
        <li>Mechanics and technicians who may test-drive vehicles</li>
        <li>Yard drivers (hostlers)</li>
        <li>Temporary and seasonal CDL holders</li>
      </ul>

      <h3>2. Real-Time Reporting</h3>
      <p>Medical Review Officers (MROs) and Substance Abuse Professionals (SAPs) must now report violations within 24 hours, down from the previous 3-day window.</p>

      <h3>3. Annual Query Mandate</h3>
      <p>The annual query requirement is now strictly enforced with automated compliance tracking. Carriers who miss the annual query deadline face immediate penalties.</p>

      <h2>Compliance Checklist</h2>
      <p>To ensure your operation is ready for the Q3 2026 deadline:</p>
      <ul>
        <li>Audit your current Clearinghouse query processes</li>
        <li>Update your drug and alcohol policy documents</li>
        <li>Train designated employer representatives (DERs)</li>
        <li>Verify all CDL employees have registered in the Clearinghouse</li>
        <li>Set up automated reminders for annual queries</li>
        <li>Review contracts with third-party administrators</li>
      </ul>

      <h2>Penalties for Non-Compliance</h2>
      <p>The updated rules include stricter penalties:</p>
      <ul>
        <li>First violation: $1,500 - $5,000 per occurrence</li>
        <li>Pattern of violations: Up to $16,000 per day</li>
        <li>Willful violations: Potential loss of operating authority</li>
      </ul>

      <h2>How ShopMule Helps</h2>
      <p>While ShopMule is primarily a shop management platform, we understand that many repair shops also operate their own trucks or service fleet customers who need compliance support. Our customer management features help you:</p>
      <ul>
        <li>Track driver certifications and expiration dates</li>
        <li>Set automated reminders for compliance deadlines</li>
        <li>Maintain digital records of all compliance-related communications</li>
      </ul>

      <p>Stay compliant, stay on the road.</p>
    `,
  },
}

// Default content for posts without full content
const defaultContent = {
  author: 'ShopMule Team',
  content: `
    <p class="lead">This article is coming soon. We're working on bringing you comprehensive coverage of this important topic.</p>

    <h2>What to Expect</h2>
    <p>Our team is researching and writing in-depth content that will help you stay informed about the latest developments in the trucking and fleet maintenance industry.</p>

    <p>In the meantime, check out our other articles or subscribe to our newsletter to be notified when this content is published.</p>

    <h2>Stay Connected</h2>
    <p>Follow us for the latest updates on:</p>
    <ul>
      <li>AI and technology trends in trucking</li>
      <li>FMCSA regulations and compliance requirements</li>
      <li>Logistics and supply chain developments</li>
      <li>Best practices for repair shop management</li>
    </ul>
  `,
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string

  // Get post content or use defaults
  const post = blogPostsContent[slug] || {
    title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    category: 'industry' as const,
    date: 'Jan 2026',
    readTime: '5 min read',
    ...defaultContent,
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Articles
          </Link>
          <button className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[post.category]}`}>
                {categoryLabels[post.category]}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-neutral-500">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </header>

          {/* Featured Image Placeholder */}
          <div className="aspect-[2/1] bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-10" />

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-a:text-amber-600 prose-strong:text-neutral-900 prose-ul:text-neutral-700 prose-li:marker:text-amber-500"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA Box */}
          <div className="mt-12 bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Ready to modernize your shop?
            </h3>
            <p className="text-neutral-600 mb-4">
              ShopMule helps truck repair shops streamline operations, reduce paperwork, and increase revenue.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-900 font-semibold rounded-lg transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Tags */}
          <div className="mt-8 pt-8 border-t border-neutral-200">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-500">Topics:</span>
              <Link href={`/blog?category=${post.category}`} className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[post.category]}`}>
                {categoryLabels[post.category]}
              </Link>
            </div>
          </div>
        </motion.article>

        {/* Related Articles */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(blogPostsContent)
              .filter(([key]) => key !== slug)
              .slice(0, 2)
              .map(([key, relatedPost]) => (
                <Link key={key} href={`/blog/${key}`} className="group block">
                  <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 hover:border-amber-300 hover:shadow-lg transition-all">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${categoryColors[relatedPost.category]}`}>
                      {categoryLabels[relatedPost.category]}
                    </span>
                    <h3 className="font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">{relatedPost.date}</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>
    </div>
  )
}
