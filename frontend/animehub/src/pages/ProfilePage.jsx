import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Shield, ShoppingBag, History } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ProfilePage() {
  const { user, logout, updateProfile } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="text-4xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold mb-4">Access Required</h2>
        <p className="text-gray-400 mb-8">Please login to view your profile</p>
        <a href="/login">
          <Button className="bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90">
            Go to Login
          </Button>
        </a>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateProfile(formData);
    
    setLoading(false);

    if (result.success) {
      toast({
        title: "Profile updated!",
        description: "Your information has been saved.",
      });
    } else {
      toast({
        title: "Update failed",
        description: result.error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#00f0ff] to-[#7000ff] rounded-full flex items-center justify-center">
          <User className="h-10 w-10 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
          <p className="text-sm text-[#00f0ff]">Cyber Member</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Profile Settings
            </CardTitle>
            <CardDescription>Update your information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cyber Handle</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-black border-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Neural ID</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-black border-gray-800"
                  type="email"
                />
              </div>
              
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Two-Factor Authentication
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={logout}
              >
                Logout from All Devices
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span>2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Orders</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cyber Points</span>
                  <span className="text-[#00f0ff]">1,240</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}