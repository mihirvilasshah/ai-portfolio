"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Icons
const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Settings tabs
const settingsTabs = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "appearance", label: "Appearance", icon: PaletteIcon },
  { id: "privacy", label: "Privacy & Security", icon: ShieldIcon },
  { id: "data", label: "Data & API", icon: DatabaseIcon },
  { id: "preferences", label: "Trading Preferences", icon: CurrencyIcon },
];

// Settings state type
interface Settings {
  profile: {
    name: string;
    email: string;
    phone: string;
    panNumber: string;
  };
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    priceAlerts: boolean;
    portfolioUpdates: boolean;
    newsDigest: boolean;
    weeklyReport: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "system";
    compactMode: boolean;
    showTickers: boolean;
    chartStyle: "candle" | "line" | "area";
  };
  privacy: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    activityLog: boolean;
    shareAnalytics: boolean;
  };
  data: {
    dataProvider: string;
    refreshInterval: number;
    cacheEnabled: boolean;
    apiKey: string;
  };
  preferences: {
    defaultExchange: string;
    currency: string;
    riskTolerance: "conservative" | "moderate" | "aggressive";
    taxRegime: "old" | "new";
  };
}

const defaultSettings: Settings = {
  profile: {
    name: "Investor",
    email: "investor@example.com",
    phone: "+91 98765 43210",
    panNumber: "ABCDE1234F",
  },
  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    priceAlerts: true,
    portfolioUpdates: true,
    newsDigest: false,
    weeklyReport: true,
  },
  appearance: {
    theme: "system",
    compactMode: false,
    showTickers: true,
    chartStyle: "candle",
  },
  privacy: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    activityLog: true,
    shareAnalytics: true,
  },
  data: {
    dataProvider: "yahoo",
    refreshInterval: 60,
    cacheEnabled: true,
    apiKey: "",
  },
  preferences: {
    defaultExchange: "NSE",
    currency: "INR",
    riskTolerance: "moderate",
    taxRegime: "new",
  },
};

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    // In real app, save to backend
  };

  const updateSetting = <K extends keyof Settings, SK extends keyof Settings[K]>(
    category: K,
    key: SK,
    value: Settings[K][SK]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={settings.profile.name}
                onChange={(e) => updateSetting("profile", "name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateSetting("profile", "email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.profile.phone}
                onChange={(e) => updateSetting("profile", "phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number</Label>
              <Input
                id="pan"
                value={settings.profile.panNumber}
                onChange={(e) => updateSetting("profile", "panNumber", e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">Required for tax reporting</p>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div>
            <SettingRow label="Email Alerts" description="Receive important updates via email">
              <Switch
                checked={settings.notifications.emailAlerts}
                onCheckedChange={(checked) => updateSetting("notifications", "emailAlerts", checked)}
              />
            </SettingRow>
            <SettingRow label="Push Notifications" description="Browser notifications for real-time alerts">
              <Switch
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(checked) => updateSetting("notifications", "pushNotifications", checked)}
              />
            </SettingRow>
            <SettingRow label="Price Alerts" description="Get notified when stocks hit your target price">
              <Switch
                checked={settings.notifications.priceAlerts}
                onCheckedChange={(checked) => updateSetting("notifications", "priceAlerts", checked)}
              />
            </SettingRow>
            <SettingRow label="Portfolio Updates" description="Daily summary of your portfolio performance">
              <Switch
                checked={settings.notifications.portfolioUpdates}
                onCheckedChange={(checked) => updateSetting("notifications", "portfolioUpdates", checked)}
              />
            </SettingRow>
            <SettingRow label="News Digest" description="Daily market news and insights">
              <Switch
                checked={settings.notifications.newsDigest}
                onCheckedChange={(checked) => updateSetting("notifications", "newsDigest", checked)}
              />
            </SettingRow>
            <SettingRow label="Weekly Report" description="Weekly portfolio analysis and recommendations">
              <Switch
                checked={settings.notifications.weeklyReport}
                onCheckedChange={(checked) => updateSetting("notifications", "weeklyReport", checked)}
              />
            </SettingRow>
          </div>
        );

      case "appearance":
        return (
          <div>
            <SettingRow label="Theme" description="Choose your preferred color scheme">
              <select
                value={settings.appearance.theme}
                onChange={(e) => updateSetting("appearance", "theme", e.target.value as Settings["appearance"]["theme"])}
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </SettingRow>
            <SettingRow label="Compact Mode" description="Show more data in less space">
              <Switch
                checked={settings.appearance.compactMode}
                onCheckedChange={(checked) => updateSetting("appearance", "compactMode", checked)}
              />
            </SettingRow>
            <SettingRow label="Show Tickers" description="Display scrolling market tickers">
              <Switch
                checked={settings.appearance.showTickers}
                onCheckedChange={(checked) => updateSetting("appearance", "showTickers", checked)}
              />
            </SettingRow>
            <SettingRow label="Default Chart Style" description="Preferred chart visualization">
              <select
                value={settings.appearance.chartStyle}
                onChange={(e) => updateSetting("appearance", "chartStyle", e.target.value as Settings["appearance"]["chartStyle"])}
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
              >
                <option value="candle">Candlestick</option>
                <option value="line">Line</option>
                <option value="area">Area</option>
              </select>
            </SettingRow>
          </div>
        );

      case "privacy":
        return (
          <div>
            <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.privacy.twoFactorEnabled}
                  onCheckedChange={(checked) => updateSetting("privacy", "twoFactorEnabled", checked)}
                />
                {!settings.privacy.twoFactorEnabled && (
                  <Badge variant="secondary">Recommended</Badge>
                )}
              </div>
            </SettingRow>
            <SettingRow label="Session Timeout" description="Auto logout after inactivity (minutes)">
              <select
                value={settings.privacy.sessionTimeout}
                onChange={(e) => updateSetting("privacy", "sessionTimeout", parseInt(e.target.value))}
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={0}>Never</option>
              </select>
            </SettingRow>
            <SettingRow label="Activity Log" description="Track account activity for security">
              <Switch
                checked={settings.privacy.activityLog}
                onCheckedChange={(checked) => updateSetting("privacy", "activityLog", checked)}
              />
            </SettingRow>
            <SettingRow label="Share Analytics" description="Help improve the platform with anonymous usage data">
              <Switch
                checked={settings.privacy.shareAnalytics}
                onCheckedChange={(checked) => updateSetting("privacy", "shareAnalytics", checked)}
              />
            </SettingRow>
            <div className="mt-6 pt-4 border-t border-border">
              <Button variant="destructive" size="sm">
                Download My Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Download all your data in JSON format
              </p>
            </div>
          </div>
        );

      case "data":
        return (
          <div>
            <SettingRow label="Data Provider" description="Source for market data">
              <select
                value={settings.data.dataProvider}
                onChange={(e) => updateSetting("data", "dataProvider", e.target.value)}
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
              >
                <option value="yahoo">Yahoo Finance</option>
                <option value="nse">NSE Direct</option>
                <option value="bse">BSE Direct</option>
              </select>
            </SettingRow>
            <SettingRow label="Refresh Interval" description="How often to fetch new data (seconds)">
              <select
                value={settings.data.refreshInterval}
                onChange={(e) => updateSetting("data", "refreshInterval", parseInt(e.target.value))}
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
              </select>
            </SettingRow>
            <SettingRow label="Cache Data" description="Store data locally for faster loading">
              <Switch
                checked={settings.data.cacheEnabled}
                onCheckedChange={(checked) => updateSetting("data", "cacheEnabled", checked)}
              />
            </SettingRow>
            <div className="py-4 border-b border-border">
              <Label className="text-sm font-medium">API Key (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Use your own API key for higher rate limits
              </p>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={settings.data.apiKey}
                onChange={(e) => updateSetting("data", "apiKey", e.target.value)}
              />
            </div>
            <div className="mt-6">
              <Button variant="outline" size="sm">
                Clear Cache
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Clear all locally stored market data
              </p>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div>
            <SettingRow label="Default Exchange" description="Primary exchange for stock search">
              <select
                value={settings.preferences.defaultExchange}
                onChange={(e) => updateSetting("preferences", "defaultExchange", e.target.value)}
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
                <option value="NASDAQ">NASDAQ</option>
                <option value="NYSE">NYSE</option>
              </select>
            </SettingRow>
            <SettingRow label="Display Currency" description="Currency for displaying values">
              <select
                value={settings.preferences.currency}
                onChange={(e) => updateSetting("preferences", "currency", e.target.value)}
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </SettingRow>
            <SettingRow label="Risk Tolerance" description="Used for portfolio recommendations">
              <select
                value={settings.preferences.riskTolerance}
                onChange={(e) => updateSetting("preferences", "riskTolerance", e.target.value as Settings["preferences"]["riskTolerance"])}
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </SettingRow>
            <SettingRow label="Tax Regime" description="For calculating tax implications">
              <select
                value={settings.preferences.taxRegime}
                onChange={(e) => updateSetting("preferences", "taxRegime", e.target.value as Settings["preferences"]["taxRegime"])}
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
              >
                <option value="old">Old Regime</option>
                <option value="new">New Regime (2024)</option>
              </select>
            </SettingRow>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {settingsTabs.find((t) => t.id === activeTab)?.label}
              </CardTitle>
              <CardDescription>
                {activeTab === "profile" && "Update your personal information"}
                {activeTab === "notifications" && "Configure how you receive updates"}
                {activeTab === "appearance" && "Customize the look and feel"}
                {activeTab === "privacy" && "Manage your security settings"}
                {activeTab === "data" && "Configure data sources and caching"}
                {activeTab === "preferences" && "Set your trading preferences"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSettings(defaultSettings)}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible account actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Export All Data</div>
              <div className="text-sm text-muted-foreground">
                Download all your portfolio and settings data
              </div>
            </div>
            <Button variant="outline">Export</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-red-600">Delete Account</div>
              <div className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </div>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
