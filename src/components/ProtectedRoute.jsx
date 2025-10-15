// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, required = "any" }) {
  // // 임시로 인증 체크 비활성화 - 개발용
  // return children;
  
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role"); // 'counselor' | 'client'
  const loc = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (required !== "any") {
    if (required === "counselor" && role !== "counselor") {
      return <Navigate to="/hub" replace />;
    }
    if (required === "client" && role !== "client") {
      return <Navigate to="/" replace />;
    }
  }
  return children;
}
