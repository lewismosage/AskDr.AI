import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, XCircle } from 'lucide-react';
import api from '../../lip/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertModal from '../../components/common/AlertModal';

interface NotificationSettingsData {
  email_notifications: boolean;
  push_notifications: boolean;
  medication_reminders: boolean;
  appointment_reminders: boolean;
  health_tips: boolean;
  weekly_reports: boolean;
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettingsData>({
    email_notifications: true,
    push_notifications: true,
    medication_reminders: true,
    appointment_reminders: true,
    health_tips: true,
    weekly_reports: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error' | 'confirm',
  });

  const showAlert = (
    title: string, 
    message: string, 
    type: 'info' | 'success' | 'warning' | 'error' | 'confirm' = 'info'
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('notifications/');
        setSettings(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load notification settings');
        showAlert('Error', 'Failed to load notification settings', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = async (key: string, value: boolean) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      await api.put('notifications/', { [key]: value });
      showAlert('Success', 'Notification settings updated successfully!', 'success');
    } catch (err: any) {
      setSettings(prev => ({ ...prev, [key]: !value }));
      showAlert('Error', err.response?.data?.detail || 'Failed to update settings', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Bell className="h-5 w-5 mr-2" />
        Notification Preferences
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">Email Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">General email notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.weekly_reports}
                onChange={(e) => handleSettingChange('weekly_reports', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Weekly health reports</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.health_tips}
                onChange={(e) => handleSettingChange('health_tips', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Health tips and articles</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <Smartphone className="h-4 w-4 mr-2" />
            Push Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.push_notifications}
                onChange={(e) => handleSettingChange('push_notifications', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Enable push notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.medication_reminders}
                onChange={(e) => handleSettingChange('medication_reminders', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Medication reminders</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.appointment_reminders}
                onChange={(e) => handleSettingChange('appointment_reminders', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Appointment reminders</span>
            </label>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText="OK"
      />
    </div>
  );
};

export default NotificationSettings;