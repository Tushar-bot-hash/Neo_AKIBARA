import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Key, Mail, User, Shield, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // FIXED: Use AuthContext, not CartContext
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const { signup } = useAuth(); // FIXED: Grab signup from AuthContext
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation Logic
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // 2. Call Signup from AuthContext
    // This function handles the API call, saves to LocalStorage, and updates 'setUser'
    const result = await signup(
      formData.name,
      formData.email,
      formData.password
    );

    setLoading(false);

    if (result.success) {
      toast({
        title: "Account created! ⚡",
        description: "Welcome to the cyber network.",
      });
      
      // 3. Redirect to Home
      // Because AuthContext updated the state, you will be logged in automatically!
      navigate("/"); 
    } else {
      toast({
        title: "Registration failed",
        description: result.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto py-16">
      <Card className="bg-gray-900 border-[#7000ff]">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#7000ff] to-[#ff0055] rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-black" />
          </div>
          <CardTitle className="text-2xl">Initialize Account</CardTitle>
          <CardDescription>
            Join the cyber marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Cyber Handle
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your display name"
                value={formData.name}
                onChange={handleChange}
                className="bg-black border-gray-800"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Neural ID
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@cyber.net"
                value={formData.email}
                onChange={handleChange}
                className="bg-black border-gray-800"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="h-4 w-4" /> Encryption Key
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="bg-black border-gray-800"
                required
                minLength="6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Confirm Key
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-black border-gray-800"
                required
                minLength="6"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#7000ff] to-[#ff0055] hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Initializing...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-gray-400">
            <p>Already have a cyber profile? <Link to="/login" className="text-[#00f0ff] hover:underline">Neural Login</Link></p>
            <Link to="/" className="mt-4 inline-block">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}