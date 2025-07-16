import React, { useState } from 'react';
import { Bell, Smartphone } from 'lucide-react';

interface NotificationSettingsProps {
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    medicationReminders: boolean;
    appointmentReminders: boolean;
    healthTips: boolean;
    weeklyReports: boolean;
  };
  onSettingChange: (key: string, value: boolean) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  settings, 
  onSettingChange 
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Bell className="h-5 w-5 mr-2" />
        Notification Preferences
      </h2>
      
      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Email Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => onSettingChange('emailNotifications', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">General email notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={(e) => onSettingChange('weeklyReports', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Weekly health reports</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.healthTips}
                onChange={(e) => onSettingChange('healthTips', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Health tips and articles</span>
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <Smartphone className="h-4 w-4 mr-2" />
            Push Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => onSettingChange('pushNotifications', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Enable push notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.medicationReminders}
                onChange={(e) => onSettingChange('medicationReminders', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Medication reminders</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.appointmentReminders}
                onChange={(e) => onSettingChange('appointmentReminders', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Appointment reminders</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;