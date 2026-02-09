import { createContext, useContext, useState, useEffect } from "react";
// Import the authService you created
import { authService } from '@/services/authService'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use your service's helper to get the initial user state
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  // --- SIGNUP LOGIC ---
  const signup = async (name, email, password) => {
    try {
      const trimmedEmail = email.trim();
      console.log("📝 Attempting signup for:", trimmedEmail);

      // Call your centralized service instead of manual fetch
      const result = await authService.register({ name, email: trimmedEmail, password });

      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error.message || "Signup failed" };
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      return { success: false, error: "Neural link failure: verify backend status" };
    }
  };

  // --- LOGIN LOGIC ---
  const login = async (email, password) => {
    try {
      const trimmedEmail = email.trim();
      console.log("🔐 Attempting login for:", trimmedEmail);
      
      // Call your centralized service instead of manual fetch
      const result = await authService.login(trimmedEmail, password);

      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error.message || "Invalid credentials" };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: "Connection refused: check backend logs" };
    }
  };

  const logout = () => {
    authService.logout(); // Clean up localStorage via service
    setUser(null);
  };

  const testAdminLogin = () => {
    const adminUser = {
      id: "admin-force-bypass",
      email: "admin@neo-akihabara.com",
      name: "Cyber Administrator",
      role: "admin"
    };
    setUser(adminUser);
    localStorage.setItem("user", JSON.stringify(adminUser));
    localStorage.setItem("token", "bypass-token");
    return { success: true, user: adminUser };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      testAdminLogin 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};