
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Mathematics from "./pages/Mathematics";
import Chemistry from "./pages/Chemistry";
import Biology from "./pages/Biology";
import Physics from "./pages/Physics";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import VisualLibrary from "./pages/VisualLibrary";
import ScientificJournal from "./pages/ScientificJournal";
import StudyOrganization from "./pages/StudyOrganization";
import ChatRooms from "./pages/ChatRooms";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mathematics" element={<Mathematics />} />
              <Route path="/chemistry" element={<Chemistry />} />
              <Route path="/biology" element={<Biology />} />
              <Route path="/physics" element={<Physics />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/visual-library" element={<VisualLibrary />} />
              <Route path="/scientific-journal" element={<ScientificJournal />} />
              <Route path="/study-organization" element={<StudyOrganization />} />
              <Route path="/chat-rooms" element={<ChatRooms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
