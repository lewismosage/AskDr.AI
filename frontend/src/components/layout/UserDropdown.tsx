// components/UserDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { LogOut, Settings, Star, Bell, User, ChevronRight, HelpCircle, FileText, Download } from "lucide-react";
import SettingsModal from "../../pages/settings/SettingsModal";
import SettingsContent from "../../pages/settings/Settings";

type UserDropdownProps = {
  email: string;
};

const UserDropdown: React.FC<UserDropdownProps> = ({ email }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHelpOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none"
      >
        <User className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200 overflow-hidden">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{email}</p>
              </div>
            </div>
          </div>
          <div className="py-1">
            <a
              href="/plans"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Star className="w-4 h-4 mr-3 text-gray-500" />
              <span>Upgrade Plan</span>
            </a>
            <a
              href="/reminders"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Bell className="w-4 h-4 mr-3 text-gray-500" />
              <span>Reminders</span>
            </a>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-500" />
              <span>Settings</span>
            </button>
      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <SettingsContent />
      </SettingsModal>
            <div className="my-2 border-t border-green-500 ml-11 mr-11" />
            <div
              className="relative"
              onMouseEnter={() => setHelpOpen(true)}
              onMouseLeave={() => setHelpOpen(false)}
            >
              <button
                type="button"
                onClick={() => setHelpOpen((v) => !v)}
                className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 justify-between w-full ${helpOpen ? 'bg-gray-50' : ''}`}
                aria-haspopup="true"
                aria-expanded={helpOpen}
              >
                <span className="flex items-center">
                  <HelpCircle className="w-4 h-4 mr-3 text-gray-500" />
                  Help
                </span>
                <ChevronRight className={`w-4 h-4 text-gray-400 ml-2 transition-transform duration-200 ${helpOpen ? 'rotate-90' : ''}`} />
              </button>
              {helpOpen && (
                <div className="absolute top-0 right-full w-48 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
                  <a
                    href="/help-center"
                    className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <HelpCircle className="w-5 h-5 mr-3 text-gray-500" />
                    Help center
                  </a>
                  <a
                    href="/terms"
                    className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-5 h-5 mr-3 text-gray-500" />
                    Terms & policies
                  </a>
                  <a
                    href="/download"
                    className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="w-5 h-5 mr-3 text-gray-500" />
                    Download apps
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-3 text-gray-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;