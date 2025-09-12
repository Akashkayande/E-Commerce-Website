// frontend/components/StripeButton.jsx
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

    try {
      // 1. Ask backend to create a PaymentIntent in USD
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/create-payment-intent`,
        {}, // ✅ backend uses DB totalPrice, so no need to send amount
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
        }
      );

      const clientSecret = data.clientSecret; // ✅ correctly extract

      // 2. Confirm card payment on frontend
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        console.error("Stripe Payment Error:", result.error);
        if (onError) onError(result.error);
      } else if (result.paymentIntent.status === "succeeded") {
        console.log("✅ Payment succeeded:", result.paymentIntent);

        // 3. Tell backend checkout is paid
        const response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
          { paymentIntentId: result.paymentIntent.id },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
          }
        );

        if (onSuccess) onSuccess(response.data.checkout);
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
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
