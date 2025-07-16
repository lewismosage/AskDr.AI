import React from 'react';
import { Palette, Globe, Clock } from 'lucide-react';

interface GeneralSettingsProps {
  theme: string;
  language: string;
  timezone: string;
  onSettingChange: (key: string, value: string) => void;
  themes: Array<{ id: string; name: string }>;
  languages: Array<{ code: string; name: string }>;
  timezones: Array<{ code: string; name: string }>;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  theme,
  language,
  timezone,
  onSettingChange,
  themes,
  languages,
  timezones
}) => {
  // Theme switching logic
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    } else if (theme === 'system') {
      const updateSystemTheme = () => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          root.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      };
      updateSystemTheme();
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateSystemTheme);
      return () => {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateSystemTheme);
      };
    }
  }, [theme]);

  return (
    <div className="space-y-6">
      {/* Theme Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Theme
        </h2>
        <div className="flex flex-wrap gap-3">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => onSettingChange('theme', themeOption.id)}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                theme === themeOption.id
                  ? 'bg-primary text-white border-primary'
                  : 'hover:bg-gray-50 border-gray-300'
              }`}
            >
              {themeOption.name}
            </button>
          ))}
        </div>
      </div>

      {/* Language & Region Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Language
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interface Language
              </label>
              <select
                value={language}
                onChange={(e) => onSettingChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Time Zone
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select your timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => onSettingChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {timezones.map((tz) => (
                <option key={tz.code} value={tz.code}>
                  {tz.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;