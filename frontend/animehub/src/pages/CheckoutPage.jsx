import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Truck, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { cartItems, totalPrice } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    street: '',
    city: '',
    zip: ''
  });

  const handleInputChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error("AUTH_REQUIRED: Please login to authorize transaction.");
      }

      // Fallback to localhost if env variable is missing, but backticks are key here!
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const response = await fetch(`${API_BASE}/api/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          origin_url: window.location.origin,
          shippingDetails: {
            street: shippingDetails.street,
            city: shippingDetails.city,
            zip: shippingDetails.zip,
            country: "Cyber-State"
          }
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirecting to Stripe Checkout session
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Uplink failed: No session URL received");
      }
    } catch (error) {
      console.error("Stripe Redirect Error:", error);
      toast({
        title: "CONNECTION_ERROR",
        description: error.message || "Failed to establish secure payment tunnel.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-6">
        <ShieldCheck className="text-[#ff0055] h-8 w-8" />
        <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">
          Secure <span className="text-[#00f0ff]">Checkout</span>
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left: Shipping Form */}
        <form onSubmit={handlePayment} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-[#00f0ff] font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              <Truck size={14} /> Shipping Coordinates
            </h3>
            
            <Input 
              name="name"
              placeholder="Full Legal Name" 
              className="bg-gray-900 border-gray-800 text-white focus:border-[#00f0ff]" 
              value={shippingDetails.name}
              onChange={handleInputChange}
              required 
            />
            <Input 
              name="street"
              placeholder="Sector / Shipping Address" 
              className="bg-gray-900 border-gray-800 text-white" 
              value={shippingDetails.street}
              onChange={handleInputChange}
              required 
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                name="city"
                placeholder="City" 
                className="bg-gray-900 border-gray-800 text-white" 
                value={shippingDetails.city}
                onChange={handleInputChange}
                required 
              />
              <Input 
                name="zip"
                placeholder="Neural Zip" 
                className="bg-gray-900 border-gray-800 text-white" 
                value={shippingDetails.zip}
                onChange={handleInputChange}
                required 
              />
            </div>

            <div className="p-3 bg-black/50 border border-gray-800 rounded text-[10px] text-gray-400 font-mono">
              &gt; AUTH_ID: {localStorage.getItem('user_id') || 'SESSION_ACTIVE'} <br />
              &gt; STATUS: ENCRYPTED_UPLINK
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading || cartItems.length === 0}
            className="w-full bg-[#ff0055] hover:bg-[#ff0055]/90 text-white font-black py-6 text-lg shadow-[0_0_20px_rgba(255,0,85,0.4)] transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                INITIATING UPLINK...
              </>
            ) : (
              "AUTHORIZE PAYMENT"
            )}
          </Button>
        </form>

        {/* Right: Manifest Summary */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl h-fit">
          <h2 className="text-white font-bold mb-4 uppercase tracking-tight">Cargo Manifest</h2>
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.id || item._id} className="flex justify-between text-sm font-mono">
                <span className="text-gray-400 truncate max-w-[200px]">
                  {item.name || item.product?.name} (x{item.quantity})
                </span>
                <span className="text-white">
                  ${((item.price || item.product?.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
            <span className="text-gray-400 uppercase text-xs font-mono">Total Credits</span>
            <span className="text-3xl font-black text-[#00f0ff] tracking-tighter">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}