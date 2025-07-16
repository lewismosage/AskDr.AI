import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Trash2, Lock, Eye, EyeOff, XCircle } from 'lucide-react';

interface AccountSettingsProps {
  profile: {
    name: string;
    email: string;
    phone: string;
  };
  onProfileChange: (key: string, value: string) => void;
  onDeleteAccount: () => void;
  showDeleteConfirm: boolean;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
  profile,
  onProfileChange,
  onDeleteAccount,
  showDeleteConfirm
}) => {
  // Modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    // Simulate password update
    setPasswordForm({ current: '', new: '', confirm: '' });
    setPasswordError('');
    setShowPasswordModal(false);
    alert('Password updated!');
  };

  return (
    <div className="space-y-8">
      {/* Profile Information Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile Information
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onProfileChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => onProfileChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Password</h3>
            <p className="text-sm text-gray-600 mb-3">Last changed 3 months ago</p>
            <button
              className="text-primary hover:text-primary-dark font-medium text-sm"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
          </div>
        </div>
        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPasswordModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-lg font-medium flex items-center mb-6">
                <Lock className="h-5 w-5 mr-2" />
                Change Password
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {passwordError && (
                  <div className="text-red-600 text-sm flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    {passwordError}
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-lg">
        <div className="p-4 border-b border-red-100 bg-red-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-red-900 flex items-center">
            <Trash2 className="h-5 w-5 mr-2" />
            Danger Zone
          </h2>
        </div>
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-3 md:mb-0">
              <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-600">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <button
              onClick={onDeleteAccount}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                showDeleteConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              {showDeleteConfirm ? 'Click to Confirm' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;