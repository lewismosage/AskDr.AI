import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SymptomChecker from './pages/SymptomChecker';
import ChatAssistant from './pages/ChatAssistant';
import MedicationQA from './pages/MedicationQA';
import Reminders from './pages/Reminders';
import SubscriptionPlans from './pages/SubscriptionPlans';
import AuthPage from './pages/AuthPage';
import ThankYou from './pages/ThankYou';
import NotFound from './pages/NotFound';
import TherapistConnect from './pages/therapistconnect/TherapistConnect';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/chat" element={<ChatAssistant />} />
            <Route path="/medication-qa" element={<MedicationQA />} />
            <Route path="/therapist-connect" element={<TherapistConnect />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/plans" element={<SubscriptionPlans />} />
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