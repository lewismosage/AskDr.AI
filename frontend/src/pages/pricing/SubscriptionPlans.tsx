import { useState } from "react";
import { Check, Crown, Star, ChevronDown } from "lucide-react";
import { StripePayment } from "./StripePayment";
import { useNavigate, useLocation } from "react-router-dom";

type BillingCycle = "monthly" | "annual";

interface PlanPrice {
  monthly: string;
  annual: string;
}

interface PlanPeriod {
  monthly: string;
  annual: string;
}

interface Plan {
  name: string;
  price: PlanPrice;
  period: PlanPeriod;
  description: string;
  features: string[];
  limitations: string[];
  buttonText: string;
  buttonStyle: string;
  popular: boolean;
  savings?: string;
}

const SubscriptionPlans = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [showComparison, setShowComparison] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: string;
    billingCycle: BillingCycle;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const plans: Plan[] = [
    {
      name: "Free",
      price: {
        monthly: "$0",
        annual: "$0",
      },
      period: {
        monthly: "forever",
        annual: "forever",
      },
      description: "Perfect for basic health questions",
      features: [
        "5 symptom checks per month",
        "Basic AI chat support",
        "General medication information",
        "Health tips and articles",
      ],
      limitations: [
        "Limited daily interactions",
        "No priority support",
        "Basic health tracking",
      ],
      buttonText: "Get Started",
      buttonStyle:
        "border-2 border-primary text-primary hover:bg-primary hover:text-white",
      popular: false,
    },
    {
      name: "Plus",
      price: {
        monthly: "$5",
        annual: "$50",
      },
      period: {
        monthly: "/month",
        annual: "/year",
      },
      description: "Enhanced features for better health management",
      features: [
        "Unlimited symptom checks",
        "Advanced AI conversations",
        "Detailed medication guides",
        "Personalized health insights",
        "Medication reminders",
        "Health goal tracking",
        "Priority email support",
      ],
      limitations: [],
      buttonText: "Get Started",
      buttonStyle: "bg-primary text-white hover:bg-primary-dark",
      popular: true,
      savings: "Save 17%",
    },
    {
      name: "Pro",
      price: {
        monthly: "$10",
        annual: "$96",
      },
      period: {
        monthly: "/month",
        annual: "/year",
      },
      description: "Complete health companion with premium features",
      features: [
        "Everything in Plus",
        "AI health risk assessments",
        "Advanced interaction history",
        "Family health profiles",
        "Integration with health apps",
        "Telehealth appointment booking",
        "24/7 priority chat support",
        "Monthly health reports",
      ],
      limitations: [],
      buttonText: "Get Started",
      buttonStyle: "bg-gray-900 text-white hover:bg-gray-800",
      popular: false,
      savings: "Save 20%",
    },
  ];

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.name === "Free") {
      // Handle free plan directly
      return;
    }

    // Check if user is authenticated
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      // Redirect to auth page with return URL
      navigate(`/auth?from=${encodeURIComponent(location.pathname)}`);
      return;
    }

    // Proceed to payment for authenticated users
    setSelectedPlan({
      name: plan.name,
      price: plan.price[billingCycle],
      billingCycle,
    });
  };

  const handlePaymentSuccess = () => {
    setSelectedPlan(null);
    // You might want to redirect to dashboard or show a success message
  };

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StripePayment
            plan={selectedPlan}
            onBack={() => setSelectedPlan(null)}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Health Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Select the perfect plan to support your health journey with
            AskDr.AI's intelligent features.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-full p-1 inline-flex">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  billingCycle === "monthly"
                    ? "bg-white shadow-sm text-primary"
                    : "text-gray-600"
                }`}
              >
                Pay Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  billingCycle === "annual"
                    ? "bg-white shadow-sm text-primary"
                    : "text-gray-600"
                }`}
              >
                Pay Annually
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] ${
                plan.popular
                  ? "ring-2 ring-primary border-primary"
                  : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 text-sm font-semibold">
                  <Star className="h-4 w-4 inline mr-1" />
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? "pt-16" : ""}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price[billingCycle]}
                    </span>
                    <span className="text-gray-600 ml-1">
                      {plan.period[billingCycle]}
                    </span>
                  </div>
                  {billingCycle === "annual" && plan.savings && (
                    <div className="text-sm text-green-600 font-medium mb-2">
                      {plan.savings}
                    </div>
                  )}
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
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${plan.buttonStyle}`}
                  disabled={plan.name === "Free"}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Toggle */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center text-primary font-medium"
          >
            {showComparison ? "Hide" : "Show"} full feature comparison
            <ChevronDown
              className={`h-5 w-5 ml-2 transition-transform ${
                showComparison ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Features Comparison */}
        {showComparison && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Feature Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">
                      Features
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">
                      Free
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">
                      Plus
                      <Crown className="h-4 w-4 text-primary inline ml-1" />
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-4 px-4 text-gray-700">
                      Monthly symptom checks
                    </td>
                    <td className="py-4 px-4 text-center">5</td>
                    <td className="py-4 px-4 text-center text-green-600">
                      Unlimited
                    </td>
                    <td className="py-4 px-4 text-center text-green-600">
                      Unlimited
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-4 px-4 text-gray-700">AI chat support</td>
                    <td className="py-4 px-4 text-center">Basic</td>
                    <td className="py-4 px-4 text-center text-green-600">
                      Advanced
                    </td>
                    <td className="py-4 px-4 text-center text-green-600">
                      Premium
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">
                      Medication reminders
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400">✗</td>
                    <td className="py-4 px-4 text-center text-green-600">✓</td>
                    <td className="py-4 px-4 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-4 px-4 text-gray-700">
                      Health goal tracking
                    </td>
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
        )}

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. No hidden
                fees or long-term commitments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is my health data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use enterprise-grade encryption and comply with
                healthcare privacy regulations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I switch between monthly and annual billing?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your billing cycle at any time. Changes will
                take effect at your next renewal date.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Changes take effect
                at your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
