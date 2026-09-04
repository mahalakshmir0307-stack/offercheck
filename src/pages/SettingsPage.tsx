import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Database, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Shared';
import { useAuth } from '@/context/AuthContext';

export function SettingsPage() {
  const { session } = useAuth();
  const [currency, setCurrency] = useState('INR');
  const [unit, setUnit] = useState('cm');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your workspace preferences and business parameters."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4 text-charcoal-500" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Email Address"
              value={session?.user?.email || ''}
              readOnly
              hint="Your registered business email"
            />
            <Input
              label="Business Name"
              placeholder="Enter your business name"
              hint="Displayed on reports and analytics"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-charcoal-500" />
              Business Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              hint="Used for all revenue and cost calculations"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </Select>
            <Select
              label="Measurement Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              hint="Used for dimension and volume display"
            >
              <option value="cm">Centimeters (cm)</option>
              <option value="mm">Millimeters (mm)</option>
              <option value="in">Inches (in)</option>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-charcoal-500" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-900">Activity Notifications</p>
                <p className="text-xs text-charcoal-500 mt-0.5">Get notified about new wood entries and product updates</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-amber-700' : 'bg-charcoal-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notifications ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-4 h-4 text-charcoal-500" />
              Data & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md border border-charcoal-200 bg-charcoal-50">
              <div>
                <p className="text-sm font-medium text-charcoal-900">Export Data</p>
                <p className="text-xs text-charcoal-500 mt-0.5">Download all inventory and product data</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md border border-charcoal-200 bg-charcoal-50">
              <div>
                <p className="text-sm font-medium text-charcoal-900">Clear Cache</p>
                <p className="text-xs text-charcoal-500 mt-0.5">Refresh recommendation engine cache</p>
              </div>
              <Button variant="outline" size="sm">Clear</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-5 bg-charcoal-50 border-charcoal-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-amber-700 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900">About WoodValue</h3>
            <p className="text-sm text-charcoal-600 mt-1">
              WoodValue is a B2B material intelligence platform for sawmills, furniture workshops, and wood-processing businesses.
              It analyzes leftover wood and recommends the best products to manufacture based on feasibility, material utilization, and profitability.
            </p>
            <p className="text-xs text-charcoal-400 mt-2">Version 1.0.0</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
