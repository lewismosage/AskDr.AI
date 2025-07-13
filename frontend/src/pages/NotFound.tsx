import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Stethoscope } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Oops! This page doesn't exist. It seems like you've taken a wrong turn on your health journey.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
          >
            <Home className="mr-2 h-5 w-5" />
            Return Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full border-2 border-primary text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Looking for something specific?</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/symptom-checker"
              className="text-primary hover:text-primary-dark font-medium text-sm flex items-center justify-between p-2 hover:bg-primary/5 rounded transition-colors duration-200"
            >
              <span>Symptom Checker</span>
              <span>→</span>
            </Link>
            <Link
              to="/chat"
              className="text-primary hover:text-primary-dark font-medium text-sm flex items-center justify-between p-2 hover:bg-primary/5 rounded transition-colors duration-200"
            >
              <span>AI Assistant</span>
              <span>→</span>
            </Link>
            <Link
              to="/medication-qa"
              className="text-primary hover:text-primary-dark font-medium text-sm flex items-center justify-between p-2 hover:bg-primary/5 rounded transition-colors duration-200"
            >
              <span>Medication Q&A</span>
              <span>→</span>
            </Link>
            <Link
              to="/plans"
              className="text-primary hover:text-primary-dark font-medium text-sm flex items-center justify-between p-2 hover:bg-primary/5 rounded transition-colors duration-200"
            >
              <span>Subscription Plans</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Still having trouble? <a href="#" className="text-primary hover:text-primary-dark">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;