'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug,
  Check,
  ExternalLink,
  Settings,
  Zap,
  CreditCard,
  MessageSquare,
  Calendar,
  FileText,
  Car,
  BarChart3,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'payments' | 'communication' | 'scheduling' | 'accounting' | 'parts' | 'analytics';
  alwaysConnected?: boolean;
  popular?: boolean;
  configFields?: { key: string; label: string; placeholder: string; type?: string }[];
  docsUrl?: string;
  comingSoon?: boolean;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept credit card payments and manage subscriptions',
    icon: CreditCard,
    category: 'payments',
    alwaysConnected: true,
    popular: true,
    docsUrl: 'https://dashboard.stripe.com',
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Point of sale and payment processing',
    icon: CreditCard,
    category: 'payments',
    configFields: [{ key: 'apiKey', label: 'Square API Key', placeholder: 'sq0atp-...' }],
    comingSoon: true,
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and customer messaging',
    icon: MessageSquare,
    category: 'communication',
    popular: true,
    configFields: [
      { key: 'accountSid', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
      { key: 'authToken', label: 'Auth Token', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'fromNumber', label: 'From Number', placeholder: '+15551234567' },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing campaigns',
    icon: MessageSquare,
    category: 'communication',
    configFields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'fromEmail', label: 'From Email', placeholder: 'noreply@yourshop.com' },
    ],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync appointments with Google Calendar',
    icon: Calendar,
    category: 'scheduling',
    comingSoon: true,
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial management',
    icon: FileText,
    category: 'accounting',
    popular: true,
    comingSoon: true,
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud-based accounting software',
    icon: FileText,
    category: 'accounting',
    comingSoon: true,
  },
  {
    id: 'carfax',
    name: 'CARFAX',
    description: 'Vehicle history reports and service records',
    icon: Car,
    category: 'parts',
    configFields: [
      { key: 'partnerId', label: 'Partner ID', placeholder: 'Your CARFAX partner ID' },
      { key: 'apiKey', label: 'API Key', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
  {
    id: 'worldpac',
    name: 'WorldPac',
    description: 'Auto parts ordering and catalog',
    icon: Car,
    category: 'parts',
    configFields: [
      { key: 'accountNumber', label: 'Account Number', placeholder: 'WP-0000000' },
      { key: 'apiKey', label: 'API Key', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website and conversion tracking',
    icon: BarChart3,
    category: 'analytics',
    configFields: [
      { key: 'measurementId', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX' },
    ],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'payments', label: 'Payments' },
  { id: 'communication', label: 'Communication' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'parts', label: 'Parts & Vehicles' },
  { id: 'analytics', label: 'Analytics' },
];

const STORAGE_KEY = 'shopmule-integrations';

function loadConnected(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}

function saveConnected(state: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<{ integration: Integration; mode: 'connect' | 'configure' | 'disconnect' } | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = loadConnected();
    // Stripe is always connected (it's actually wired)
    setConnected({ ...saved, stripe: true });
  }, []);

  const isConnected = (id: string) => {
    const integration = INTEGRATIONS.find((i) => i.id === id);
    return integration?.alwaysConnected || connected[id] === true;
  };

  const handleConnect = async (integration: Integration) => {
    if (integration.comingSoon) {
      toast({ title: `${integration.name} coming soon`, description: 'This integration is in development. We\'ll notify you when it\'s ready.' });
      return;
    }
    if (!integration.configFields?.length) {
      // No fields needed — connect immediately
      setSaving(true);
      await new Promise((r) => setTimeout(r, 600));
      const updated = { ...connected, [integration.id]: true };
      setConnected(updated); saveConnected(updated);
      setSaving(false);
      toast({ title: `${integration.name} connected` });
      setModal(null);
      return;
    }
    setFieldValues({});
    setModal({ integration, mode: 'connect' });
  };

  const handleConfigure = (integration: Integration) => {
    setFieldValues({});
    setModal({ integration, mode: 'configure' });
  };

  const handleDisconnect = (integration: Integration) => {
    setModal({ integration, mode: 'disconnect' });
  };

  const handleSave = async () => {
    if (!modal) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate API call
    const updated = { ...connected, [modal.integration.id]: true };
    setConnected(updated); saveConnected(updated);
    setSaving(false);
    toast({ title: `${modal.integration.name} ${modal.mode === 'connect' ? 'connected' : 'updated'}`, description: 'Settings saved successfully.' });
    setModal(null);
  };

  const confirmDisconnect = async () => {
    if (!modal) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated = { ...connected, [modal.integration.id]: false };
    setConnected(updated); saveConnected(updated);
    setSaving(false);
    toast({ title: `${modal.integration.name} disconnected` });
    setModal(null);
  };

  const filtered = INTEGRATIONS.filter(
    (i) => selectedCategory === 'all' || i.category === selectedCategory
  );

  const connectedCount = INTEGRATIONS.filter((i) => isConnected(i.id)).length;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">Integrations</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Connect your favorite tools and services</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-100 dark:bg-green-900/30">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-green-700 dark:text-green-400">{connectedCount}</p>
            <p className="text-xs text-green-600 dark:text-green-500">Connected</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-neutral-400 dark:bg-neutral-600 flex items-center justify-center">
            <Plug className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">{INTEGRATIONS.length - connectedCount}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Available</p>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((integration, index) => {
          const Icon = integration.icon;
          const active = isConnected(integration.id);
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.04 }}
              className={cn(
                'relative bg-white dark:bg-neutral-800 rounded-2xl border p-6 transition-all hover:shadow-lg',
                active ? 'border-green-200 dark:border-green-800' : 'border-neutral-200 dark:border-neutral-700'
              )}
            >
              {integration.popular && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
                  Popular
                </div>
              )}
              {integration.comingSoon && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 text-xs font-medium">
                  Soon
                </div>
              )}

              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-neutral-100 dark:bg-neutral-700'
              )}>
                <Icon className={cn('w-7 h-7', active ? 'text-green-600 dark:text-green-400' : 'text-neutral-500 dark:text-neutral-400')} />
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{integration.name}</h3>
                  {active && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{integration.description}</p>
              </div>

              <div className="flex gap-2">
                {active ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl border-neutral-200 dark:border-neutral-700"
                      onClick={() => handleConfigure(integration)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    {!integration.alwaysConnected && (
                      <Button variant="outline" size="sm" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                        onClick={() => handleDisconnect(integration)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <Button size="sm" className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => handleConnect(integration)}
                    disabled={integration.comingSoon}>
                    {integration.comingSoon ? (
                      <><AlertTriangle className="w-4 h-4 mr-2" />Coming Soon</>
                    ) : (
                      <><Plug className="w-4 h-4 mr-2" />Connect</>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Custom Integration CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-950 dark:to-neutral-900 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Need a custom integration?</h3>
        <p className="text-neutral-400 mb-6 max-w-md mx-auto">
          We can build custom integrations with your existing tools. Our API supports webhooks, REST, and real-time sync.
        </p>
        <Button className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl" asChild>
          <a href="mailto:support@shopmuleai.com?subject=Custom Integration Request">
            <ExternalLink className="w-4 h-4 mr-2" />
            Request Custom Integration
          </a>
        </Button>
      </motion.div>

      {/* Connect / Configure Modal */}
      <Dialog open={!!modal && modal.mode !== 'disconnect'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-[420px] border-neutral-200 dark:border-neutral-700">
          {modal && modal.mode !== 'disconnect' && (
            <>
              <DialogHeader>
                <DialogTitle>{modal.mode === 'connect' ? `Connect ${modal.integration.name}` : `Configure ${modal.integration.name}`}</DialogTitle>
                <DialogDescription className="text-neutral-500">{modal.integration.description}</DialogDescription>
              </DialogHeader>

              {modal.integration.alwaysConnected ? (
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300 text-sm">Fully connected</p>
                      <p className="text-xs text-green-600 dark:text-green-400">Stripe is active and processing payments.</p>
                    </div>
                  </div>
                  <Button className="w-full rounded-xl" variant="outline" asChild>
                    <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Stripe Dashboard
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {(modal.integration.configFields ?? []).map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Input
                        type={field.type ?? 'text'}
                        placeholder={field.placeholder}
                        value={fieldValues[field.key] ?? ''}
                        onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
                        className="border-neutral-200 dark:border-neutral-600"
                      />
                    </div>
                  ))}
                  {!modal.integration.configFields?.length && (
                    <p className="text-sm text-neutral-500">No configuration needed. Click save to connect.</p>
                  )}
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setModal(null)} className="border-neutral-200">Cancel</Button>
                {!modal.integration.alwaysConnected && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#ee7a14] hover:bg-[#d96a0a] text-white border-0"
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {modal.mode === 'connect' ? 'Connect' : 'Save Changes'}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirm */}
      <Dialog open={!!modal && modal.mode === 'disconnect'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-[380px] border-neutral-200 dark:border-neutral-700">
          {modal?.mode === 'disconnect' && (
            <>
              <DialogHeader>
                <DialogTitle>Disconnect {modal.integration.name}?</DialogTitle>
                <DialogDescription>
                  This will remove the integration. You can reconnect at any time.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setModal(null)} className="border-neutral-200">Cancel</Button>
                <Button variant="destructive" onClick={confirmDisconnect} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Disconnect
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
