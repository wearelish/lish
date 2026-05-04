/**
 * Razorpay integration utility
 * Loads the Razorpay checkout script and opens the payment modal.
 *
 * Usage:
 *   const pay = useRazorpay();
 *   await pay({ amount: 5000, currency: "INR", name: "Project Advance", description: "40% upfront", onSuccess, onFailure });
 *
 * NOTE: Set VITE_RAZORPAY_KEY_ID in your .env file.
 * The key is safe to expose on the frontend (it's a publishable key).
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  /** Amount in smallest currency unit (paise for INR, cents for USD) */
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  /** Pre-fill customer info */
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

export async function openRazorpay(options: RazorpayOptions): Promise<void> {
  const loaded = await loadScript();
  if (!loaded) {
    throw new Error("Failed to load Razorpay SDK. Check your internet connection.");
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("VITE_RAZORPAY_KEY_ID is not set in environment variables.");
  }

  const rzp = new window.Razorpay({
    key: keyId,
    amount: options.amount,
    currency: options.currency ?? "INR",
    name: options.name ?? "LISH",
    description: options.description ?? "Payment",
    image: "/logo.png",
    prefill: options.prefill ?? {},
    theme: {
      color: "#E8AEB7",
      backdrop_color: "rgba(0,0,0,0.5)",
    },
    modal: {
      ondismiss: () => options.onDismiss?.(),
    },
    handler: (response: any) => {
      options.onSuccess(response);
    },
  });

  rzp.on("payment.failed", (response: any) => {
    options.onFailure?.(response.error);
  });

  rzp.open();
}

/** Convert USD to INR paise (approximate, for display purposes) */
export function usdToInrPaise(usd: number, rate = 83): number {
  return Math.round(usd * rate * 100);
}
