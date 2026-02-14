import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // 1. LOADING STATE
  // While we check localStorage or run the initial refresh check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00f0ff]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-[#00f0ff] font-mono animate-pulse">
            SYNC
          </div>
        </div>
      </div>
    );
  }

  // 2. UNAUTHENTICATED
  // If no user is found, redirect to login but save the current location
  // so we can send them back after they log in.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. AUTHORIZATION CHECK (ADMIN)
  // Use the isAdmin helper from our updated context
  if (requireAdmin && !isAdmin) {
    console.warn("🛑 Unauthorized Access Attempt: Redirecting to home.");
    return <Navigate to="/" replace />;
  }

  // 4. AUTHORIZED
  return children;
};

export default ProtectedRoute;