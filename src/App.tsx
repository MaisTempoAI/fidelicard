import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Companies from "./pages/Companies";
import CompanyPage from "./pages/CompanyPage";
import CardPage from "./pages/Card";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AddStamp from "./pages/AddStamp";
import Scanner from "./pages/Scanner";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Companies />} />
          <Route path="/empresa/:companyId" element={<CompanyPage />} />
          <Route path="/card/:code" element={<CardPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/add-stamp/:code" element={<AdminRoute><AddStamp /></AdminRoute>} />
          <Route path="/admin/scanner" element={<AdminRoute><Scanner /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
