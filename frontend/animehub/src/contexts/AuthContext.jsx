import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // --- SIGNUP LOGIC ---
  const signup = async (name, email, password) => {
    try {
      const trimmedEmail = email.trim();
      console.log("📝 Attempting signup for:", trimmedEmail);

      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: trimmedEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.user?.id || data.user?._id,
          email: data.user?.email,
          name: data.user?.name,
          role: data.user?.role || 'user',
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", data.token);
        return { success: true, user: userData };
      } else {
        // Handle express-validator errors array or standard error message
        const errorMsg = data.errors ? data.errors[0].msg : data.message;
        return { success: false, error: errorMsg || "Signup failed" };
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      return { success: false, error: "Network error: check if backend is running" };
    }
  };

  // --- LOGIN LOGIC ---
  const login = async (email, password) => {
    try {
      const trimmedEmail = email.trim();
      console.log("🔐 Attempting login for:", trimmedEmail);
      
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response.");
      }

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id: data.user?.id || data.user?._id,
          email: data.user?.email,
          name: data.user?.name,
          role: data.user?.role || (trimmedEmail.includes('admin') ? 'admin' : 'user'),
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", data.token);
        return { success: true, user: userData };
      } else {
        return { success: false, error: data.message || "Invalid credentials" };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: "Network error: check if backend is running" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
      signup, // Added to Provider
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