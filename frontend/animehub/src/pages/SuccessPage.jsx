import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, Loader2, ShieldAlert } from "lucide-react"; 
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import api from "../services/api";

export default function SuccessPage() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [orderData, setOrderData] = useState(null);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyAndSaveOrder = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        // 1. VERIFY PAYMENT STATUS (Using your api service)
        // This automatically handles the BASE_URL and the Bearer token
        const verifyRes = await api.get(`/payment/status/${sessionId}`);
        const verifyData = verifyRes.data;

        if (verifyData.success && verifyData.data.payment_status === "paid") {
          const stripeSession = verifyData.data;

          // 2. TRIGGER ORDER CREATION IN MONGODB
          const orderResponse = await api.post('/orders', {
            items: stripeSession.metadata.items ? JSON.parse(stripeSession.metadata.items) : [],
            total_amount: stripeSession.amount_total / 100,
            payment_session_id: sessionId,
            shipping_address: {
              street: stripeSession.customer_details?.address?.line1 || "Digital Delivery",
              city: stripeSession.customer_details?.address?.city || "Neo-Tokyo",
              zip: stripeSession.customer_details?.address?.postal_code || "000000",
              country: stripeSession.customer_details?.address?.country || "JP"
            },
            payment_method: 'Stripe'
          });

          const orderResult = orderResponse.data;

          if (orderResult.success) {
            setStatus("success");
            setOrderData(stripeSession);
            clearCart(); 
          } else {
            setStatus("error");
          }
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Critical Uplink Error:", error);
        setStatus("error");
      }
    };

    verifyAndSaveOrder();
  }, [sessionId, clearCart]);
  // --- UI: LOADING ---
  if (status === "verifying") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <Loader2 className="h-12 w-12 text-[#00f0ff] animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-mono text-white italic tracking-widest">VERIFYING TRANSACTION...</h2>
      </div>
    );
  }

  // --- UI: ERROR ---
  if (status === "error") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <ShieldAlert className="h-12 w-12 text-[#ff0055] mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-4 uppercase">Verification Failed</h2>
        <p className="text-gray-400 mb-8">We couldn't confirm the order. If funds were deducted, contact sys-admin.</p>
        <Link to="/cart"><Button variant="outline" className="border-gray-800">RETURN TO CART</Button></Link>
      </div>
    );
  }

  // --- UI: SUCCESS ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 mb-8">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </div>

      <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-4">
        Payment <span className="text-[#00f0ff]">Secured</span>
      </h1>
      <p className="text-gray-400 font-mono mb-12 uppercase tracking-[0.2em]">
        RECEIPT_ID: {sessionId.slice(-12)}
      </p>

      <div className="max-w-md mx-auto bg-gray-900/40 border border-gray-800 p-8 rounded-2xl mb-12 backdrop-blur-sm">
        <Package className="mx-auto h-8 w-8 text-[#ff0055] mb-4" />
        <h3 className="text-white font-bold text-xl mb-2">Order Archive Created</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Your purchase has been logged in the mainframe. You can track your shipment status in your transaction archives.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/">
          <Button className="bg-[#00f0ff] text-black font-bold px-8 hover:bg-[#00f0ff]/80">
            RETURN TO TERMINAL
          </Button>
        </Link>
        <Link to="/orders">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
            TRANSACTION ARCHIVES <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}