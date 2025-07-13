import React from 'react';
import YourHealth from '../assets/StartYourHealth.jpg'
import { Link } from 'react-router-dom';
import { ArrowRight, Stethoscope, Pill, Bell, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Stethoscope className="h-8 w-8 text-primary" />,
      title: "Symptom Checker",
      description: "Get instant analysis of your symptoms with our AI-powered diagnostic tool."
    },
    {
      icon: <Pill className="h-8 w-8 text-primary" />,
      title: "Medication Guide",
      description: "Ask questions about medications, interactions, and side effects safely."
    },
    {
      icon: <Bell className="h-8 w-8 text-primary" />,
      title: "Smart Reminders",
      description: "Never miss a dose with personalized medication and appointment reminders."
    }
  ];

  const benefits = [
    "24/7 AI health assistance",
    "Instant symptom analysis",
    "Medication safety checks",
    "Personalized health insights",
    "Secure and private consultations"
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Your AI Health
              <span className="text-primary block">Companion</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get instant health insights, symptom analysis, and medication guidance from our advanced AI assistant. 
              Your health journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/symptom-checker"
                className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/chat"
                className="border-2 border-primary text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary hover:text-white transition-all duration-200"
              >
                Try AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Health Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to stay on top of your health in one intelligent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-background p-8 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose AskDr.AI?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Experience healthcare reimagined with AI-powered insights and personalized care recommendations.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="bg-white p-8 rounded-2xl shadow-xl relative overflow-hidden"
              style={{
                backgroundImage: `url(${YourHealth})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  <span className="text-white">Start</span> <span className="text-green-600">Your Health</span> <span className="text-white">Journey</span>
                </h3>
                <p className="text-white mb-6">
                  Join thousands of users who trust AskDr.AI for their health insights.
                </p>
                <Link
                  to="/auth"
                  className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200 inline-block"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get started with AskDr.AI today and experience the future of healthcare.
          </p>
          <Link
            to="/symptom-checker"
            className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center group"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;