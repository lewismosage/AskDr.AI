import React, { useState } from 'react';
import { Search, Pill, AlertTriangle, Info, Clock } from 'lucide-react';

const MedicationQA = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      setResponse(generateMedicationResponse(question));
      setIsLoading(false);
    }, 1500);
  };

  const generateMedicationResponse = (userQuestion: string): string => {
    const lowerQuestion = userQuestion.toLowerCase();
    
    if (lowerQuestion.includes('ibuprofen') || lowerQuestion.includes('advil')) {
      return "Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) commonly used to reduce pain, inflammation, and fever. The typical adult dosage is 200-400mg every 4-6 hours, not exceeding 1200mg in 24 hours unless directed by a doctor. Take with food to reduce stomach irritation. Avoid if you have kidney problems, stomach ulcers, or are taking blood thinners. Common side effects include stomach upset, dizziness, and headache. Always consult your healthcare provider for personalized advice.";
    }
    
    if (lowerQuestion.includes('acetaminophen') || lowerQuestion.includes('tylenol')) {
      return "Acetaminophen is a pain reliever and fever reducer. The typical adult dose is 325-650mg every 4-6 hours, not exceeding 3000mg in 24 hours. It's generally safer for the stomach than NSAIDs but can cause liver damage if taken in excessive amounts or with alcohol. Do not exceed the recommended dose and be aware that many other medications contain acetaminophen. Consult your healthcare provider if you have liver problems or take other medications.";
    }
    
    if (lowerQuestion.includes('interaction') || lowerQuestion.includes('together')) {
      return "Drug interactions can be serious and potentially dangerous. Never combine medications without consulting a healthcare professional or pharmacist first. They can check for interactions between your medications, including over-the-counter drugs and supplements. Some interactions can reduce effectiveness, while others can cause harmful side effects. Always provide a complete list of all medications and supplements you're taking to your healthcare provider.";
    }
    
    return "Thank you for your medication question. For specific medication advice, dosages, interactions, and side effects, I strongly recommend consulting with a licensed pharmacist or your healthcare provider. They can provide personalized guidance based on your medical history, current medications, and specific health conditions. Medication safety is very important, and professional medical advice is essential for your well-being.";
  };

  const safetyTips = [
    {
      icon: <Pill className="h-5 w-5 text-primary" />,
      title: "Take as Prescribed",
      description: "Always follow the dosage and timing instructions provided by your healthcare provider."
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "Consistent Timing",
      description: "Take medications at the same time each day to maintain steady levels in your system."
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      title: "Watch for Side Effects",
      description: "Monitor for any unusual symptoms and report them to your healthcare provider immediately."
    },
    {
      icon: <Info className="h-5 w-5 text-primary" />,
      title: "Keep Updated Lists",
      description: "Maintain an accurate list of all medications and supplements you're taking."
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medication Q&A</h1>
          <p className="text-gray-600">
            Get general information about medications, interactions, and safety guidelines.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-1">Important Medical Disclaimer</h3>
              <p className="text-sm text-red-700">
                This tool provides general medication information only. Always consult your healthcare provider, 
                pharmacist, or read the medication label for specific dosing, interactions, and safety information. 
                Never start, stop, or change medications without professional medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Question Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="medication-question" className="block text-sm font-medium text-gray-700 mb-2">
                Ask about your medications
              </label>
              <textarea
                id="medication-question"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Ask about your medications... (e.g., Can I take ibuprofen with acetaminophen? What are the side effects of...?)"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Getting Information...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Get Medication Info
                </>
              )}
            </button>
          </form>
        </div>

        {/* Response */}
        {response && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 text-primary mr-2" />
              Medication Information
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">{response}</p>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Remember:</strong> This is general information only. Always consult your healthcare provider 
                or pharmacist for personalized medication advice.
              </p>
            </div>
          </div>
        )}

        {/* Safety Tips */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Medication Safety Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">{tip.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Emergency Situations</h3>
            <p className="text-sm text-gray-700">
              If you experience severe allergic reactions, difficulty breathing, chest pain, or other serious 
              side effects, seek immediate medical attention or call emergency services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationQA;