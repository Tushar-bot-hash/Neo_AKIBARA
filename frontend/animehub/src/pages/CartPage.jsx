import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto text-center py-32">
        <ShoppingCart className="h-24 w-24 mx-auto text-gray-800 mb-6 animate-pulse" />
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 font-mono">NO SIGNAL DETECTED. PLEASE ACQUIRE GEAR.</p>
        <Link to="/">
          <Button className="bg-[#00f0ff] text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            RETURN TO SHOP
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-black italic tracking-tighter mb-12 uppercase text-white">
        Current <span className="text-[#ff0055]">Cargo</span>
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const product = item.product || {}; 
            const itemId = item._id; 

            return (
              <Card key={itemId} className="bg-gray-900/40 border-gray-800 hover:border-[#00f0ff]/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="h-24 w-24 bg-black border border-gray-800 rounded overflow-hidden shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                        <img 
                          src={product.image_url || "/api/placeholder/100/100"} 
                          alt={product.name} 
                          className="w-full h-full object-cover opacity-90"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white uppercase tracking-tight">
                          {product.name || "Unknown Artifact"}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="border-gray-700 text-gray-500 text-[9px] uppercase tracking-widest font-mono">
                            Verified_Original
                          </Badge>
                          
                          {/* NEW: Conditional Size Badge for Clothing */}
                          {item.size && item.size !== 'N/A' && (
                            <Badge className="bg-[#00f0ff] text-black text-[10px] font-black px-2 py-0.5">
                              DIMENSION: {item.size}
                            </Badge>
                          )}
                        </div>

                        <p className="text-[#00f0ff] font-black text-2xl mt-3 tracking-tighter">
                          ${(product.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center gap-3 bg-black p-1 rounded border border-gray-800">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-gray-400 hover:text-[#00f0ff] hover:bg-transparent"
                          onClick={() => updateQuantity(itemId, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-mono font-bold text-white text-sm">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-gray-400 hover:text-[#00f0ff] hover:bg-transparent"
                          onClick={() => updateQuantity(itemId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600 hover:text-[#ff0055] hover:bg-[#ff0055]/5 text-[10px] font-bold uppercase tracking-widest"
                        onClick={() => removeFromCart(itemId)}
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Discard_Item
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="relative">
          <Card className="bg-[#0a0a0c] border-2 border-[#ff0055] sticky top-24 shadow-[0_0_30px_rgba(255,0,85,0.15)] overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <Box className="h-20 w-20 text-white" />
            </div>
            <CardHeader className="border-b border-gray-900 bg-white/5">
              <CardTitle className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-400">Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-[11px] font-mono border-l-2 border-gray-800 pl-3 py-1">
                    <div className="flex flex-col">
                        <span className="text-gray-300 uppercase font-bold">
                            {item.product?.name}
                        </span>
                        <span className="text-gray-500 text-[10px]">
                            Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}
                        </span>
                    </div>
                    <span className="text-[#00f0ff] font-bold">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-900 pt-4 bg-gradient-to-b from-transparent to-white/5">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Total Credits</span>
                  <span className="text-4xl font-black text-[#00f0ff] tracking-tighter drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link to="/checkout" className="block w-full">
                  <Button 
                    className="w-full bg-[#ff0055] hover:bg-[#ff0055]/90 h-14 text-lg font-black italic tracking-widest text-white shadow-[0_0_15px_rgba(255,0,85,0.3)] hover:shadow-[0_0_25px_rgba(255,0,85,0.6)] transition-all duration-300"
                  >
                    PROCEED_TO_CHECKOUT
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-600 hover:text-white text-[10px] font-mono hover:bg-transparent"
                  onClick={clearCart}
                >
                  ABORT_ORDER (PURGE_ALL)
                </Button>
              </div>
              
              <div className="text-[9px] font-mono text-gray-800 border-t border-gray-900 pt-4 uppercase leading-relaxed">
                Terminal: NEO-AKIHABARA-01 <br />
                Connection: Secure_Tunnel_Active <br />
                Status: Awaiting_Finalization
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}