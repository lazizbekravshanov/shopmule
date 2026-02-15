import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Key,
  BookOpen,
  Terminal,
  Webhook,
  Shield,
  Gauge,
  FlaskConical,
  GitBranch,
  Activity,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Zap,
  FileJson,
  Lock,
  Server,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Developer Portal — ShopMule',
  description: 'ShopMule API documentation, SDKs, webhooks, and developer resources. Build integrations with the ShopMule platform.',
};

/* ─────────────────── Reusable Pieces ─────────────────── */

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-24" />;
}

function SectionHeading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">{children}</h2>
      {sub && <p className="mt-1 text-neutral-500 text-sm">{sub}</p>}
    </div>
  );
}

function CodeBlock({ lang, children, filename }: { lang: string; children: string; filename?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-950 overflow-hidden text-sm">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900">
          <span className="text-neutral-400 text-xs font-mono">{filename}</span>
          <span className="text-neutral-500 text-xs uppercase tracking-wider">{lang}</span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-neutral-100 font-mono text-[13px] leading-relaxed whitespace-pre">{children}</code>
      </pre>
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'green' | 'blue' | 'amber' }) {
  const styles = {
    default: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <a href={href} className="flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
      <Icon className="w-4 h-4 text-neutral-400" />
      {label}
    </a>
  );
}

/* ────────────────── Endpoint Row ────────────────── */

function Endpoint({ method, path, description }: { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; path: string; description: string }) {
  const methodStyles = {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-amber-100 text-amber-700',
    PATCH: 'bg-purple-100 text-purple-700',
    DELETE: 'bg-red-100 text-red-700',
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
      <span className={`inline-flex items-center justify-center w-16 px-2 py-0.5 rounded text-xs font-bold font-mono ${methodStyles[method]}`}>
        {method}
      </span>
      <div className="flex-1 min-w-0">
        <code className="text-sm font-mono text-neutral-900">{path}</code>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════ PAGE ═══════════════════════ */

export default function DevPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ───── Header ───── */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">SM</span>
              </div>
              <span className="font-bold text-lg text-neutral-900">ShopMule</span>
            </Link>
            <span className="text-neutral-300">|</span>
            <span className="text-sm font-semibold text-neutral-600">Developers</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm shadow-orange-500/20 transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              Get API Key
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">

          {/* ───── Sidebar Nav ───── */}
          <aside className="hidden lg:block py-10 sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <nav className="space-y-1">
              <NavItem href="#overview" icon={BookOpen} label="Overview" />
              <NavItem href="#quick-start" icon={Zap} label="Quick Start" />
              <NavItem href="#authentication" icon={Shield} label="Authentication" />
              <NavItem href="#api-reference" icon={Code2} label="API Reference" />
              <NavItem href="#sdks" icon={Terminal} label="SDKs & Libraries" />
              <NavItem href="#webhooks" icon={Webhook} label="Webhooks" />
              <NavItem href="#rate-limits" icon={Gauge} label="Rate Limits" />
              <NavItem href="#cli" icon={Terminal} label="CLI" />
              <NavItem href="#sandbox" icon={FlaskConical} label="Sandbox" />
              <NavItem href="#changelog" icon={Clock} label="Changelog" />
              <NavItem href="#status" icon={Activity} label="Status" />
              <NavItem href="#github" icon={GitBranch} label="GitHub" />
            </nav>
          </aside>

          {/* ───── Main Content ───── */}
          <main className="py-10 min-w-0">

            {/* ━━━ 1. HERO ━━━ */}
            <SectionAnchor id="overview" />
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="green">v2.0</Badge>
                <Badge>REST</Badge>
                <Badge>Node.js</Badge>
                <Badge>Python</Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.1]">
                ShopMule API
              </h1>
              <p className="mt-4 text-lg text-neutral-600 max-w-2xl leading-relaxed">
                Programmatic access to work orders, customers, invoices, inventory, and AI agents.
                Build integrations, automate workflows, and extend ShopMule with your own tools.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm shadow-orange-500/20 transition-all"
                >
                  <Key className="w-4 h-4" />
                  Get API Key
                </Link>
                <a
                  href="#api-reference"
                  className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:text-neutral-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  View Docs
                </a>
              </div>

              <div className="mt-8 p-4 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center gap-3 text-sm">
                <Server className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <span className="text-neutral-600">
                  Base URL: <code className="font-mono text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">https://api.shopmule.com/v2</code>
                </span>
              </div>
            </section>

            {/* ━━━ 2. QUICK START ━━━ */}
            <SectionAnchor id="quick-start" />
            <section className="mb-16">
              <SectionHeading sub="Get up and running in under 2 minutes.">Quick Start</SectionHeading>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">1</span>
                    Install the SDK
                  </h3>
                  <CodeBlock lang="bash" filename="terminal">
{`npm install @shopmule/sdk`}
                  </CodeBlock>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">2</span>
                    Initialize the client
                  </h3>
                  <CodeBlock lang="typescript" filename="index.ts">
{`import ShopMule from '@shopmule/sdk';

const client = new ShopMule({
  apiKey: process.env.SHOPMULE_API_KEY,
});`}
                  </CodeBlock>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">3</span>
                    Create a work order
                  </h3>
                  <CodeBlock lang="typescript" filename="create-work-order.ts">
{`const workOrder = await client.workOrders.create({
  customerId: 'cus_abc123',
  vehicleId: 'veh_xyz789',
  description: 'Oil change + tire rotation',
  priority: 'normal',
});

console.log(workOrder.id); // "wo_k8x2m4n1"`}
                  </CodeBlock>
                </div>
              </div>
            </section>

            {/* ━━━ 3. AUTHENTICATION ━━━ */}
            <SectionAnchor id="authentication" />
            <section className="mb-16">
              <SectionHeading sub="All requests require a valid API key.">Authentication</SectionHeading>

              <div className="space-y-6">
                <div className="rounded-xl border border-neutral-200 p-5">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-sm">Bearer Token</h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        Pass your API key in the <code className="font-mono text-xs bg-neutral-100 px-1.5 py-0.5 rounded">Authorization</code> header with every request.
                      </p>
                    </div>
                  </div>
                </div>

                <CodeBlock lang="bash" filename="cURL">
{`curl https://api.shopmule.com/v2/work-orders \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json"`}
                </CodeBlock>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-800">Keep your keys safe</p>
                    <p className="text-amber-700 mt-0.5">
                      Never expose API keys in client-side code or version control. Use environment variables and server-side calls only.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200">
                    <h3 className="text-sm font-semibold text-neutral-900">Key Types</h3>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    <div className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <code className="text-sm font-mono text-neutral-900">sk_live_*</code>
                        <p className="text-xs text-neutral-500 mt-0.5">Production — full access</p>
                      </div>
                      <Badge variant="green">Live</Badge>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <code className="text-sm font-mono text-neutral-900">sk_test_*</code>
                        <p className="text-xs text-neutral-500 mt-0.5">Sandbox — safe for development</p>
                      </div>
                      <Badge variant="amber">Test</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ━━━ 4. API REFERENCE ━━━ */}
            <SectionAnchor id="api-reference" />
            <section className="mb-16">
              <SectionHeading sub="Core resources and endpoints.">API Reference</SectionHeading>

              <div className="space-y-6">
                {/* Work Orders */}
                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-900">Work Orders</h3>
                  </div>
                  <div className="px-5 py-2">
                    <Endpoint method="GET" path="/v2/work-orders" description="List all work orders with pagination and filters" />
                    <Endpoint method="POST" path="/v2/work-orders" description="Create a new work order" />
                    <Endpoint method="GET" path="/v2/work-orders/:id" description="Retrieve a single work order" />
                    <Endpoint method="PATCH" path="/v2/work-orders/:id" description="Update a work order" />
                    <Endpoint method="POST" path="/v2/work-orders/:id/transition" description="Transition work order status" />
                    <Endpoint method="DELETE" path="/v2/work-orders/:id" description="Delete a work order" />
                  </div>
                </div>

                {/* Customers */}
                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-900">Customers</h3>
                  </div>
                  <div className="px-5 py-2">
                    <Endpoint method="GET" path="/v2/customers" description="List all customers" />
                    <Endpoint method="POST" path="/v2/customers" description="Create a customer" />
                    <Endpoint method="GET" path="/v2/customers/:id" description="Retrieve a customer with vehicles" />
                    <Endpoint method="PATCH" path="/v2/customers/:id" description="Update a customer" />
                    <Endpoint method="POST" path="/v2/customers/:id/vehicles" description="Add a vehicle to a customer" />
                  </div>
                </div>

                {/* Invoices */}
                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-900">Invoices</h3>
                  </div>
                  <div className="px-5 py-2">
                    <Endpoint method="GET" path="/v2/invoices" description="List all invoices" />
                    <Endpoint method="POST" path="/v2/invoices" description="Create an invoice from a work order" />
                    <Endpoint method="GET" path="/v2/invoices/:id" description="Retrieve an invoice" />
                    <Endpoint method="POST" path="/v2/invoices/:id/send" description="Send invoice to customer" />
                    <Endpoint method="POST" path="/v2/invoices/:id/payments" description="Record a payment" />
                  </div>
                </div>

                {/* Inventory */}
                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold text-neutral-900">Inventory &amp; Parts</h3>
                  </div>
                  <div className="px-5 py-2">
                    <Endpoint method="GET" path="/v2/parts" description="List parts with stock levels" />
                    <Endpoint method="POST" path="/v2/parts" description="Add a part to inventory" />
                    <Endpoint method="PATCH" path="/v2/parts/:id" description="Update part details or stock" />
                    <Endpoint method="GET" path="/v2/parts/:id/history" description="View stock movement history" />
                  </div>
                </div>

                {/* AI Agents */}
                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-semibold text-neutral-900">AI Agents</h3>
                    <Badge variant="blue">Beta</Badge>
                  </div>
                  <div className="px-5 py-2">
                    <Endpoint method="POST" path="/v2/ai/diagnose" description="Run AI diagnostic on a vehicle issue" />
                    <Endpoint method="POST" path="/v2/ai/estimate" description="Generate an AI repair estimate" />
                    <Endpoint method="POST" path="/v2/ai/summarize" description="Summarize work order history for a vehicle" />
                    <Endpoint method="GET" path="/v2/ai/jobs/:id" description="Check status of an async AI job" />
                  </div>
                </div>
              </div>
            </section>

            {/* ━━━ 5. SDKs ━━━ */}
            <SectionAnchor id="sdks" />
            <section className="mb-16">
              <SectionHeading sub="Official client libraries.">SDKs &amp; Libraries</SectionHeading>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm font-mono">JS</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-sm">Node.js / TypeScript</h3>
                      <p className="text-xs text-neutral-500">@shopmule/sdk</p>
                    </div>
                  </div>
                  <CodeBlock lang="bash" filename="terminal">{`npm install @shopmule/sdk`}</CodeBlock>
                </div>

                <div className="rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm font-mono">Py</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-sm">Python</h3>
                      <p className="text-xs text-neutral-500">shopmule</p>
                    </div>
                  </div>
                  <CodeBlock lang="bash" filename="terminal">{`pip install shopmule`}</CodeBlock>
                </div>

                <div className="rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm font-mono">API</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-sm">REST API</h3>
                      <p className="text-xs text-neutral-500">Any HTTP client</p>
                    </div>
                  </div>
                  <CodeBlock lang="bash" filename="terminal">{`curl https://api.shopmule.com/v2`}</CodeBlock>
                </div>
              </div>
            </section>

            {/* ━━━ 6. WEBHOOKS ━━━ */}
            <SectionAnchor id="webhooks" />
            <section className="mb-16">
              <SectionHeading sub="Receive real-time notifications when events occur.">Webhooks</SectionHeading>

              <div className="space-y-6">
                <div className="rounded-xl border border-neutral-200 p-5">
                  <h3 className="font-semibold text-neutral-900 text-sm mb-2">How it works</h3>
                  <ol className="space-y-2 text-sm text-neutral-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      Register a webhook URL in your dashboard under Settings &rarr; Webhooks.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      Select which events to subscribe to (e.g. <code className="font-mono text-xs bg-neutral-100 px-1 rounded">work_order.completed</code>).
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      ShopMule sends a signed <code className="font-mono text-xs bg-neutral-100 px-1 rounded">POST</code> request to your URL with the event payload.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                      Verify the signature using the webhook secret from your dashboard.
                    </li>
                  </ol>
                </div>

                <div className="rounded-xl border border-neutral-200 overflow-hidden">
                  <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200">
                    <h3 className="text-sm font-semibold text-neutral-900">Available Events</h3>
                  </div>
                  <div className="divide-y divide-neutral-100 text-sm">
                    {[
                      ['work_order.created', 'A new work order is created'],
                      ['work_order.status_changed', 'Work order transitions to a new status'],
                      ['work_order.completed', 'Work order marked as completed'],
                      ['invoice.created', 'An invoice is generated'],
                      ['invoice.paid', 'Payment recorded against an invoice'],
                      ['customer.created', 'A new customer is added'],
                      ['inventory.low_stock', 'Part stock drops below threshold'],
                      ['ai.job_completed', 'An async AI job finishes'],
                    ].map(([event, desc]) => (
                      <div key={event} className="px-5 py-3 flex items-center justify-between">
                        <code className="font-mono text-neutral-900">{event}</code>
                        <span className="text-neutral-500 text-xs">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <CodeBlock lang="typescript" filename="webhook-handler.ts">
{`import { ShopMule } from '@shopmule/sdk';

const client = new ShopMule({ apiKey: process.env.SHOPMULE_API_KEY });

// Verify and parse the incoming webhook
const event = client.webhooks.verify(
  req.body,
  req.headers['x-shopmule-signature'],
  process.env.WEBHOOK_SECRET
);

switch (event.type) {
  case 'work_order.completed':
    await notifyCustomer(event.data.customerId);
    break;
  case 'invoice.paid':
    await updateAccounting(event.data);
    break;
}`}
                </CodeBlock>
              </div>
            </section>

            {/* ━━━ 7. RATE LIMITS ━━━ */}
            <SectionAnchor id="rate-limits" />
            <section className="mb-16">
              <SectionHeading sub="Fair-use limits to ensure platform stability.">Rate Limits</SectionHeading>

              <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="text-left px-5 py-3 font-semibold text-neutral-900">Plan</th>
                      <th className="text-left px-5 py-3 font-semibold text-neutral-900">Rate</th>
                      <th className="text-left px-5 py-3 font-semibold text-neutral-900">Burst</th>
                      <th className="text-left px-5 py-3 font-semibold text-neutral-900">Daily Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr>
                      <td className="px-5 py-3 text-neutral-900 font-medium">Free</td>
                      <td className="px-5 py-3 text-neutral-600">60 req/min</td>
                      <td className="px-5 py-3 text-neutral-600">10 req/sec</td>
                      <td className="px-5 py-3 text-neutral-600">1,000</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 text-neutral-900 font-medium">Pro</td>
                      <td className="px-5 py-3 text-neutral-600">600 req/min</td>
                      <td className="px-5 py-3 text-neutral-600">50 req/sec</td>
                      <td className="px-5 py-3 text-neutral-600">50,000</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-3 text-neutral-900 font-medium">Enterprise</td>
                      <td className="px-5 py-3 text-neutral-600">Custom</td>
                      <td className="px-5 py-3 text-neutral-600">Custom</td>
                      <td className="px-5 py-3 text-neutral-600">Unlimited</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-xl border border-neutral-200 p-4 text-sm">
                <h3 className="font-semibold text-neutral-900 mb-2">Response Headers</h3>
                <div className="font-mono text-xs space-y-1 text-neutral-600">
                  <p><span className="text-neutral-900">X-RateLimit-Limit:</span> 600</p>
                  <p><span className="text-neutral-900">X-RateLimit-Remaining:</span> 594</p>
                  <p><span className="text-neutral-900">X-RateLimit-Reset:</span> 1708020000</p>
                </div>
                <p className="text-neutral-500 mt-2">
                  When rate-limited, the API returns <code className="bg-neutral-100 px-1.5 py-0.5 rounded">429 Too Many Requests</code> with a <code className="bg-neutral-100 px-1.5 py-0.5 rounded">Retry-After</code> header.
                </p>
              </div>
            </section>

            {/* ━━━ 8. CLI ━━━ */}
            <SectionAnchor id="cli" />
            <section className="mb-16">
              <SectionHeading sub="Manage resources from your terminal.">CLI</SectionHeading>

              <div className="space-y-4">
                <CodeBlock lang="bash" filename="terminal">
{`# Install globally
npm install -g @shopmule/cli

# Authenticate
shopmule login

# List recent work orders
shopmule work-orders list --limit 10

# Create a work order
shopmule work-orders create \\
  --customer cus_abc123 \\
  --vehicle veh_xyz789 \\
  --description "Brake pad replacement"

# Stream webhook events locally
shopmule webhooks listen --port 3001

# Tail logs
shopmule logs tail --resource work-orders`}
                </CodeBlock>
              </div>
            </section>

            {/* ━━━ 9. SANDBOX ━━━ */}
            <SectionAnchor id="sandbox" />
            <section className="mb-16">
              <SectionHeading sub="Test your integration without affecting production data.">Sandbox</SectionHeading>

              <div className="space-y-6">
                <div className="rounded-xl border border-neutral-200 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <FlaskConical className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <h3 className="font-semibold text-neutral-900">Isolated test environment</h3>
                      <p className="text-neutral-600 mt-1">
                        Use <code className="font-mono text-xs bg-neutral-100 px-1.5 py-0.5 rounded">sk_test_*</code> keys to interact with the sandbox. All data is ephemeral and resets daily at midnight UTC.
                      </p>
                    </div>
                  </div>
                </div>

                <CodeBlock lang="bash" filename=".env.local">
{`# Development
SHOPMULE_API_KEY=sk_test_your_sandbox_key
SHOPMULE_WEBHOOK_SECRET=whsec_test_your_secret

# Production
# SHOPMULE_API_KEY=sk_live_your_production_key
# SHOPMULE_WEBHOOK_SECRET=whsec_live_your_secret`}
                </CodeBlock>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-neutral-200 p-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                    <h3 className="font-semibold text-neutral-900 text-sm">Seeded Data</h3>
                    <p className="text-xs text-neutral-500 mt-1">Sandbox comes pre-loaded with sample customers, vehicles, and work orders.</p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 p-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                    <h3 className="font-semibold text-neutral-900 text-sm">Webhook Testing</h3>
                    <p className="text-xs text-neutral-500 mt-1">Trigger test events from the dashboard or via <code className="font-mono text-xs">shopmule webhooks trigger</code>.</p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 p-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                    <h3 className="font-semibold text-neutral-900 text-sm">No Billing</h3>
                    <p className="text-xs text-neutral-500 mt-1">Sandbox requests are free and do not count toward your plan limits.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ━━━ 10. CHANGELOG ━━━ */}
            <SectionAnchor id="changelog" />
            <section className="mb-16">
              <SectionHeading sub="Latest updates to the ShopMule API.">Changelog</SectionHeading>

              <div className="space-y-0 border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
                {[
                  { date: 'Feb 12, 2026', version: 'v2.4.0', type: 'feature' as const, title: 'AI Diagnostic Agent API', description: 'New /v2/ai/diagnose endpoint for automated vehicle diagnostics.' },
                  { date: 'Feb 3, 2026', version: 'v2.3.1', type: 'fix' as const, title: 'Webhook retry logic', description: 'Fixed exponential backoff timing for failed webhook deliveries.' },
                  { date: 'Jan 20, 2026', version: 'v2.3.0', type: 'feature' as const, title: 'Inventory low-stock webhooks', description: 'New inventory.low_stock event fires when parts drop below threshold.' },
                  { date: 'Jan 8, 2026', version: 'v2.2.0', type: 'improvement' as const, title: 'Cursor-based pagination', description: 'All list endpoints now support cursor-based pagination for better performance.' },
                  { date: 'Dec 15, 2025', version: 'v2.1.0', type: 'feature' as const, title: 'Python SDK GA', description: 'Official Python SDK is now generally available.' },
                ].map((entry) => {
                  const typeStyles = {
                    feature: 'bg-green-100 text-green-700',
                    fix: 'bg-red-100 text-red-700',
                    improvement: 'bg-blue-100 text-blue-700',
                  };
                  return (
                    <div key={entry.version} className="px-5 py-4 flex items-start gap-4">
                      <div className="flex-shrink-0 w-28">
                        <p className="text-xs text-neutral-500">{entry.date}</p>
                        <p className="text-xs font-mono text-neutral-400 mt-0.5">{entry.version}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeStyles[entry.type]}`}>
                            {entry.type}
                          </span>
                          <h3 className="font-medium text-neutral-900 text-sm">{entry.title}</h3>
                        </div>
                        <p className="text-xs text-neutral-500">{entry.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ━━━ 11. STATUS & GITHUB ━━━ */}
            <SectionAnchor id="status" />
            <SectionAnchor id="github" />
            <section className="mb-16">
              <SectionHeading>Resources</SectionHeading>

              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="https://status.shopmule.com"
                  className="group rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-colors flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm flex items-center gap-1.5">
                      Status Page
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Real-time uptime monitoring, incident history, and scheduled maintenance.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs font-medium text-green-600">All systems operational</span>
                    </div>
                  </div>
                </a>

                <a
                  href="https://github.com/shopmule"
                  className="group rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-colors flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <GitBranch className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm flex items-center gap-1.5">
                      GitHub
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Open-source SDKs, example projects, and community contributions.
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-neutral-500">@shopmule/sdk</span>
                      <span className="text-xs text-neutral-500">@shopmule/cli</span>
                    </div>
                  </div>
                </a>
              </div>
            </section>

            {/* ───── Footer ───── */}
            <footer className="border-t border-neutral-200 pt-8 pb-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-neutral-400">
                  &copy; {new Date().getFullYear()} ShopMule, Inc. All rights reserved.
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <Link href="/terms" className="text-neutral-500 hover:text-neutral-700 transition-colors">Terms</Link>
                  <Link href="/privacy" className="text-neutral-500 hover:text-neutral-700 transition-colors">Privacy</Link>
                  <a href="mailto:developers@shopmule.com" className="text-neutral-500 hover:text-neutral-700 transition-colors">developers@shopmule.com</a>
                </div>
              </div>
            </footer>

          </main>
        </div>
      </div>
    </div>
  );
}
