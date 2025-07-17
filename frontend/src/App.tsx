import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/home/LandingPage";
import SymptomChecker from "./pages/symptomschecker/SymptomChecker";
import ChatAssistant from "./pages/chatassistant/ChatAssistant";
import MedicationQA from "./pages/medication_qa/MedicationQA";
import Reminders from "./pages/Reminders";
import SubscriptionPlans from "./pages/pricing/SubscriptionPlans";
import AuthPage from "./pages/auth/AuthPage";
import HelpCenter from "./pages/help/HelpCenter";
import Policies from "./pages/policies/Policies";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import TherapistConnect from "./pages/therapistconnect/TherapistConnect";
import { RequireAuth } from "./services/RequireAuth";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/symptom-checker" 
              element={
                <RequireAuth>
                  <SymptomChecker />
                </RequireAuth>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <RequireAuth>
                  <ChatAssistant />
                </RequireAuth>
              } 
            />
            <Route 
              path="/therapist-connect" 
              element={
                <RequireAuth>
                  <TherapistConnect />
                </RequireAuth>
              } 
            />
            <Route 
              path="/medication-qa" 
              element={
                <RequireAuth>
                  <MedicationQA />
                </RequireAuth>
              } 
            />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/plans" element={<SubscriptionPlans />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/terms" element={<Policies />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
