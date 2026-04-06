import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { KycProvider } from "@/contexts/KycContext";
import { FilterProvider } from "@/contexts/FilterContext";
import Index from "./pages/Index";
import OrderBook from "./pages/OrderBook";
import PositionBook from "./pages/PositionBook";
import Holdings from "./pages/Holdings";
import MutualFunds from "./pages/MutualFunds";
import Settings from "./pages/Settings";
import StrategyBuilder from "./pages/StrategyBuilder";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Kyc from "./pages/Kyc";
import MainLayout from "./components/layout/MainLayout";
import { Sparkles } from "lucide-react";

const queryClient = new QueryClient();

// Coming Soon component for new routes
const ComingSoon = () => (
  <div className="flex items-center justify-center h-full min-h-[60vh]">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
      <p className="text-gray-600 max-w-md">
        This page is under development and will be available shortly.
      </p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const AppContent = () => {
  useEffect(() => {
    const savedHsl = localStorage.getItem("theme-color-hsl");
    if (savedHsl) {
      document.documentElement.style.setProperty("--primary", savedHsl);
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/kyc" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orderbook"
        element={
          <ProtectedRoute>
            <OrderBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions"
        element={
          <ProtectedRoute>
            <PositionBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/holdings"
        element={
          <ProtectedRoute>
            <Holdings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mutualfunds"
        element={
          <ProtectedRoute>
            <MutualFunds />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ticketing"
        element={
          <ProtectedRoute>
            <ComingSoon />
          </ProtectedRoute>
        }
      />
      <Route
        path="/strategy-builder"
        element={
          <ProtectedRoute>
            <StrategyBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kyc"
        element={
          <ProtectedRoute>
            <Kyc />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FilterProvider>
          <TooltipProvider>
            <KycProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </KycProvider>
          </TooltipProvider>
        </FilterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
