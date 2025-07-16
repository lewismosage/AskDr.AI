import React, { useState } from 'react';
import { FileText, Shield, AlertTriangle } from 'lucide-react';

type PolicyTab = 'terms' | 'privacy' | 'disclaimer';

const Policies: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PolicyTab>('terms');

  const policyContent = {
    terms: {
      title: "Terms of Service",
      icon: <FileText className="h-5 w-5 mr-2" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">1. Your Agreement</h3>
          <p>
            By using AskDr.AI, you confirm that:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You're at least 13 years old</li>
              <li>You understand this is <strong>not</strong> emergency medical help</li>
              <li>You agree to these terms</li>
            </ul>
          </p>

          <h3 className="text-xl font-semibold mt-6">2. What We Provide</h3>
          <p>
            AskDr.AI offers:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>AI-powered health information (symptom insights, medication guides)</li>
              <li>Mental health tools (anonymous chat, mood tracking, journaling)</li>
              <li>Therapist matching (<em>we don't provide therapy directly</em>)</li>
            </ul>
          </p>

          <h3 className="text-xl font-semibold mt-6">3. Important Limits</h3>
          <p>
            <strong>Not a substitute for professionals:</strong> Our AI is for informational support only. Always consult doctors for diagnoses or treatment.
          </p>
          <p>
            <strong>Therapist disclaimer:</strong> We verify licenses but aren't liable for their services.
          </p>
          <p>
            <strong>No emergencies:</strong> Call local emergency services for crises.
          </p>

          <h3 className="text-xl font-semibold mt-6">4. Your Responsibilities</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate health info (don't lie about symptoms)</li>
            <li>Don't misuse the platform (spam, illegal content, etc.)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">5. Privacy & Data</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Anonymous use is allowed (no account needed for basic features)</li>
            <li>Mood/journal data is <strong>never sold</strong> and encrypted</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">6. Changes & Contact</h3>
          <p>
            We may update these terms. Continued use = agreement.<br />
            Questions? Email <a href="mailto:legal@askdrai.com" className="text-primary hover:underline">legal@askdrai.com</a>.
          </p>
        </div>
      )
    },
    privacy: {
      title: "Privacy Policy",
      icon: <Shield className="h-5 w-5 mr-2" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">1. Data We Collect</h3>
          <p>
            <strong>With an account:</strong> Email, age, health entries (moods, journals), therapist bookings.
          </p>
          <p>
            <strong>Without an account:</strong> Anonymous symptom searches/chat logs (not linked to you).
          </p>

          <h3 className="text-xl font-semibold mt-6">2. How We Use It</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>To personalize your experience (e.g., therapist matches)</li>
            <li>To improve our AI (aggregated, anonymized data only)</li>
            <li><strong>Never</strong> to advertise to you</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">3. Your Rights</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Access/delete data:</strong> Go to Settings or email us</li>
            <li><strong>Opt out:</strong> Don't create an account for anonymous use</li>
            <li><strong>GDPR/CCPA:</strong> Request a copy of your data or deletion</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">4. Security</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Encryption protects your health data</li>
            <li>Employees can't read journals/moods without permission</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">5. Third Parties</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Therapists only see what you share with them</li>
            <li>We don't sell data to advertisers</li>
          </ul>
        </div>
      )
    },
    disclaimer: {
      title: "Medical Disclaimer",
      icon: <AlertTriangle className="h-5 w-5 mr-2" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="font-medium text-red-700">
              For medical emergencies, call your local emergency number immediately.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-4">1. Not Medical Advice</h3>
          <p>
            AskDr.AI's content is for general information only. It doesn't diagnose, treat, or replace doctors.
          </p>

          <h3 className="text-xl font-semibold mt-6">2. Accuracy</h3>
          <p>
            While we use reliable sources, AI may make errors. Always double-check critical health information with a professional.
          </p>

          <h3 className="text-xl font-semibold mt-6">3. When to Seek Emergency Help</h3>
          <p>
            Call emergency services for:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Chest pain or difficulty breathing</li>
              <li>Suicidal thoughts or self-harm urges</li>
              <li>Severe injuries or allergic reactions</li>
              <li>Stroke symptoms (face drooping, arm weakness, speech difficulty)</li>
            </ul>
          </p>

          <h3 className="text-xl font-semibold mt-6">4. Therapist Matching</h3>
          <p>
            We verify licenses but don't endorse specific providers. You choose therapists at your own discretion after reviewing their qualifications.
          </p>

          <h3 className="text-xl font-semibold mt-6">5. Liability</h3>
          <p>
            We're not liable for health decisions made based on our platform. By using AskDr.AI, you acknowledge this disclaimer.
          </p>
        </div>
      )
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Policies & Disclaimers</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar - Tabs */}
        <div className="md:w-64 flex-shrink-0">
          <div className="space-y-1">
            {(Object.keys(policyContent) as PolicyTab[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors text-left ${
                  activeTab === key
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {policyContent[key].icon}
                <span>{policyContent[key].title}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Right content area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            {policyContent[activeTab].icon}
            {policyContent[activeTab].title}
          </h2>
          <div className="prose max-w-none">
            {policyContent[activeTab].content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;