import React from 'react';
import { Check, Crown, Star } from 'lucide-react';

const SubscriptionPlans = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for basic health questions",
      features: [
        "5 symptom checks per month",
        "Basic AI chat support",
        "General medication information",
        "Health tips and articles"
      ],
      limitations: [
        "Limited daily interactions",
        "No priority support",
        "Basic health tracking"
      ],
      buttonText: "Get Started",
      buttonStyle: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
      popular: false
    },
    {
      name: "Plus",
      price: "$5",
      period: "/month",
      description: "Enhanced features for better health management",
      features: [
        "Unlimited symptom checks",
        "Advanced AI conversations",
        "Detailed medication guides",
        "Personalized health insights",
        "Medication reminders",
        "Health goal tracking",
        "Priority email support"
      ],
      limitations: [],
      buttonText: "Start Free Trial",
      buttonStyle: "bg-primary text-white hover:bg-primary-dark",
      popular: true
    },
    {
      name: "Pro",
      price: "$10",
      period: "/month",
      description: "Complete health companion with premium features",
      features: [
        "Everything in Plus",
        "AI health risk assessments",
        "Advanced interaction history",
        "Family health profiles",
        "Integration with health apps",
        "Telehealth appointment booking",
        "24/7 priority chat support",
        "Monthly health reports"
      ],
      limitations: [],
      buttonText: "Start Free Trial",
      buttonStyle: "bg-gray-900 text-white hover:bg-gray-800",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Health Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan to support your health journey with AskDr.AI's intelligent features.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-2 ring-primary border-primary' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 text-sm font-semibold">
                  <Star className="h-4 w-4 inline mr-1" />
                  Most Popular
                </div>
              )}
              
              <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>

                {plan.name === "Plus" && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    14-day free trial • No credit card required
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Feature Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">
                    Plus
                    <Crown className="h-4 w-4 text-primary inline ml-1" />
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-4 text-gray-700">Monthly symptom checks</td>
                  <td className="py-4 px-4 text-center">5</td>
                  <td className="py-4 px-4 text-center text-green-600">Unlimited</td>
                  <td className="py-4 px-4 text-center text-green-600">Unlimited</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">AI chat support</td>
                  <td className="py-4 px-4 text-center">Basic</td>
                  <td className="py-4 px-4 text-center text-green-600">Advanced</td>
                  <td className="py-4 px-4 text-center text-green-600">Premium</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Medication reminders</td>
                  <td className="py-4 px-4 text-center text-gray-400">✗</td>
                  <td className="py-4 px-4 text-center text-green-600">✓</td>
                  <td className="py-4 px-4 text-center text-green-600">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">Health goal tracking</td>
                  <td className="py-4 px-4 text-center text-gray-400">✗</td>
                  <td className="py-4 px-4 text-center text-green-600">✓</td>
                  <td className="py-4 px-4 text-center text-green-600">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Family profiles</td>
                  <td className="py-4 px-4 text-center text-gray-400">✗</td>
                  <td className="py-4 px-4 text-center text-gray-400">✗</td>
                  <td className="py-4 px-4 text-center text-green-600">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">24/7 support</td>
                  <td className="py-4 px-4 text-center text-gray-400">✗</td>
                  <td className="py-4 px-4 text-center text-gray-400">✗</td>
                  <td className="py-4 px-4 text-center text-green-600">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. No hidden fees or long-term commitments.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my health data secure?</h3>
              <p className="text-gray-600">Absolutely. We use enterprise-grade encryption and comply with healthcare privacy regulations.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does the free trial work?</h3>
              <p className="text-gray-600">Start with a 14-day free trial of Plus or Pro. No credit card required to begin.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-gray-600">Yes, you can change your plan at any time. Changes take effect at your next billing cycle.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;