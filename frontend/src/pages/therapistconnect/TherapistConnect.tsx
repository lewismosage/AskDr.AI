import { useState } from 'react';
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


  const therapists: Therapist[] = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      specialty: "Anxiety & Depression",
      rating: 4.9,
      reviews: 127,
      location: "Downtown Medical Center",
      distance: "2.3 miles",
      price: "$120/session",
      availability: "Available today",
      image: "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
      languages: ["English", "Mandarin"],
      approaches: ["CBT", "Mindfulness", "EMDR"]
    },
    {
      id: 2,
      name: "Dr. Michael Rodriguez",
      specialty: "Trauma & PTSD",
      rating: 4.8,
      reviews: 89,
      location: "Wellness Psychology Group",
      distance: "1.8 miles",
      price: "$140/session",
      availability: "Next available: Tomorrow",
      image: "https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
      languages: ["English", "Spanish"],
      approaches: ["EMDR", "Somatic Therapy", "CPT"]
    },
    {
      id: 3,
      name: "Dr. Emily Johnson",
      specialty: "Relationship & Family",
      rating: 4.7,
      reviews: 156,
      location: "Family Therapy Associates",
      distance: "3.1 miles",
      price: "$110/session",
      availability: "Available this week",
      image: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
      languages: ["English"],
      approaches: ["EFT", "Gottman Method", "CBT"]
    }
  ];

  const moodOptions = [
    { value: 1, emoji: "😢", label: "Very Low" },
    { value: 2, emoji: "😔", label: "Low" },
    { value: 3, emoji: "😐", label: "Neutral" },
    { value: 4, emoji: "🙂", label: "Good" },
    { value: 5, emoji: "😊", label: "Great" }
  ];

  const journalPrompts = [
    "What are three things you're grateful for today?",
    "Describe a moment when you felt truly at peace.",
    "What would you tell your younger self about handling difficult emotions?",
    "Write about a challenge you overcame and how it made you stronger.",
    "What does self-care look like for you right now?"
  ];




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
          <nav className="flex space-x-8">
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