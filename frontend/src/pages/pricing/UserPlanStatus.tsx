import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Crown, Zap, CreditCard, ArrowRight } from "lucide-react";
import api from "../../lip/api";

interface PlanDetails {
  name: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
}

const UserPlanStatus = () => {
  const [currentPlan, setCurrentPlan] = useState<"free" | "plus" | "pro" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await api.get("/users/me/");
        setCurrentPlan(response.data.plan);
      } catch (err) {
        console.error("Failed to fetch user plan:", err);
        setError("Failed to load plan information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, []);

  const planDetails: Record<string, PlanDetails> = {
    free: {
      name: "Free Plan",
      features: [
        "5 symptom checks/month",
        "10 medication questions/month",
        "10 AI chat messages/month",
        "Basic health tracking"
      ],
      icon: <Zap className="h-5 w-5" />,
      color: "text-gray-600"
    },
    plus: {
      name: "Plus Plan",
      features: [
        "Unlimited symptom checks",
        "Unlimited medication questions",
        "50 AI chat messages/month",
        "Advanced health insights",
        "Medication reminders"
      ],
      icon: <Crown className="h-5 w-5 text-yellow-500" />,
      color: "text-blue-600"
    },
    pro: {
      name: "Pro Plan",
      features: [
        "Unlimited everything",
        "Priority support",
        "Family profiles",
        "Advanced analytics",
        "Personalized health plans"
      ],
      icon: <Crown className="h-5 w-5 text-purple-500" />,
      color: "text-purple-600"
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-600">No plan information available</p>
      </div>
    );
  }

  const currentPlanInfo = planDetails[currentPlan];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Plan Header */}
      <div className={`bg-gradient-to-r from-${currentPlan === 'free' ? 'gray' : currentPlan === 'plus' ? 'blue' : 'purple'}-50 to-white p-4 border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {currentPlanInfo.icon}
            <h3 className={`text-lg font-semibold ${currentPlanInfo.color}`}>
              {currentPlanInfo.name}
            </h3>
          </div>
          {currentPlan !== 'pro' && (
            <Link
              to="/pricing"
              className="inline-flex items-center px-3 py-1 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-full transition-colors"
            >
              Upgrade <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Plan Features */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">CURRENT FEATURES</h4>
        <ul className="space-y-2">
          {currentPlanInfo.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade CTA for free/plus plans */}
      {currentPlan !== 'pro' && (
        <div className="bg-gray-50 p-4 border-t">
          <Link
            to="/pricing"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {currentPlan === 'free' ? 'Upgrade to Plus or Pro' : 'Upgrade to Pro'}
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserPlanStatus;