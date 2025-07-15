import React from 'react';
import { Settings, Bell, Palette, Link, Database, Shield, User } from 'lucide-react';

interface SettingsItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  description?: string;
}

const SettingsPage: React.FC = () => {
  const settingsCategories: SettingsItem[] = [
    { id: 'general', title: 'General', icon: <Settings size={18} /> },
    { id: 'notifications', title: 'Notifications', icon: <Bell size={18} /> },
    { id: 'personalization', title: 'Personalization', icon: <Palette size={18} /> },
    { id: 'connected-apps', title: 'Connected apps', icon: <Link size={18} /> },
    { id: 'data-controls', title: 'Data controls', icon: <Database size={18} /> },
    { id: 'security', title: 'Security', icon: <Shield size={18} /> },
    { id: 'account', title: 'Account', icon: <User size={18} /> },
  ];

  const themeOptions = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  const languageOptions = [
    { id: 'en', label: 'English' },
    { id: 'es', label: 'Spanish' },
    { id: 'fr', label: 'French' },
    { id: 'de', label: 'German' },
    { id: 'ja', label: 'Japanese' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar - Categories */}
        <div className="md:col-span-1 space-y-1">
          {settingsCategories.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <span className="text-gray-500">{item.icon}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
        
        {/* Right content area */}
        <div className="md:col-span-3 space-y-8">
          {/* Theme Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Theme</h2>
            <div className="flex space-x-4">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Language Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Language</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interface language</label>
                <select className="w-full max-w-xs p-2 border rounded-lg">
                  {languageOptions.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spoken language</label>
                <select className="w-full max-w-xs p-2 border rounded-lg">
                  {languageOptions.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.
                </p>
              </div>
            </div>
          </div>
          
          {/* Voice Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Voice</h2>
            <div className="flex items-center space-x-3">
              <input type="checkbox" id="follow-up" className="h-4 w-4 rounded" />
              <label htmlFor="follow-up" className="text-sm font-medium text-gray-700">
                Show follow up suggestions in chats
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
