import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/badge";
import { ShoppingCart, Zap, Sparkles, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import api from "../services/api";

export default function HomePage() {
  const { category, type } = useParams(); 
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track selected size for each product by ID
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) {
          params.category = category;
        } else if (type) {
          params.collection = type; 
        } else {
          params.featured = 'true';
        }
        
        const res = await api.get('/products', { params });
        
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error("❌ Neural Link Failure:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, type]);

  // NEW: Handler for clicking a size button
  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const handleAddToCart = (product) => {
    if (!user) {
      toast({
        title: "Access Denied 🔐",
        description: "Please login to acquire artifacts.",
        variant: "destructive",
        className: "border-2 border-[#ff0055] bg-black text-white",
      });
      return;
    }

    // NEW: Logic to enforce size selection for clothing
    if (product.category === 'clothing' && !selectedSizes[product._id]) {
      toast({
        title: "Selection Required 📏",
        description: "Please select a dimension (size) for this garment.",
        variant: "destructive",
        className: "border-2 border-[#ff0055] bg-black text-white",
      });
      return;
    }

    const cartProduct = {
      id: product._id,
      title: product.name,
      price: product.price,
      image: product.image_url,
      // NEW: Include selected size in cart object
      size: selectedSizes[product._id] || 'N/A'
    };
    
    addToCart(cartProduct);
    toast({
      title: "Added to cart! ⚡",
      description: `${product.name} ${selectedSizes[product._id] ? `(${selectedSizes[product._id]})` : ''} added.`,
      className: "border-2 border-[#00f0ff] bg-black text-white",
    });
  };

  const displayTitle = (category || type || "Featured Artifacts").replace(/-/g, ' ');

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#00f0ff]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12 border-b border-gray-800 pb-8">
        <div className="flex items-center gap-3 mb-2">
          {type ? <Sparkles className="h-5 w-5 text-[#ff0055]" /> : <Zap className="h-5 w-5 text-[#00f0ff]" />}
          <span className="text-xs font-mono text-gray-500 uppercase tracking-[0.3em]">
            Terminal / {category ? "Category" : type ? "Collection" : "Prime"}
          </span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
          {displayTitle}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {products.length > 0 ? (
          products.map((product) => (
            <Card key={product._id} className="bg-gray-900/40 border-gray-800 hover:border-[#00f0ff]/50 transition-all group overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                    {product.name}
                  </CardTitle>
                  {product.featured && (
                    <Badge className="bg-[#ff0055] text-white border-none">PRIME</Badge>
                  )}
                </div>
                <CardDescription className="text-gray-400 line-clamp-2 italic text-xs">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 overflow-hidden rounded-md mb-6 bg-black border border-gray-800">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    onError={(e) => { e.target.src = "https://placehold.co/600x400/111/333?text=NO_SIGNAL"; }}
                  />
                </div>

                {/* NEW: Size Selection UI specifically for Clothing */}
                {product.category === 'clothing' && (
                  <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 block">
                      Select Dimension
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {['S', 'M', 'L', 'XL'].map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(product._id, size)}
                          className={`px-3 py-1 text-xs font-mono border transition-all duration-200 ${
                            selectedSizes[product._id] === size
                              ? "bg-[#00f0ff] border-[#00f0ff] text-black font-bold shadow-[0_0_10px_#00f0ff]"
                              : "border-gray-800 text-gray-500 hover:border-[#00f0ff] hover:text-[#00f0ff]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-auto">
                  <div>
                    <span className="text-[10px] text-gray-600 block uppercase tracking-widest">Price</span>
                    <span className="text-2xl font-black text-white">${product.price.toFixed(2)}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black font-bold"
                    onClick={() => handleAddToCart(product)}
                  >
                    ACQUIRE
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-32 border border-dashed border-gray-800 rounded-xl">
             <div className="text-gray-600 font-mono text-sm mb-4 animate-pulse">ERROR: DATA_NOT_FOUND</div>
             <p className="text-gray-500 italic">No artifacts matches your current frequency.</p>
             <Button 
                variant="link" 
                className="mt-4 text-[#ff0055]" 
                onClick={() => navigate('/')}
              >
                Return Home
              </Button>
          </div>
        )}
      </div>
    </div>
  );
}