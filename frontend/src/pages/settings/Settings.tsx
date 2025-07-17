import React, { useState } from 'react';
import { Settings, Bell, Link, User } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import ConnectedAppsSettings from './ConnectedAppsSettings';
import AccountSettings from './AccountSettings';

interface SettingsItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const settingsCategories: SettingsItem[] = [
  { id: 'general', title: 'General', icon: <Settings size={18} /> },
  { id: 'connected-apps', title: 'Connected apps', icon: <Link size={18} /> },
  { id: 'account', title: 'Account', icon: <User size={18} /> },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('general');

  // General settings state
  const [theme, setTheme] = useState<string>('light');
  const [language, setLanguage] = useState<string>('en');
  const [timezone, setTimezone] = useState<string>('UTC-8');

  // Connected apps state
  const [connectedApps, setConnectedApps] = useState([
    {
      id: 'app1',
      name: 'Google Fit',
      logo: '',
      permissions: ['Read steps', 'Read heart rate'],
      lastUsed: 'Today',
      scopes: ['steps', 'heartrate'],
    },
    {
      id: 'app2',
      name: 'Apple Health',
      logo: '',
      permissions: ['Read sleep', 'Read activity'],
      lastUsed: 'Yesterday',
      scopes: ['sleep', 'activity'],
    },
  ]);

  // Connected apps handlers
  const handleRevokeAccess = (appId: string) => {
    setConnectedApps((prev) => prev.filter((app) => app.id !== appId));
  };

  const handleViewPermissions = (appId: string) => {
    const app = connectedApps.find((a) => a.id === appId);
    if (app) {
      alert(`Permissions for ${app.name}:\n${app.permissions.join(', ')}`);
    }
  };

  // Options for GeneralSettings
  const themes = [
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
    { id: 'system', name: 'System' },
  ];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
  ];
  const timezones = [
    { code: 'UTC-8', name: 'Pacific Time (PT)' },
    { code: 'UTC-5', name: 'Eastern Time (ET)' },
    { code: 'UTC+1', name: 'Central European Time (CET)' },
    { code: 'UTC+9', name: 'Japan Standard Time (JST)' },
  ];

  // Handlers
  const handleGeneralSettingChange = (key: string, value: string) => {
    if (key === 'theme') setTheme(value);
    if (key === 'language') setLanguage(value);
    if (key === 'timezone') setTimezone(value);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettings
            theme={theme}
            language={language}
            timezone={timezone}
            onSettingChange={handleGeneralSettingChange}
            themes={themes}
            languages={languages}
            timezones={timezones}
          />
        );
      case 'connected-apps':
        return (
          <ConnectedAppsSettings
            connectedApps={connectedApps}
            onRevokeAccess={handleRevokeAccess}
            onViewPermissions={handleViewPermissions}
          />
        );
      case 'account':
        return <AccountSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar - Categories */}
        <div className="md:col-span-1 space-y-1">
          {settingsCategories.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${activeTab === item.id ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="text-gray-500">{item.icon}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
        {/* Right content area */}
        <div className="md:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;