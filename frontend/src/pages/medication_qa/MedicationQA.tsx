import React, { useState, useEffect } from "react";
import { Search, Pill, AlertTriangle, Info, Clock, Lock } from "lucide-react";
import api from "../../lip/api";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Constants
const MEDICATION_QA_LIMIT = 5;
const STORAGE_KEY = "medicationQACount";

const MedicationQA = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qaCount, setQACount] = useState(0);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "plus" | "pro" | null>(null);
  const [questionsAllowed, setQuestionsAllowed] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize QA count from localStorage
  useEffect(() => {
    const storedCount = localStorage.getItem(STORAGE_KEY);
    const count = storedCount ? parseInt(storedCount) : 0;
    setQACount(count);

    if (count >= MEDICATION_QA_LIMIT) {
      setShowLimitMessage(true);
    }
  }, []);

  // Check authentication status and plan
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // Clear the QA limit for authenticated users
      localStorage.removeItem(STORAGE_KEY);
      setQACount(0);
      setShowLimitMessage(false);
      checkFeatureAccess(); // Check user's plan and question limits
    }
  }, []);

  // Check backend access for authenticated users
  const checkFeatureAccess = async () => {
    try {
      const response = await api.get("/features/check-medication-qa-access/");
      setUserPlan(response.data.plan);
      setQuestionsAllowed(response.data.questions_allowed);
      if (!response.data.has_access) {
        setShowLimitMessage(true);
      }
    } catch (error) {
      console.error("Error checking feature access:", error);
    }
  };

  const incrementQACount = () => {
    const newCount = qaCount + 1;
    setQACount(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());

    if (newCount >= MEDICATION_QA_LIMIT) {
      setShowLimitMessage(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");

    if (!question.trim() || (showLimitMessage && !accessToken)) return;

    setIsLoading(true);
    setResponse(null);

    if (!accessToken) {
      incrementQACount();
    }

    try {
      const headers = accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {};

      const res = await api.post("medications/ask/", { question }, { headers });
      setResponse(res.data);
    } catch (err: any) {
      let errorMsg = "Sorry, we couldn't get a response. Please try again later.";
      
      if (err?.response?.data?.error === "message_limit_reached") {
        errorMsg = `You've reached your monthly medication question limit. ${
          userPlan === "free"
            ? "Upgrade your plan to continue using this feature."
            : "Please try again next month."
        }`;
        
        // Force update the UI to show upgrade options
        if (!userPlan) {
          try {
            const response = await api.get("/features/check-feature-access/?feature=medication_qa");
            setUserPlan(response.data.plan);
            setQuestionsAllowed(response.data.questions_allowed);
          } catch (error) {
            console.error("Error checking feature access:", error);
          }
        }
        setShowLimitMessage(true);
      } else if (err?.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err?.response?.data?.error) {
        errorMsg += `\n${err.response.data.error}`;
      }

      setResponse({ summary: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has reached the limit
  const accessToken = localStorage.getItem("accessToken");
  const hasReachedLimit =
    showLimitMessage ||
    (!accessToken && qaCount >= MEDICATION_QA_LIMIT) ||
    (userPlan === "free" && qaCount >= (questionsAllowed || 10));

  const safetyTips = [
    {
      icon: <Pill className="h-5 w-5 text-primary" />,
      title: "Take as Prescribed",
      description:
        "Always follow the dosage and timing instructions provided by your healthcare provider.",
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "Consistent Timing",
      description:
        "Take medications at the same time each day to maintain steady levels in your system.",
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      title: "Watch for Side Effects",
      description:
        "Monitor for any unusual symptoms and report them to your healthcare provider immediately.",
    },
    {
      icon: <Info className="h-5 w-5 text-primary" />,
      title: "Keep Updated Lists",
      description:
        "Maintain an accurate list of all medications and supplements you're taking.",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medication Q&A
          </h1>
          <p className="text-gray-600">
            Get general information about medications, interactions, and safety
            guidelines.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Important Medical Disclaimer
              </h3>
              <p className="text-sm text-red-700">
                This tool provides general medication information only. Always
                consult your healthcare provider, pharmacist, or read the
                medication label for specific dosing, interactions, and safety
                information. Never start, stop, or change medications without
                professional medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Question Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {hasReachedLimit && (
            <div className="mb-6 bg-white border border-yellow-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="font-medium text-gray-900">
                  {!accessToken
                    ? "Limit Reached"
                    : userPlan === "free"
                    ? "Monthly Limit Reached"
                    : "Limit Reached"}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {!accessToken
                  ? `You've used your ${MEDICATION_QA_LIMIT} free medication questions. Sign in to continue.`
                  : userPlan === "free"
                  ? `You've used all ${questionsAllowed} free medication questions this month. Upgrade to continue.`
                  : "You need to be subscribed to continue using this feature."}
              </p>
              <div className="mt-4 flex gap-2">
                {!accessToken ? (
                  <button
                    onClick={() =>
                      navigate(
                        `/auth?from=${encodeURIComponent(location.pathname)}`
                      )
                    }
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                  >
                    Sign In
                  </button>
                ) : userPlan === "free" ? (
                  <>
                    <Link
                      to="/pricing"
                      className="flex-1 text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                    >
                      Upgrade Plan
                    </Link>
                    <button
                      onClick={() => setShowLimitMessage(false)}
                      className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Dismiss
                    </button>
                  </>
                ) : (
                  <Link
                    to="/pricing"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                  >
                    View Plans
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="medication-question"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ask about your medications
              </label>
              <textarea
                id="medication-question"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none disabled:opacity-50"
                placeholder={
                  hasReachedLimit
                    ? accessToken
                      ? "Upgrade your plan to continue asking about medications..."
                      : "Sign in to continue asking about medications..."
                    : "Ask about your medications... (e.g., Can I take ibuprofen with acetaminophen? What are the side effects of...?)"
                }
                required
                disabled={hasReachedLimit}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !question.trim() || hasReachedLimit}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Getting Information...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Get Medication Info
                </>
              )}
            </button>
          </form>

          {userPlan === "free" && !hasReachedLimit && (
            <div className="text-xs text-gray-500 mt-2 text-right">
              Medication questions used: {qaCount}/{questionsAllowed}
            </div>
          )}
          {!hasReachedLimit && !accessToken && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Free medication questions remaining:{" "}
              {MEDICATION_QA_LIMIT - qaCount} of {MEDICATION_QA_LIMIT}
            </p>
          )}
        </div>

        {/* Response */}
        {response && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 text-primary mr-2" />
              Medication Information
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                <strong>Summary:</strong> {response.summary}
              </p>
              {response.precautions && response.precautions.length > 0 && (
                <>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    <strong>Precautions:</strong>
                  </p>
                  <ul className="list-disc ml-6">
                    {response.precautions.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="text-gray-700 leading-relaxed mt-2">
                <strong>Advice:</strong> {response.advice}
              </p>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Remember:</strong> This is general information only.
                Always consult your healthcare provider or pharmacist for
                personalized medication advice.
              </p>
            </div>
          </div>
        )}

        {/* Safety Tips */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Medication Safety Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">{tip.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Emergency Situations
            </h3>
            <p className="text-sm text-gray-700">
              If you experience severe allergic reactions, difficulty breathing,
              chest pain, or other serious side effects, seek immediate medical
              attention or call emergency services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationQA;