import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, ArrowRight, Loader2, ShieldAlert } from "lucide-react"; 
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import api from "../services/api"; 

export default function SuccessPage() {
  const { cart, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  
  const processing = useRef(false);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyAndSaveOrder = async () => {
      if (!sessionId || processing.current) return;
      processing.current = true;

      try {
        // 1. Verify payment status from Stripe via your backend
        const verifyRes = await api.get(`/payment/status/${sessionId}`);
        const verifyData = verifyRes.data;

        // Stripe returns 'paid' when successful
        if (verifyData?.success && verifyData?.data?.payment_status === "paid") {
          
          /* NOTE: We don't need to 'POST /orders' here because 
             the backend already created the order as 'pending' 
             before the redirect. 
          */

          setStatus("success");
          clearCart(); // Clean up local state
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("CRITICAL_UPLINK_FAILURE:", error);
        setStatus("error");
      }
    };

    verifyAndSaveOrder();
  }, [sessionId, clearCart]); // Removed 'cart' from dependencies

  // --- UI RENDERING ---

  if (status === "verifying") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <Loader2 className="h-12 w-12 text-[#00f0ff] animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-mono text-white italic tracking-widest uppercase animate-pulse">Initializing_Secure_Log...</h2>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <ShieldAlert className="h-12 w-12 text-[#ff0055] mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-4 uppercase italic">Archive_Sync_Failed</h2>
        <p className="text-gray-400 mb-8 font-mono text-xs uppercase">Verification Error or Database Rejection</p>
        <Link to="/cart">
          <Button variant="outline" className="border-gray-800 text-[#00f0ff] hover:bg-[#00f0ff]/10">RE-INITIALIZE CART</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 mb-8 border border-green-500/20">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </div>

      <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-4 text-white">
        Payment <span className="text-[#00f0ff]">Secured</span>
      </h1>
      
      <p className="text-gray-500 font-mono mb-12 uppercase tracking-[0.2em] text-xs">
        TRANSACTION_HASH: {sessionId?.slice(-24).toUpperCase()}
      </p>

      <div className="max-w-md mx-auto bg-gray-900/40 border border-gray-800 p-8 rounded-2xl mb-12 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#ff0055]"></div>
        <Package className="mx-auto h-8 w-8 text-[#ff0055] mb-4" />
        <h3 className="text-white font-bold text-xl mb-2 uppercase tracking-tight">Manifest_Archived</h3>
        <p className="text-xs text-gray-400 leading-relaxed font-mono">
          YOUR PURCHASE DATA HAS BEEN SUCCESSFULLY INJECTED INTO THE TRANSACTION ARCHIVES.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/">
          <Button className="bg-[#00f0ff] text-black font-black px-8 hover:bg-[#00f0ff]/80 transition-all uppercase italic">
            Return to Terminal
          </Button>
        </Link>
        <Link to="/orders">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 transition-all uppercase font-mono text-xs">
            View Archives <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}