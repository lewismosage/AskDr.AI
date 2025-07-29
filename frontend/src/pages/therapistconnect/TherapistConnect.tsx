import { useState, useEffect } from 'react';
import axios from '../../lip/api';
import AnonymousChat from './AnonymousChat';
import FindTherapist from './FindTherapist';
import JournalTab from './JournalTab';
import MoodTracker from './MoodTracker';
import { 
  MessageCircle, 
  Heart, 
  BookOpen,
  TrendingUp
} from 'lucide-react';

interface Therapist {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  price: string;
  availability: string;
  image: string;
  verified: boolean;
  languages: string[];
  approaches: string[];
}

const TherapistConnect = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'connect' | 'journal' | 'mood'>('chat');
  const [journalEntry, setJournalEntry] = useState('');
  const [journalPrompts, setJournalPrompts] = useState<string[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsError, setPromptsError] = useState<string | null>(null);


  const therapists: Therapist[] = [
    
  ]; 

  const moodOptions = [
    { value: 1, emoji: "😢", label: "Very Low" },
    { value: 2, emoji: "😔", label: "Low" },
    { value: 3, emoji: "😐", label: "Neutral" },
    { value: 4, emoji: "🙂", label: "Good" },
    { value: 5, emoji: "😊", label: "Great" }
  ];


  useEffect(() => {
    async function fetchPrompts() {
      setPromptsLoading(true);
      setPromptsError(null);
      try {
        const res = await axios.get('/mentalhealth/journal-prompts/');
        if (Array.isArray(res.data?.prompts)) {
          setJournalPrompts(res.data.prompts);
        } else {
          setPromptsError('Failed to load prompts.');
        }
      } catch (err) {
        setPromptsError('Failed to load prompts.');
      } finally {
        setPromptsLoading(false);
      }
    }
    fetchPrompts();
  }, []);


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MentalWell AI</h1>
            <p className="text-gray-600">Anonymous mental health support & therapist connections</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {[
              { id: 'chat', label: 'Anonymous Chat', icon: MessageCircle },
              { id: 'connect', label: 'Find Therapist', icon: Heart },
              { id: 'journal', label: 'Journal', icon: BookOpen },
              { id: 'mood', label: 'Mood Tracker', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Anonymous Chat Tab */}
        {activeTab === 'chat' && <AnonymousChat />}

        {/* Find Therapist Tab */}
        {activeTab === 'connect' && (
          <FindTherapist therapists={therapists} />
        )} 

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <JournalTab
            journalPrompts={journalPrompts}
            journalEntry={journalEntry}
            setJournalEntry={setJournalEntry}
            promptsLoading={promptsLoading}
            promptsError={promptsError}
          />
        )}

        {/* Mood Tracker Tab */}
        {activeTab === 'mood' && (
          <MoodTracker
            moodOptions={moodOptions}
          />
        )}
      </div>
    </div>
  );
};

export default TherapistConnect;