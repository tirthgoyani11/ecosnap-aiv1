import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "@/contexts/AuthContextSimple";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import LoginNew from "./pages/LoginNew";
import SignUp from "./pages/SignUp";
import SignUpNew from "./pages/SignUpNew";
import Scanner from "./pages/Scanner";
import DashboardNew from './pages/DashboardNew';
import BulkScan from "./pages/BulkScan";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import TestPage from "./pages/TestPage";
import SimpleTest from "./pages/SimpleTest";

const App = () => (
  <AuthProvider>
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
                
                {/* Auth Routes */}
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.22 }}
                      >
                        <LoginNew />
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/login-old" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.22 }}
                      >
                        <Login />
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.22 }}
                      >
                        <SignUpNew />
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/signup-old" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.22 }}
                      >
                        <SignUp />
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/scanner" 
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.22 }}
                      >
                        <Scanner />
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bulk" 
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.22 }}
                      >
                        <BulkScan />
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.22 }}
                      >
                        <DashboardNew />
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/leaderboard" 
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.22 }}
                      >
                        <Leaderboard />
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.22 }}
                      >
                        <Settings />
                      </motion.div>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Test Route for Debugging */}
                <Route 
                  path="/test" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.22 }}
                    >
                      <TestPage />
                    </motion.div>
                  } 
                />
                
                {/* Simple Test Route */}
                <Route 
                  path="/simple" 
                  element={<SimpleTest />} 
                />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
);

export default App;