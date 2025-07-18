import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Search, AlertTriangle, Lock } from "lucide-react";
import { fetchNearbyClinics } from "../../lip/apiHelpers";
import api from "../../lip/api";

// Constants
const SYMPTOM_CHECK_LIMIT = 10;
const STORAGE_KEY = "symptomCheckCount";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [note, setNote] = useState<string>("");
  const [checkCount, setCheckCount] = useState(0);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "plus" | "pro" | null>(
    null
  );
  const [checksAllowed, setChecksAllowed] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize check count from localStorage
  useEffect(() => {
    const storedCount = localStorage.getItem(STORAGE_KEY);
    const count = storedCount ? parseInt(storedCount) : 0;
    setCheckCount(count);

    if (count >= SYMPTOM_CHECK_LIMIT) {
      setShowLimitMessage(true);
    }
  }, []);

  // Check authentication status and plan
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // Clear the check limit for authenticated users
      localStorage.removeItem(STORAGE_KEY);
      setCheckCount(0);
      setShowLimitMessage(false);
      checkFeatureAccess(); // Check user's plan and check limits
    }
  }, []);

  // Check backend access for authenticated users
  const checkFeatureAccess = async () => {
    try {
      const response = await api.get("/features/check-symptom-access/");
      setUserPlan(response.data.plan);
      setChecksAllowed(response.data.checks_allowed);
      if (!response.data.has_access) {
        setShowLimitMessage(true);
      }
    } catch (error) {
      console.error("Error checking feature access:", error);
    }
  };

  const incrementCheckCount = () => {
    const newCount = checkCount + 1;
    setCheckCount(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());

    if (newCount >= SYMPTOM_CHECK_LIMIT) {
      setShowLimitMessage(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");

    if (!symptoms.trim() || (showLimitMessage && !accessToken)) return;

    setIsLoading(true);
    setResults([]);
    setNote("");

    if (!accessToken) {
      incrementCheckCount();
    }

    try {
      const headers = accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {};

      const res = await api.post("/symptoms/check/", { symptoms }, { headers });
      const data = res.data || {};
      setResults(data.conditions || []);
      setNote(data.note || "");
    } catch (error: any) {
      let errorMsg = "Sorry, there was an error analyzing your symptoms.";

      if (error?.response?.data?.error === "message_limit_reached") {
        errorMsg = `You've reached your monthly symptom check limit. ${
          userPlan === "free"
            ? "Upgrade your plan to continue using this feature."
            : "Please try again next month."
        }`;

        // Force update the UI to show upgrade options
        if (!userPlan) {
          try {
            const response = await api.get(
              "/features/check-feature-access/?feature=symptom_check"
            );
            setUserPlan(response.data.plan);
            setChecksAllowed(response.data.checks_allowed);
          } catch (err) {
            console.error("Error checking feature access:", err);
          }
        }
        setShowLimitMessage(true);
      } else if (error?.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error?.response?.data?.error) {
        errorMsg += `\n${error.response.data.error}`;
      }

      setNote(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Clinic state and handler
  const [clinics, setClinics] = useState<any[]>([]);
  const [clinicError, setClinicError] = useState<string | null>(null);
  const [isClinicLoading, setIsClinicLoading] = useState(false);

  const handleFindDoctor = () => {
    if (!navigator.geolocation) {
      setClinicError("Geolocation is not supported by your browser.");
      return;
    }
    setIsClinicLoading(true);
    setClinicError(null);
    setClinics([]);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetchNearbyClinics(latitude, longitude);
          setClinics(res.data.clinics || []);
        } catch (error) {
          setClinicError(
            "Could not fetch nearby clinics. Please try again later."
          );
        } finally {
          setIsClinicLoading(false);
        }
      },
      () => {
        setClinicError(
          "Unable to retrieve your location. Please allow location access."
        );
        setIsClinicLoading(false);
      }
    );
  };

  // Check if user has reached the limit
  const accessToken = localStorage.getItem("accessToken");
  const hasReachedLimit =
    showLimitMessage ||
    (!accessToken && checkCount >= SYMPTOM_CHECK_LIMIT) ||
    (userPlan === "free" && checkCount >= (checksAllowed || 5));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Symptom Checker
          </h1>
          <p className="text-gray-600">
            Describe your symptoms and get AI-powered insights into possible
            conditions.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                Medical Disclaimer
              </h3>
              <p className="text-sm text-yellow-700">
                This tool is for informational purposes only and is not a
                substitute for professional medical advice, diagnosis, or
                treatment. Always consult with a healthcare provider for medical
                concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Symptom Input Form */}
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
                  ? `You've used your ${SYMPTOM_CHECK_LIMIT} free symptom checks. Sign in to continue.`
                  : userPlan === "free"
                  ? `You've used all ${checksAllowed} free symptom checks this month. Upgrade to continue.`
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
                htmlFor="symptoms"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Describe your symptoms
              </label>
              <textarea
                id="symptoms"
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none disabled:opacity-50"
                placeholder={
                  hasReachedLimit
                    ? accessToken
                      ? "Upgrade your plan to continue using symptom checker..."
                      : "Sign in to continue using symptom checker..."
                    : "Describe your symptoms here... (e.g., I have been experiencing a runny nose, sneezing, and mild headache for the past 2 days)"
                }
                required
                disabled={hasReachedLimit}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !symptoms.trim() || hasReachedLimit}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Analyze Symptoms
                </>
              )}
            </button>
          </form>

          {userPlan === "free" && !hasReachedLimit && (
            <div className="text-xs text-gray-500 mt-2 text-right">
              Symptom checks used: {checkCount}/{checksAllowed}
            </div>
          )}
          {!hasReachedLimit && !accessToken && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Free symptom checks remaining: {SYMPTOM_CHECK_LIMIT - checkCount}{" "}
              of {SYMPTOM_CHECK_LIMIT}
            </p>
          )}
        </div>

        {/* Results */}
        {(results.length > 0 || note) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Possible Conditions
            </h2>
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {result.name}
                </h3>
                <div className="flex items-center space-x-4 mb-3">
                  {result.probability && (
                    <span className="text-sm text-gray-600">
                      <strong>Probability:</strong> {result.probability}
                    </span>
                  )}
                  {result.severity && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        result.severity.toLowerCase() === "mild"
                          ? "text-green-600 bg-green-100"
                          : result.severity.toLowerCase() === "moderate"
                          ? "text-yellow-600 bg-yellow-100"
                          : result.severity.toLowerCase() === "severe"
                          ? "text-red-600 bg-red-100"
                          : "text-gray-600 bg-gray-100"
                      }`}
                    >
                      {result.severity}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{result.advice}</p>
              </div>
            ))}
            {(note || true) && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                {note && <p className="text-gray-700 mb-4">{note}</p>}
                <h3 className="font-semibold text-gray-900 mb-2">
                  Need More Help?
                </h3>
                <p className="text-gray-600 mb-4">
                  For a more detailed consultation, try our AI assistant or
                  consult with a healthcare professional.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/chat"
                    className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200"
                  >
                    Chat with AI Assistant
                  </Link>
                  <button
                    onClick={handleFindDoctor}
                    className="border border-primary text-primary px-6 py-2 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors duration-200"
                  >
                    {isClinicLoading ? "Searching..." : "Find a Doctor"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clinics Results and Error */}
        {clinics.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Clinics Near You
            </h3>
            <ul className="space-y-4">
              {clinics.map((clinic, idx) => (
                <li key={idx} className="bg-white p-4 rounded-lg shadow-md">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {clinic.name}
                  </h4>
                  <p className="text-gray-600">{clinic.address}</p>
                  {clinic.rating && (
                    <p className="text-sm text-gray-500">
                      Rating: {clinic.rating}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Lat: {clinic.location?.lat}, Lng: {clinic.location?.lng}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {clinicError && (
          <p className="text-sm text-red-600 mt-4 text-center">{clinicError}</p>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;
