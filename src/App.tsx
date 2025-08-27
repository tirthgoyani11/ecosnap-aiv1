import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NavBar } from "@/components/NavBar";
import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import BulkScan from "./pages/BulkScan";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import ARPreview from "./pages/ARPreview";
import ARTest from '@/pages/ARTest';
import BasicCameraTestPage from '@/pages/BasicCameraTest';
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CameraTestPage from "./pages/CameraTestPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <NavBar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Index />
                  </motion.div>
                } 
              />
              <Route 
                path="/scanner" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Scanner />
                  </motion.div>
                } 
              />
              <Route 
                path="/bulk" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.22 }}
                  >
                    <BulkScan />
                  </motion.div>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Dashboard />
                  </motion.div>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Leaderboard />
                  </motion.div>
                } 
              />
              <Route 
                path="/ar-preview" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.22 }}
                  >
                    <ARPreview />
                  </motion.div>
                } 
                />
              <Route 
                path="/settings" 
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.22 }}
                  >
                    <Settings />
                  </motion.div>
                } 
              />
              <Route path="/camera-test" element={<CameraTestPage />} />
              <Route path="/ar-test" element={<ARTest />} />
              <Route path="/basic-camera-test" element={<BasicCameraTestPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;