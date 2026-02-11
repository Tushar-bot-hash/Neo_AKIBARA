import { Routes, Route, Link } from "react-router-dom";
import { Home, Package, Info, ShoppingCart, User, Search, LogOut, Gamepad2, Shirt, Images, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import HomePage from "@/pages/HomePage";
import CartPage from "@/pages/CartPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import ProtectedRoute from "@/pages/ProtectedRoute";
import AboutPage from "@/pages/AboutPage";
import SuccessPage from "@/pages/SuccessPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderHistory from '@/pages/OrderHistory'; // Ensure path is correct
import { Toaster } from "@/components/ui/toaster";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import "./index.css";

function Navigation() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

 const animeCategories = [
  {
    title: "Figures & Collectibles",
    icon: <Gamepad2 className="h-4 w-4" />,
    items: [
      { name: "Evangelion Series", href: "/products/evangelion-series" },
      { name: "Gundam Models", href: "/products/gundam-models" },
      { name: "Nendoroids", href: "/products/nendoroids" },
      { name: "Scale Figures", href: "/products/scale-figures" },
    ]
  },
  {
    title: "Apparel",
    icon: <Shirt className="h-4 w-4" />,
    items: [
      { name: "Cyber-Goth Hoodies", href: "/products/cyber-goth-hoodies" },
      { name: "Anime T-Shirts", href: "/products/anime-t-shirts" },
      { name: "Jackets & Outerwear", href: "/products/jackets-outerwear" },
      { name: "Accessories", href: "/products/accessories" },
    ]
  },
  {
    title: "Art & Media",
    icon: <Images className="h-4 w-4" />,
    items: [
      { name: "Posters & Prints", href: "/products/posters-prints" },
      { name: "Art Books", href: "/products/art-books" },
      { name: "Blu-ray Collections", href: "/products/blu-ray-collections" },
      { name: "Soundtracks", href: "/products/soundtracks" },
    ]
  }
];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 py-4 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold tracking-tight hover:text-[#00f0ff] transition-colors">
            NEO-<span className="text-[#ff0055]">AKIHABARA</span>
          </Link>
          
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/" className="group inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors text-gray-300 hover:text-[#00f0ff] focus:outline-none">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-gray-300 hover:bg-transparent hover:text-[#00f0ff] data-[state=open]:text-[#00f0ff] data-[state=open]:bg-transparent">
                  <Package className="mr-2 h-4 w-4" />
                  Shop
                </NavigationMenuTrigger>
                <NavigationMenuContent className="border border-gray-800 bg-black p-4 shadow-2xl">
                  <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px]">
                    {animeCategories.map((category) => (
                      <div key={category.title} className="space-y-3">
                        <div className="flex items-center gap-2 font-bold text-[#00f0ff] text-xs uppercase tracking-widest border-b border-gray-800 pb-2">
                          {category.icon}
                          {category.title}
                        </div>
                        <ul className="space-y-1">
                          {category.items.map((item) => (
                            <li key={item.name}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.href}
                                  className="block rounded-md px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-900 transition-all duration-200"
                                >
                                  {item.name}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/about" className="group inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors text-gray-300 hover:text-[#00f0ff] focus:outline-none">
                    <Info className="mr-2 h-4 w-4" />
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* --- CHANGE: CART ICON ONLY VISIBLE IF USER IS LOGGED IN --- */}
          {user && (
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-[#00f0ff] hover:bg-gray-900 relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff0055] text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse text-white font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/orders">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#00f0ff] font-mono text-[10px] tracking-widest uppercase hidden lg:flex">
                  <History className="h-4 w-4 mr-2" />
                  Archives
                </Button>
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055] hover:text-white transition-all">
                    Dashboard
                  </Button>
                </Link>
              )}
              <Link to="/profile">
                <Button variant="outline" size="sm" className="border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black transition-all">
                  <User className="h-4 w-4 mr-2" />
                  {user.name?.split(' ')[0] || 'Profile'}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="icon" 
                className="border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055] hover:text-white h-9 w-9" 
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black transition-all">
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00f0ff] selection:text-black">
      <Toaster />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22256%22 height=%22256%22 filter=%22url(%23noise)%22 opacity=%220.03%22/%3E%3C/svg%3E')] pointer-events-none z-50" />
      
      <Navigation />
      
      <main className="relative z-10">
        <Routes>
          // inside your Routes block in the App function:
       <Route path="/" element={<HomePage />} />

  <Route path="/cart" element={
   <ProtectedRoute>
    <CartPage />
   </ProtectedRoute>
                               } />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/order-success" element={<SuccessPage />} />
          
          {/* NEW ORDER HISTORY ROUTE */}
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          } />
          
          <Route path="/products/:category?" element={<HomePage />} />
          <Route path="/collections/:type?" element={<HomePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <footer className="border-t border-gray-800 p-8 mt-16 bg-black relative z-10">
        <div className="max-w-7xl mx-auto text-center text-gray-600 text-[10px] uppercase tracking-[0.4em]">
          <p>© 2026 NEO-AKIHABARA • 電脳秋葉原 • All systems operational</p>
        </div>
      </footer>
    </div>
  );
}

export default App;