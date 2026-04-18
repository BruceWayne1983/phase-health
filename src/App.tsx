import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/Auth";
import Step1Age from "./pages/onboarding/Step1Age";
import Step2Cycle from "./pages/onboarding/Step2Cycle";
import Step3Symptoms from "./pages/onboarding/Step3Symptoms";
import Step4Goals from "./pages/onboarding/Step4Goals";
import Summary from "./pages/onboarding/Summary";
import Protocol from "./pages/Protocol";
import Bloods from "./pages/Bloods";
import ProtocolDemo from "./pages/ProtocolDemo";
import ProtocolRedTeam from "./pages/ProtocolRedTeam";
import DevFeedback from "./pages/DevFeedback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding/age" element={<Step1Age />} />
            <Route path="/onboarding/cycle" element={<Step2Cycle />} />
            <Route path="/onboarding/symptoms" element={<Step3Symptoms />} />
            <Route path="/onboarding/goals" element={<Step4Goals />} />
            <Route path="/onboarding/summary" element={<Summary />} />
            <Route path="/protocol" element={<Protocol />} />
            <Route path="/bloods" element={<Bloods />} />
            <Route path="/dev/protocol" element={<ProtocolDemo />} />
            <Route path="/dev/protocol/redteam" element={<ProtocolRedTeam />} />
            <Route path="/dev/feedback" element={<DevFeedback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
