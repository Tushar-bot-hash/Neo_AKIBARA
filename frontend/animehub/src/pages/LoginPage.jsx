// In LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("🔐 Attempting login with:", { email, password }); // Debug

    try {
      const result = await login(email, password);
      
      if (result.success) {
        console.log("✅ Login successful:", result.user);
        navigate("/");
      } else {
        setError(result.error || "Login failed");
        console.log("❌ Login failed:", result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("❌ Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Login to NEO-AKIHABARA</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your credentials to access your cyber account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="cyber@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black border-gray-800"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-[#00f0ff] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black border-gray-800"
                required
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent mr-2" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#ff0055] hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;