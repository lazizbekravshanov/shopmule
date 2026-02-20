'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  User,
  Building2,
  Bell,
  Palette,
  Shield,
  Mail,
  Keyboard,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/use-toast';
import { useUIStore } from '@/lib/stores/ui-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

async function fetchTenant() {
  const res = await fetch('/api/tenant');
  if (!res.ok) throw new Error('Failed to load settings');
  const data = await res.json();
  return data.tenant;
}

async function saveTenant(body: Record<string, unknown>) {
  const res = await fetch('/api/tenant', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { setShortcutsOpen } = useUIStore();
  const qc = useQueryClient();

  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['tenant'],
    queryFn: fetchTenant,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: saveTenant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenant'] });
      toast({ title: 'Settings saved', description: 'Your settings have been updated.' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    },
  });

  // Profile settings
  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
  });

  // Shop settings — initialized from API
  const [shop, setShop] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxRate: '',
    laborRate: '',
  });

  useEffect(() => {
    if (tenant) {
      setShop({
        name: tenant.name ?? '',
        address: [tenant.address, tenant.city, tenant.state, tenant.zipCode].filter(Boolean).join(', '),
        phone: tenant.phone ?? '',
        email: tenant.email ?? '',
        taxRate: tenant.taxRate != null ? String(tenant.taxRate * 100) : '',
        laborRate: tenant.settings?.laborRate != null ? String(tenant.settings.laborRate) : '',
      });
    }
  }, [tenant]);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailWorkOrders: true,
    emailInvoices: true,
    emailReminders: false,
    pushNotifications: true,
  });

  const handleSaveShop = () => {
    // Parse address back into parts (simple split on first comma)
    const parts = shop.address.split(',').map((s) => s.trim());
    mutation.mutate({
      name: shop.name,
      address: parts[0] ?? shop.address,
      phone: shop.phone,
      email: shop.email,
      taxRate: shop.taxRate ? parseFloat(shop.taxRate) / 100 : undefined,
      laborRate: shop.laborRate || undefined,
    });
  };

  const handleSaveProfile = () => {
    toast({
      title: 'Settings saved',
      description: 'Profile settings updated.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage your account and shop preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Shop</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop">
          <Card>
            <CardHeader>
              <CardTitle>Shop Settings</CardTitle>
              <CardDescription>
                Configure your shop information and default rates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tenantLoading ? (
                <div className="flex items-center gap-2 text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading shop settings...
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="shopName">Shop Name</Label>
                      <Input
                        id="shopName"
                        value={shop.name}
                        onChange={(e) => setShop({ ...shop, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopEmail">Shop Email</Label>
                      <Input
                        id="shopEmail"
                        type="email"
                        value={shop.email}
                        onChange={(e) => setShop({ ...shop, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopPhone">Shop Phone</Label>
                      <Input
                        id="shopPhone"
                        type="tel"
                        value={shop.phone}
                        onChange={(e) => setShop({ ...shop, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopAddress">Address</Label>
                      <Input
                        id="shopAddress"
                        value={shop.address}
                        onChange={(e) => setShop({ ...shop, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        value={shop.taxRate}
                        onChange={(e) => setShop({ ...shop, taxRate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
                      <Input
                        id="laborRate"
                        type="number"
                        step="0.01"
                        value={shop.laborRate}
                        onChange={(e) => setShop({ ...shop, laborRate: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveShop} disabled={mutation.isPending}>
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </h4>
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailWorkOrders">Work Order Updates</Label>
                      <p className="text-sm text-neutral-500">
                        Get notified when work orders are created or updated
                      </p>
                    </div>
                    <Switch
                      id="emailWorkOrders"
                      checked={notifications.emailWorkOrders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailWorkOrders: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailInvoices">Invoice Notifications</Label>
                      <p className="text-sm text-neutral-500">
                        Get notified about payments and invoice status
                      </p>
                    </div>
                    <Switch
                      id="emailInvoices"
                      checked={notifications.emailInvoices}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailInvoices: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailReminders">Reminders</Label>
                      <p className="text-sm text-neutral-500">
                        Receive reminders for overdue tasks
                      </p>
                    </div>
                    <Switch
                      id="emailReminders"
                      checked={notifications.emailReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailReminders: checked })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Push Notifications
                </h4>
                <div className="space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Enable Push Notifications</Label>
                      <p className="text-sm text-neutral-500">
                        Receive real-time updates in your browser
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how ShopMule looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-neutral-500">
                    Choose between light, dark, or system theme
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Keyboard className="h-4 w-4" />
                      Keyboard Shortcuts
                    </Label>
                    <p className="text-sm text-neutral-500">
                      View all available keyboard shortcuts
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setShortcutsOpen(true)}>
                    View Shortcuts
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Change Password</h4>
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
                <Button>Update Password</Button>
              </div>
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium mb-3">Audit Log</h4>
                <p className="text-sm text-neutral-500 mb-4">
                  Review a history of all actions taken in your account.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/settings/audit-logs" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    View Audit Log
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </div>
              <div className="border-t pt-6">
                <h4 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
                <p className="text-sm text-neutral-500 mb-4">
                  Once you delete your account, there is no going back.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
