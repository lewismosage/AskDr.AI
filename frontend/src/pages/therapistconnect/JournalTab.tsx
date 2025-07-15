import React from 'react';

interface JournalTabProps {
  journalPrompts: string[];
  journalEntry: string;
  setJournalEntry: (entry: string) => void;
}

const JournalTab: React.FC<JournalTabProps> = ({ journalPrompts, journalEntry, setJournalEntry }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mental Health Journal</h2>
        <p className="text-gray-600">Express your thoughts and feelings in a safe, private space</p>
      </div>
      {/* Journal Prompts */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Prompts</h3>
        <div className="space-y-3">
          {journalPrompts.slice(0, 3).map((prompt, index) => (
            <div
              key={index}
              className="p-3 bg-primary/5 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors duration-200"
              onClick={() => setJournalEntry(prompt + '\n\n')}
            >
              <p className="text-gray-700">{prompt}</p>
            </div>
          ))}
        </div>
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
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Your entries are private and encrypted
          </p>
          <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200">
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalTab;
