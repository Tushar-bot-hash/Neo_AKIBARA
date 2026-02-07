import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  // If cartItems is null or empty, show empty state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto text-center py-32">
        <ShoppingCart className="h-24 w-24 mx-auto text-gray-800 mb-6 animate-pulse" />
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 font-mono">NO SIGNAL DETECTED. PLEASE ACQUIRE GEAR.</p>
        <Link to="/">
          <Button className="bg-[#00f0ff] text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            RETURN TO SHOP
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-black italic tracking-tighter mb-12 uppercase">
        Current <span className="text-[#ff0055]">Cargo</span>
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Item List */}
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => {
            // BACKEND uses .product for populated data
            const product = item.product || {}; 
            const itemId = item._id; // MongoDB unique ID for the cart record

            return (
              <Card key={itemId} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="h-24 w-24 bg-black border border-gray-800 rounded overflow-hidden shrink-0">
                        <img 
                          src={product.image_url || "/api/placeholder/100/100"} 
                          alt={product.name} 
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white uppercase tracking-tight">
                          {product.name || "Unknown Artifact"}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="border-gray-700 text-gray-400 text-[10px]">VERIFIED_ORIGINAL</Badge>
                        </div>
                        <p className="text-[#00f0ff] font-black text-2xl mt-2">
                          ${(product.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center gap-3 bg-black p-1 rounded border border-gray-800">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-gray-400 hover:text-white"
                          onClick={() => updateQuantity(itemId, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-mono font-bold text-white">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-gray-400 hover:text-white"
                          onClick={() => updateQuantity(itemId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => removeFromCart(itemId)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        REMOVE
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Order Summary */}
        <div className="relative">
          <Card className="bg-black border-2 border-[#ff0055] sticky top-24 shadow-[0_0_20px_rgba(255,0,85,0.1)]">
            <CardHeader className="border-b border-gray-900">
              <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] text-gray-400">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-xs font-mono">
                    <span className="text-gray-500">
                      {(item.product?.name || "Artifact")} × {item.quantity}
                    </span>
                    <span className="text-gray-300">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-mono text-gray-500 uppercase">Total Credits</span>
                  <span className="text-4xl font-black text-[#00f0ff] tracking-tighter">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link to="/checkout" className="block w-full">
                  <Button 
                    className="w-full bg-[#ff0055] hover:bg-[#ff0055]/90 h-14 text-lg font-black italic tracking-widest text-white shadow-[0_0_15px_rgba(255,0,85,0.3)]"
                  >
                    PROCEED_TO_CHECKOUT
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-500 hover:text-white text-xs font-mono"
                  onClick={clearCart}
                >
                  ABORT_ORDER (CLEAR)
                </Button>
              </div>
              
              <div className="text-[10px] font-mono text-gray-700 leading-tight">
                SECURE UPLINK ESTABLISHED... <br />
                ENCRYPTION: AES-256-GCM <br />
                LOCATION: NEO-TOKYO HUB
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}