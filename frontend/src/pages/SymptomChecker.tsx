import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, AlertTriangle, Clock, Thermometer } from 'lucide-react';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      setResults([
        {
          condition: "Common Cold",
          probability: "High (85%)",
          severity: "Mild",
          description: "A viral infection of the upper respiratory tract commonly causing congestion, runny nose, and mild fever.",
          recommendations: ["Rest and hydration", "Over-the-counter pain relievers", "Warm saltwater gargle"]
        },
        {
          condition: "Seasonal Allergies",
          probability: "Medium (65%)",
          severity: "Mild",
          description: "Allergic reaction to environmental allergens like pollen, dust, or pet dander.",
          recommendations: ["Antihistamines", "Avoid known allergens", "Keep windows closed during high pollen days"]
        },
        {
          condition: "Sinusitis",
          probability: "Low (25%)",
          severity: "Moderate",
          description: "Inflammation of the sinus cavities, often following a cold or due to allergies.",
          recommendations: ["Nasal decongestants", "Steam inhalation", "See a doctor if symptoms persist"]
        }
      ]);
      setIsLoading(false);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'severe': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:text-primary-dark transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Symptom Checker</h1>
          <p className="text-gray-600">
            Describe your symptoms and get AI-powered insights into possible conditions.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">Medical Disclaimer</h3>
              <p className="text-sm text-yellow-700">
                This tool is for informational purposes only and is not a substitute for professional medical advice, 
                diagnosis, or treatment. Always consult with a healthcare provider for medical concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Symptom Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms
              </label>
              <textarea
                id="symptoms"
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Describe your symptoms here... (e.g., I have been experiencing a runny nose, sneezing, and mild headache for the past 2 days)"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !symptoms.trim()}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Analyze Symptoms
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Possible Conditions</h2>
            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{result.condition}</h3>
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-sm text-gray-600">
                        <strong>Probability:</strong> {result.probability}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(result.severity)}`}>
                        {result.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.severity === 'Mild' && <Thermometer className="h-5 w-5 text-green-500" />}
                    {result.severity === 'Moderate' && <Clock className="h-5 w-5 text-yellow-500" />}
                    {result.severity === 'Severe' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{result.description}</p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec: string, recIndex: number) => (
                      <li key={recIndex} className="text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Need More Help?</h3>
              <p className="text-gray-600 mb-4">
                For a more detailed consultation, try our AI assistant or consult with a healthcare professional.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/chat"
                  className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200"
                >
                  Chat with AI Assistant
                </Link>
                <button className="border border-primary text-primary px-6 py-2 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors duration-200">
                  Find a Doctor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomChecker;