import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ checkoutId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    console.log("🔹 Starting Stripe payment for checkoutId:", checkoutId);

    try {
      // 1️⃣ Create PaymentIntent on backend
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/create-payment-intent`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
      );
      console.log("🔹 Client secret received from backend:", data.clientSecret);

      // 2️⃣ Confirm card payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        console.error("❌ Stripe payment error:", result.error);
        if (onError) onError(result.error);
      } else if (result.paymentIntent.status === "succeeded") {
        console.log("✅ Stripe payment succeeded:", result.paymentIntent);
        if (onSuccess) onSuccess(result.paymentIntent);
      }
    } catch (err) {
      console.error("❌ Unexpected Stripe error:", err);
      if (onError) onError(err);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
      <CardElement options={{ hidePostalCode: true }} />
      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          background: "#6772e5",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Processing..." : `Pay $${amount}`}
      </button>
    </form>
  );
};

const StripeButton = ({ checkoutId, amount, onSuccess, onError }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm checkoutId={checkoutId} amount={amount} onSuccess={onSuccess} onError={onError} />
  </Elements>
);

export default StripeButton;
