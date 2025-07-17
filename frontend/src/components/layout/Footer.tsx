import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Stethoscope className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">AskDr.AI</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Your trusted AI health companion. Get instant symptom analysis, medication guidance, and personalized health insights.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Disclaimer: This is not a substitute for professional medical advice.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Features
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/symptom-checker" className="text-sm text-gray-600 hover:text-primary transition-colors duration-200">
                  Symptom Checker
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-sm text-gray-600 hover:text-primary transition-colors duration-200">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/medication-qa" className="text-sm text-gray-600 hover:text-primary transition-colors duration-200">
                  Medication Guide
                </Link>
              </li>
              <li>
                <Link to="/therapist-connect" className="text-sm text-gray-600 hover:text-primary transition-colors duration-200">
                  Therapist Connect
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="text-sm text-gray-600 hover:text-primary transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="/help-center" className="text-sm text-gray-600 hover:text-primary transition-colors duration-200">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-xs text-gray-500 text-center">
            © 2025 AskDr.AI. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;