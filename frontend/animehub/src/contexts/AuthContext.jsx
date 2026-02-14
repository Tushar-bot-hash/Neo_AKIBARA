import { createContext, useContext, useState, useEffect } from "react";
import { authService } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. INITIAL SESSION CHECK
  useEffect(() => {
    const initializeAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // 2. SIGNUP LOGIC
  const signup = async (name, email, password) => {
    try {
      const trimmedEmail = email.trim();
      const result = await authService.register({ name, email: trimmedEmail, password });

      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        // Robust error parsing to handle strings or objects
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.error || "Signup failed";
          
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("❌ Signup System Error:", error);
      return { success: false, error: "Neural link failure: verify backend status" };
    }
  };

  // 3. LOGIN LOGIC
  const login = async (email, password) => {
    try {
      const trimmedEmail = email.trim();
      const result = await authService.login(trimmedEmail, password);

      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.error || "Invalid credentials";

        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("❌ Login System Error:", error);
      return { success: false, error: "Connection refused: check backend logs" };
    }
  };

  // 4. LOGOUT
  const logout = () => {
    authService.logout(); 
    setUser(null);
  };

  // 5. DEV TOOLS (Optional)
  const testAdminLogin = () => {
    const adminUser = {
      id: "admin-force-bypass",
      email: "admin@neo-akihabara.com",
      name: "Cyber Administrator",
      role: "admin"
    };
    setUser(adminUser);
    localStorage.setItem("user", JSON.stringify(adminUser));
    localStorage.setItem("token", "bypass-token"); // Note: real backend routes will still reject this
    return { success: true, user: adminUser };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      testAdminLogin,
      isAdmin: user?.role === 'admin' // Helper for UI logic
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};