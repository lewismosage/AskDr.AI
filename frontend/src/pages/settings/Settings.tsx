import React from "react";
import { User } from "lucide-react";
import AccountSettings from "./AccountSettings";

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar - Categories */}
        <div className="md:col-span-1 space-y-1">
          <div
            className={
              "w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-200 font-semibold text-left cursor-default"
            }
          >
            <span className="text-gray-500">
              <User size={18} />
            </span>
            <span>Account</span>
          </div>
        </div>
        {/* Right content area */}
        <div className="md:col-span-3">
          <AccountSettings />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
