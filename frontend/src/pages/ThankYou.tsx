import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Loader2, XCircle } from "lucide-react";
import api from "../lip/api";

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type") || "signup";
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(!!sessionId);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 5;

  useEffect(() => {
    if (!sessionId) return;

    const checkSubscription = async () => {
      try {
        const response = await api.get("/billing/subscription-status/");
        // Check if response has valid data (even if free plan)
        if (response.data) {
          // Success case - plan is not free
          if (response.data.plan && response.data.plan !== "free") {
            setVerified(true);
            setLoading(false);
            return;
          }
          // Still free plan but valid response
          if (retryCount.current < maxRetries) {
            retryCount.current += 1;
            setTimeout(checkSubscription, 2000);
            return;
          }
        }
        // If we get here, either no data or max retries reached
        setLoading(false);
        setError(
          response.data?.error ||
            "Subscription verification timed out. Please check your account status."
        );
      } catch (err: any) {
        console.error("Subscription verification error:", err);
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          setTimeout(checkSubscription, 2000);
        } else {
          setLoading(false);
          setError(
            err.response?.data?.error ||
              err.message ||
              "We couldn't verify your subscription. Please check your account or contact support."
          );
        }
      }
    };
    // Start verification after a brief delay
    const timer = setTimeout(checkSubscription, 1000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  const getContent = () => {
    if (error) {
      return {
        title: "Verification Failed",
        message: error,
        buttonText: null,
        buttonLink: null,
      };
    }

    if (loading) {
      return {
        title: "Processing your subscription...",
        message: "Please wait while we verify your payment.",
        buttonText: null,
        buttonLink: null,
      };
    }

    if (verified) {
      return {
        title: "Thank you for subscribing!",
        message:
          "Your subscription has been activated. You now have access to all premium features.",
        buttonText: null,
        buttonLink: null,
      };
    }

    // Default content for other types
    switch (type) {
      case "subscription":
        return {
          title: "Payment Processed!",
          message:
            "Thank you for your subscription. Your access will be available shortly.",
          buttonText: null,
          buttonLink: null,
        };
      case "signup":
        return {
          title: "Welcome to AskDr.AI!",
          message:
            "Your account has been created successfully. Start your health journey with our AI assistant.",
          buttonText: null,
          buttonLink: null,
        };
      case "contact":
        return {
          title: "Message sent successfully!",
          message:
            "Thank you for contacting us. We'll get back to you within 24 hours.",
          buttonText: null,
          buttonLink: null,
        };
      default:
        return {
          title: "Thank you!",
          message: "Your action has been completed successfully.",
          buttonText: null,
          buttonLink: null,
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          {error ? (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          ) : loading ? (
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {content.title}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {content.message}
          </p>
        </div>

        <div className="space-y-4">
          {/* Only show Return to Home link */}
          <Link
            to="/"
            className="w-full bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-dark transition-all duration-200 transform hover:scale-105 flex items-center justify-center group"
          >
            Return to Home
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Additional information for successful subscriptions */}
        {(verified || (type === "subscription" && !loading && !error)) && (
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

        {/* Support contact for errors */}
        {error && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at support@askdrai.com
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThankYou;
