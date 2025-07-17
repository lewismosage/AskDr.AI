// StripePayment.tsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Immediately trigger the Stripe Checkout when component mounts
  useEffect(() => {
    const initiateCheckout = async () => {
      if (!stripe) return;

      setLoading(true);
      setError(null);

      try {
        // Create subscription on backend
        const response = await api.post("/billing/create-subscription/", {
          plan: plan.name.toLowerCase(),
          billing_cycle: plan.billingCycle,
        });

        const { sessionId } = response.data;

        // Redirect to Stripe Checkout
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (stripeError) {
          setError(stripeError.message || "Payment failed");
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || "An unexpected error occurred");
        } else {
          setError("An unexpected error occurred");
        }
      }
    };

    initiateCheckout();
  }, [stripe, plan.name, plan.billingCycle]);

  if (error) {
    return (
      <div className="text-center p-8">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Back to Plans
        </button>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Redirecting to Secure Checkout...
      </h3>
      <p className="text-gray-600 mb-6">
        Please wait while we prepare your payment details.
      </p>
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
