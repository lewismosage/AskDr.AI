import React, { useState, useEffect } from 'react';
import axios from '../../lip/api';

interface JournalTabProps {
  journalPrompts: string[];
  journalEntry: string;
  setJournalEntry: (entry: string) => void;
  promptsLoading?: boolean;
  promptsError?: string | null;
}

interface SavedJournalEntry {
  date: string;
  content: string;
}

const JournalTab: React.FC<JournalTabProps> = ({ journalPrompts, journalEntry, setJournalEntry, promptsLoading, promptsError }) => {

  const [savedEntries, setSavedEntries] = useState<SavedJournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!journalEntry.trim()) return;
    setLoading(true);
    setError(null);
    setAuthError(null);
    try {
      const res = await axios.post('/mentalhealth/journal/', {
        content: journalEntry
      });
      if (res.data && res.data.created_at && res.data.content) {
        setSavedEntries((prev: SavedJournalEntry[]) => [
          { date: new Date(res.data.created_at).toLocaleDateString(), content: res.data.content },
          ...prev
        ]);
        setJournalEntry('');
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setAuthError('Please sign in to save entry.');
      } else {
        setError('Failed to save journal entry.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchJournals() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/mentalhealth/journal/');
        if (Array.isArray(res.data)) {
          setSavedEntries(
            res.data.map((entry: any) => ({
              date: new Date(entry.created_at).toLocaleDateString(),
              content: entry.content
            }))
          );
        }
      } catch (err: any) {
        // Only show error if not 401 (unauthenticated)
        if (err?.response?.status !== 401) {
          setError('Failed to load journal entries.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchJournals();
  }, []);

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mental Health Journal</h2>
        <p className="text-gray-600">Express your thoughts and feelings in a safe, private space</p>
      </div>
      {/* Journal Prompts */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Prompts</h3>
        {promptsLoading ? (
          <div className="text-gray-500 text-sm">Loading prompts...</div>
        ) : promptsError ? (
          <div className="text-red-500 text-sm">{promptsError}</div>
        ) : (
          <div className="space-y-3">
            {journalPrompts.slice(0, 3).map((prompt: string, index: number) => (
              <div
                key={index}
                className="p-3 bg-primary/5 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                onClick={() => setJournalEntry(prompt + '\n\n')}
              >
                <p className="text-gray-700">{prompt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Journal Entry */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Journal Entry - {new Date().toLocaleDateString()}
          </label>
          <textarea
            rows={12}
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            placeholder="Write about your thoughts, feelings, or experiences today..."
          />
        </div>
        {authError && (
          <div className="text-red-500 text-sm mb-2">{authError}</div>
        )}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Your entries are private and encrypted
          </p>
          <button
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200"
            onClick={handleSave}
            disabled={!journalEntry.trim() || loading}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>
      </div>
      {/* Sidebar: Saved Journals */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 h-full" style={{ maxHeight: '53rem', overflowY: 'auto' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Journals</h3>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {savedEntries.length === 0 && !loading ? (
            <p className="text-gray-500 text-sm">No journal entries saved yet.</p>
          ) : (
            <ul className="space-y-4">
              {savedEntries.map((entry: SavedJournalEntry, idx: number) => (
                <li key={idx} className="bg-white rounded-lg shadow p-3">
                  <div className="text-xs text-gray-400 mb-1">{entry.date}</div>
                  <div className="text-sm text-gray-800 whitespace-pre-line line-clamp-4">{entry.content}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalTab;
