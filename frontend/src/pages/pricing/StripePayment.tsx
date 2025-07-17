// StripePayment.tsx
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import api from "../../lip/api";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentProps {
  plan: {
    name: string;
    price: string;
    billingCycle: "monthly" | "annual";
  };
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentForm = ({ plan, onBack, onSuccess }: StripePaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create subscription on backend
      const response = await api.post('/billing/create-subscription/', {
        plan: plan.name.toLowerCase(),
        billing_cycle: plan.billingCycle
      });

      const { sessionId } = response.data;

      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "An unexpected error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    }    
  };

  if (success) {
    return (
      <div className="text-center p-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600 mb-6">
          You've successfully subscribed to {plan.name} ({plan.billingCycle}).
        </p>
        <button
          onClick={onSuccess}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Complete Your Subscription
      </h2>
      <p className="text-gray-600 mb-6">
        You're subscribing to <span className="font-semibold">{plan.name}</span>{" "}
        plan at <span className="font-semibold">{plan.price}</span> per{" "}
        {plan.billingCycle === "monthly" ? "month" : "year"}.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>

        {error && (
          <div className="flex items-center text-red-500 mb-4">
            <XCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Plans
          </button>
          <button
            type="submit"
            disabled={!stripe || loading}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : `Subscribe for ${plan.price}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export const StripePayment = ({
  plan,
  onBack,
  onSuccess,
}: StripePaymentProps) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm plan={plan} onBack={onBack} onSuccess={onSuccess} />
    </Elements>
  );
};