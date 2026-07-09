import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";
import type { ReactNode } from "react";

export default function CustomerRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner size="lg" />;
  if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;

  return <>{children}</>;
}
