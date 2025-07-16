import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, User, Star, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import UserDropdown from "./UserDropdown";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Symptom Checker', href: '/symptom-checker' },
    { name: 'Chat Assistant', href: '/chat' },
    { name: 'Medication Q&A', href: '/medication-qa' },
    { name: 'Therapist Connect', href: '/therapist-connect' },
  ];

  const isActive = (href: string) => location.pathname === href;
  const isAuthenticated = !!localStorage.getItem("accessToken");
  const userEmail = localStorage.getItem("userEmail") || "";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">AskDr.AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <UserDropdown email={userEmail} />
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary focus:outline-none focus:text-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="pt-4 pb-3 border-t border-gray-200">
                    <button
                      onClick={() => setIsUserMenuOpen(true)}
                      className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-700">{userEmail}</span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Mobile User Dropdown (Sidebar) */}
                  {isUserMenuOpen && (
                    <div className="fixed inset-0 z-40">
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                <User className="w-5 h-5 text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsUserMenuOpen(false)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-6 w-6" />
                            </button>
                          </div>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/plans"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Star className="w-5 h-5 mr-3 text-gray-500" />
                            <span>Upgrade Plan</span>
                          </Link>
                          <Link
                            to="/reminders"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Bell className="w-5 h-5 mr-3 text-gray-500" />
                            <span>Reminders</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="w-5 h-5 mr-3 text-gray-500" />
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={() => {
                              localStorage.clear();
                              window.location.href = "/";
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <LogOut className="w-5 h-5 mr-3 text-gray-500" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <Link
                    to="/auth"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth"
                    className="block mx-3 mt-2 bg-primary text-white px-3 py-2 rounded-md text-base font-medium hover:bg-primary-dark transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;