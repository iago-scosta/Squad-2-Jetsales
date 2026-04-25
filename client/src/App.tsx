import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ChatbotsPage from "./pages/ChatbotsPage";
import ChatbotEditorPage from "./pages/ChatbotEditorPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import TicketsPage from "./pages/TicketsPage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors closeButton position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Authed area with shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chatbots" element={<ChatbotsPage />} />
            <Route path="/conexoes" element={<ConnectionsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
          </Route>

          {/* Editor — own full-screen layout, no shell */}
          <Route
            path="/chatbots/:id"
            element={
              <ProtectedRoute>
                <ChatbotEditorPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
