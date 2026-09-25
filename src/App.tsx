import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import GlobalAlarmListener from "@/components/GlobalAlarmListener";
import Spinner from "@/components/Spinner";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Medications from "@/pages/Medications";
import MedicineForm from "@/pages/MedicineForm";
import Prescriptions from "@/pages/Prescriptions";
import Notifications from "@/pages/Notifications";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-brand-600">
        <Spinner size={40} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-brand-600">
        <Spinner size={40} />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: "500",
              background: "#fff",
              color: "#0f172a",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              border: "1px solid #f1f5f9",
            },
            success: {
              iconTheme: {
                primary: "#059669",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#dc2626",
                secondary: "#fff",
              },
            },
          }}
        />

        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes — GlobalAlarmListener only active here */}
          <Route
            element={
              <ProtectedRoute>
                <GlobalAlarmListener />
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medicines" element={<Medications />} />
            <Route path="/medicines/new" element={<MedicineForm />} />
            <Route path="/medicines/:id/edit" element={<MedicineForm />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
