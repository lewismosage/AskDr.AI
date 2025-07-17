import React, { useState } from 'react';
import { 
  HelpCircle, MessageSquare, BarChart2, BookOpen, 
  Search, Lock, Activity, Bot, Pill, ChevronDown, ChevronRight 
} from 'lucide-react';

const HelpCenter: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('getting-started');

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <HelpCircle className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'What is AskDr.AI?',
          answer: 'AskDr.AI is your AI-powered health companion offering symptom checking, medication guidance, mental health support through anonymous chat, mood tracking, journaling, and therapist connections—all in one trusted platform.'
        },
        {
          question: 'Is this platform free to use?',
          answer: 'Our AI features including symptom checking, medication info, anonymous chat, mood tracking and journaling are completely free. Therapist matching is free, but sessions with professionals may have costs depending on their rates.'
        },
        {
          question: 'Do I need to create an account?',
          answer: 'You can use our symptom checker, medication guide and anonymous chat without an account. To save your health history, mood entries, journal, or connect with therapists, we recommend creating a free account.'
        },
        {
          question: 'How do I navigate between features?',
          answer: 'Use the main menu: the stethoscope icon for symptom checking, pill icon for medications, chat bubble for AI conversations, mood chart for tracking, journal for reflections, and therapist icon for professional connections.'
        }
      ]
    },
    {
      id: 'symptom-checker',
      title: 'Symptom Checker',
      icon: <Activity className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'How does the symptom checker work?',
          answer: 'Describe your symptoms in plain language (e.g., "headache and fever for 3 days"). Our AI analyzes patterns and suggests possible conditions while recommending appropriate next steps—always advising when to see a real doctor.'
        },
        {
          question: 'Is this a diagnosis?',
          answer: 'No, this is informational only. Our AI suggests possible explanations for symptoms but cannot replace professional medical diagnosis. Always consult a doctor for concerning symptoms.'
        },
        {
          question: 'What symptoms can I check?',
          answer: 'You can check physical symptoms (pain, fatigue), mental health concerns (anxiety, depression), or general wellness questions. The AI is trained on thousands of medical conditions.'
        },
        {
          question: 'How accurate are the results?',
          answer: 'While our AI is trained on reliable medical sources, its suggestions are probabilistic. It will always recommend consulting a healthcare professional for serious or persistent symptoms.'
        }
      ]
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      icon: <Bot className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'What can the AI Assistant help with?',
          answer: 'Our AI can discuss symptoms, explain medical terms, offer mental health support, suggest wellness strategies, and guide you to appropriate resources—acting as your 24/7 health companion.'
        },
        {
          question: 'Is the AI a real doctor?',
          answer: 'No, the AI is not a licensed physician. It provides general health information and support but cannot diagnose conditions or prescribe treatments.'
        },
        {
          question: 'Can I ask about medications?',
          answer: 'Yes! The AI can explain how medications work, potential side effects, and interactions—but always confirm with your pharmacist or doctor before making changes.'
        },
        {
          question: 'How does it handle emergencies?',
          answer: 'If you describe symptoms suggesting an emergency (chest pain, suicidal thoughts), the AI will immediately direct you to call emergency services or visit urgent care.'
        }
      ]
    },
    {
      id: 'medication-guide',
      title: 'Medication Guide',
      icon: <Pill className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'What medication info is available?',
          answer: 'Search thousands of medications for details on uses, dosages, side effects, interactions, and safety tips—all presented in easy-to-understand language.'
        },
        {
          question: 'Can I check drug interactions?',
          answer: 'Yes! Use our interaction checker by entering your medications. The AI will flag potentially dangerous combinations and suggest talking to your pharmacist.'
        },
        {
          question: 'How current is the medication data?',
          answer: 'We update our database weekly with the latest FDA information and pharmaceutical research to ensure you get accurate, up-to-date guidance.'
        },
        {
          question: 'Can the AI recommend dosages?',
          answer: 'We can show standard dosage ranges, but only your prescribing doctor can determine the right dosage for your specific situation.'
        }
      ]
    },
    {
      id: 'anonymous-chat',
      title: 'Anonymous Chat',
      icon: <MessageSquare className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'How does the anonymous chat work?',
          answer: 'Type anything about your mental health—the AI responds with supportive, clinically-informed suggestions. No login needed, and conversations aren\'t linked to you.'
        },
        {
          question: 'What topics can I discuss?',
          answer: 'Stress, relationships, anxiety, depression, trauma, or just daily struggles. The AI is trained on mental health best practices but will recommend therapists for serious concerns.'
        },
        {
          question: 'Is this a crisis hotline?',
          answer: 'No. For immediate crisis support, the AI will direct you to 24/7 hotlines. Our chat is best for non-urgent support and coping strategies.'
        },
        {
          question: 'Can I save our conversation?',
          answer: 'Anonymous chats can\'t be saved. If you want continuity, create an account—your chats will remain private but accessible across sessions.'
        }
      ]
    },
    {
      id: 'mood-tracker',
      title: 'Mood Tracker',
      icon: <BarChart2 className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'How do I track my mood?',
          answer: 'Select from 5 mood faces (😊 😐 😞) and add optional notes about what\'s affecting you. Track multiple times daily to see patterns emerge.'
        },
        {
          question: 'Can I track physical symptoms too?',
          answer: 'Yes! The notes section lets you record physical feelings (headaches, fatigue) alongside mood—helping identify mind-body connections.'
        },
        {
          question: 'What do the trend charts show?',
          answer: 'Weekly/monthly views reveal mood patterns, triggers, and improvements—helpful for therapy discussions or recognizing when to seek help.'
        },
        {
          question: 'Can I export my mood data?',
          answer: 'Yes. In Settings, you can download your complete history as a PDF or CSV to share with healthcare providers.'
        }
      ]
    },
    {
      id: 'journal',
      title: 'Journal',
      icon: <BookOpen className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'How does journaling help my health?',
          answer: 'Writing about experiences reduces stress, clarifies thoughts, and helps identify patterns. Our prompts guide meaningful reflection about your health journey.'
        },
        {
          question: 'Are there health-focused prompts?',
          answer: 'Yes! Try prompts like "How did my symptoms affect me today?" or "What self-care worked well this week?" tailored for physical and mental health tracking.'
        },
        {
          question: 'Can I add photos to entries?',
          answer: 'Currently text-only to ensure privacy, but we\'re working on secure media attachments for food logs, rash photos, etc. in future updates.'
        },
        {
          question: 'Is my journal HIPAA compliant?',
          answer: 'Yes. We treat journal entries with the same confidentiality standards as medical records, using encryption and strict access controls.'
        }
      ]
    },
    {
      id: 'find-therapist',
      title: 'Find a Therapist',
      icon: <Search className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'How does therapist matching work?',
          answer: 'Answer questions about your needs (anxiety, chronic illness support, etc.), preferences (therapy approach, gender), and practical factors (insurance, location) for personalized matches.'
        },
        {
          question: 'Are therapists specialized in medical issues?',
          answer: 'Many providers list specialties like chronic illness counseling, health anxiety, or pain management—filter by "Medical Support" to find them.'
        },
        {
          question: 'Can I find therapists who take my insurance?',
          answer: 'Yes! Filter by insurance provider. We verify each therapist\'s accepted plans during onboarding.'
        },
        {
          question: 'What if I need to change therapists?',
          answer: 'You can request new matches anytime. Your comfort is important—we make switching easy with just a few clicks.'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Data & Privacy',
      icon: <Lock className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'Is my health data protected?',
          answer: 'Absolutely. We use hospital-grade encryption, conduct regular security audits, and comply with HIPAA for all health information you share.'
        },
        {
          question: 'Who sees my symptom searches?',
          answer: 'No human reviews your symptom searches. AI processes them anonymously, and we aggregate data without personal identifiers to improve our models.'
        },
        {
          question: 'Can I delete my data?',
          answer: 'Yes. In Account Settings, you can permanently delete specific entries or your entire history. Deletions are irreversible but processed immediately.'
        },
        {
          question: 'Do you share data with advertisers?',
          answer: 'Never. We don\'t sell or share health data. Our revenue comes from optional premium services, not advertising.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Help',
      icon: <HelpCircle className="h-5 w-5 mr-2" />,
      questions: [
        {
          question: 'The symptom checker isn\'t working—what do I do?',
          answer: 'First, try refreshing. If descriptions aren\'t processing, try simpler language ("stomach pain" instead of "gastric discomfort"). Still stuck? Report the issue through our feedback button.'
        },
        {
          question: 'How do I access my health history?',
          answer: 'Logged-in users find everything under "My Health" in the menu. Export options are available if you need records for medical appointments.'
        },
        {
          question: 'Why does the AI keep asking me to see a doctor?',
          answer: 'Our safety protocols trigger this when symptoms could indicate serious conditions. The AI errs on the side of caution—always follow up with a professional for concerning symptoms.'
        },
        {
          question: 'What browsers work best?',
          answer: 'Chrome, Firefox, Edge, and Safari (latest versions). Enable JavaScript for full functionality. Mobile apps coming soon!'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AskDr.AI Help Center</h1>
      <p className="text-lg text-gray-600 mb-8">
        Get answers about your AI health companion. We're here to help 24/7.
      </p>

      <div className="space-y-4">
        {faqCategories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                {category.icon}
                <h2 className="text-lg font-semibold">{category.title}</h2>
              </div>
              {expandedCategory === category.id ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedCategory === category.id && (
              <div className="p-4 space-y-4">
                {category.questions.map((item, index) => (
                  <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Need more help?</h2>
        <p className="text-gray-600 mb-4">
          Our support team includes healthcare professionals ready to assist with technical questions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors">
            Live Chat Support
          </button>
          <button className="border border-primary text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/5 transition-colors">
            Email: help@askdrai.com
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          For medical emergencies, please call your local emergency number immediately.
        </p>
      </div>
    </div>
  );
};

export default HelpCenter;