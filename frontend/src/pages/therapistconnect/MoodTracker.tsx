import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import axios from '../../lip/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MoodOption {
  value: number;
  emoji: string;
  label: string;
}


interface MoodTrackerProps {
  moodOptions: MoodOption[];
}


const MoodTracker: React.FC<MoodTrackerProps> = ({ moodOptions }) => {
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [moodHistory, setMoodHistory] = useState<{ date: string, mood: number }[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [wellnessTip, setWellnessTip] = useState<string | null>(null);

  const handleMoodSelection = async (mood: number) => {
    setAuthError(null);
    if (!isAuthenticated) {
      setAuthError('Please sign in to log your mood.');
      setCurrentMood(null);
      return;
    }
    setCurrentMood(mood);
    try {
      await axios.post('/mentalhealth/mood/log/', { mood });
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setAuthError('Please sign in to log your mood.');
        setCurrentMood(null);
      } else {
        console.error("Error logging mood:", error);
      }
    }
  };

  useEffect(() => {
    async function fetchMoodHistory() {
      try {
        const res = await axios.get('/mentalhealth/mood/history/');
        setMoodHistory(res.data); // e.g. [{ date: "2025-07-10", mood: 4 }, ...]
      } catch (err) {
        console.error('Failed to fetch mood history', err);
      }
    }
    async function checkAuth() {
      try {
        // Try to fetch a protected endpoint to check auth
        await axios.get('/users/me/');
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    }
    async function fetchWellnessTip() {
      try {
        const res = await axios.get('/mentalhealth/wellness-tip/');
        setWellnessTip(res.data && res.data.tip ? res.data.tip : null);
      } catch {
        setWellnessTip(null);
      }
    }
    fetchMoodHistory();
    checkAuth();
    fetchWellnessTip();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mood Tracker</h2>
        <p className="text-gray-600">Track your daily mood to identify patterns and triggers</p>
      </div>
      {/* Today's Mood */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling today?</h3>
        <div className="flex justify-center space-x-6">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelection(mood.value)}
              disabled={!isAuthenticated}
              className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
                currentMood === mood.value
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-3xl mb-2">{mood.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{mood.label}</span>
            </button>
          ))}
        </div>
        {!isAuthenticated && (
          <div className="mt-4 text-center">
            <p className="text-red-600 font-medium">Please sign in to log your mood.</p>
          </div>
        )}
        {authError ? (
          <div className="mt-4 text-center">
            <p className="text-red-600 font-medium">{authError}</p>
          </div>
        ) : currentMood && (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-medium">Mood logged for today!</p>
          </div>
        )}
      </div>
      {/* Mood History Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trends (Last 7 Days)</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          {moodHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={moodHistory}>
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p>Mood chart will appear here after tracking for a few days</p>
            </div>
          )}
        </div>
      </div>
      {/* Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Tips</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Mood Tracking Benefits</h4>
            <p className="text-sm text-blue-800">
              Regular mood tracking helps identify patterns, triggers, and the effectiveness of coping strategies.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Today's Wellness Tip</h4>
            <p className="text-sm text-green-800">
              {wellnessTip ? wellnessTip : "Check back at 8am for today's wellness tip!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
