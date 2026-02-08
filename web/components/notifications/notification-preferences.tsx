'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  workOrderUpdates: boolean;
  estimateAlerts: boolean;
  invoiceReminders: boolean;
  marketingEmails: boolean;
}

interface NotificationPreferencesProps {
  customerId: string;
  initialPreferences?: NotificationPreferences;
}

const defaultPreferences: NotificationPreferences = {
  email: true,
  sms: false,
  push: true,
  workOrderUpdates: true,
  estimateAlerts: true,
  invoiceReminders: true,
  marketingEmails: false,
};

export function NotificationPreferences({
  customerId,
  initialPreferences = defaultPreferences,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(initialPreferences);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: preferences }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified about updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channels */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Notification Channels
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-neutral-500" />
                <div>
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-neutral-500">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="email"
                checked={preferences.email}
                onCheckedChange={(checked) => updatePreference('email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-neutral-500" />
                <div>
                  <Label htmlFor="sms">SMS</Label>
                  <p className="text-sm text-neutral-500">
                    Receive text message notifications
                  </p>
                </div>
              </div>
              <Switch
                id="sms"
                checked={preferences.sms}
                onCheckedChange={(checked) => updatePreference('sms', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-neutral-500" />
                <div>
                  <Label htmlFor="push">Push Notifications</Label>
                  <p className="text-sm text-neutral-500">
                    Receive browser push notifications
                  </p>
                </div>
              </div>
              <Switch
                id="push"
                checked={preferences.push}
                onCheckedChange={(checked) => updatePreference('push', checked)}
              />
            </div>
          </div>
        </div>

        {/* Types */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Notification Types
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="workOrderUpdates">Work Order Updates</Label>
                <p className="text-sm text-neutral-500">
                  Get notified when your work order status changes
                </p>
              </div>
              <Switch
                id="workOrderUpdates"
                checked={preferences.workOrderUpdates}
                onCheckedChange={(checked) =>
                  updatePreference('workOrderUpdates', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="estimateAlerts">Estimate Alerts</Label>
                <p className="text-sm text-neutral-500">
                  Get notified when an estimate is ready for approval
                </p>
              </div>
              <Switch
                id="estimateAlerts"
                checked={preferences.estimateAlerts}
                onCheckedChange={(checked) =>
                  updatePreference('estimateAlerts', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="invoiceReminders">Invoice Reminders</Label>
                <p className="text-sm text-neutral-500">
                  Get reminded about upcoming or overdue invoices
                </p>
              </div>
              <Switch
                id="invoiceReminders"
                checked={preferences.invoiceReminders}
                onCheckedChange={(checked) =>
                  updatePreference('invoiceReminders', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-neutral-500">
                  Receive promotions and service reminders
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={preferences.marketingEmails}
                onCheckedChange={(checked) =>
                  updatePreference('marketingEmails', checked)
                }
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}
