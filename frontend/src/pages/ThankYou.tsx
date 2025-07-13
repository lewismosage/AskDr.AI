import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const ThankYou = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type') || 'signup';

  const getContent = () => {
    switch (type) {
      case 'subscription':
        return {
          title: 'Thank you for subscribing!',
          message: 'Your subscription has been activated. You now have access to all premium features.',
          buttonText: 'Go to Dashboard',
          buttonLink: '/dashboard'
        };
      case 'signup':
        return {
          title: 'Welcome to AskDr.AI!',
          message: 'Your account has been created successfully. Start your health journey with our AI assistant.',
          buttonText: 'Explore Features',
          buttonLink: '/dashboard'
        };
      case 'contact':
        return {
          title: 'Message sent successfully!',
          message: 'Thank you for contacting us. We\'ll get back to you within 24 hours.',
          buttonText: 'Return Home',
          buttonLink: '/'
        };
      default:
        return {
          title: 'Thank you!',
          message: 'Your action has been completed successfully.',
          buttonText: 'Continue',
          buttonLink: '/dashboard'
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {content.title}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {content.message}
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <Link
            to={content.buttonLink}
            className="w-full bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
          >
            {content.buttonText}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          
          {type !== 'contact' && (
            <Link
              to="/"
              className="block text-primary hover:text-primary-dark font-medium transition-colors duration-200"
            >
              Return to Home
            </Link>
          )}
        </div>

        {/* Additional Information */}
        {type === 'subscription' && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Explore unlimited symptom checking</li>
              <li>• Chat with our advanced AI assistant</li>
              <li>• Set up medication reminders</li>
              <li>• Access personalized health insights</li>
            </ul>
          </div>
        )}

        {type === 'signup' && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Getting Started</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complete your health profile</li>
              <li>• Try the symptom checker</li>
              <li>• Explore our AI chat assistant</li>
              <li>• Consider upgrading for premium features</li>
            </ul>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;