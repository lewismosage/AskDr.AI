import React, { useState } from 'react';
import { Shield, Bot, User, Send } from 'lucide-react';
import axios from '../../lip/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AnonymousChatProps {
  initialMessages?: Message[];
}


const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AnonymousChat: React.FC<AnonymousChatProps> = ({ initialMessages }) => {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('anonymous_session_id');
  });
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [
      {
        id: 1,
        text: "Hello! I'm your anonymous mental health companion. I'm here to provide a safe, judgment-free space where you can share your thoughts and feelings. Everything we discuss is completely confidential. How are you feeling today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]
  );
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    try {
      const res = await axios.post('/mentalhealth/chat/', {
        message: userMessage.text,
        ...(sessionId ? { session_id: sessionId } : {})
      });
      const data = res.data || {};
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem('anonymous_session_id', data.session_id);
      }
      let aiText = '';
      if (typeof data.reply === 'string' && data.reply.trim()) {
        aiText = data.reply.trim();
      } else if (data.error) {
        aiText = 'Sorry, there was an error: ' + (typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      } else {
        aiText = 'Sorry, I could not understand the response.';
      }
      const aiResponse: Message = {
        id: messages.length + 2,
        text: aiText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      let errorMsg = 'Sorry, there was an error getting a response from the MentalWell AI.';
      if (error?.response?.data?.error) {
        errorMsg += `\n${error.response.data.error}`;
      }
      const aiResponse: Message = {
        id: messages.length + 2,
        text: errorMsg,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Main Chat Area */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl shadow-lg h-[32rem] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' ? 'bg-primary text-white' : 'bg-secondary text-white'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div className={`px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-line">
                      {message.sender === 'ai'
                        ? message.text.split(/\n/).map((line, idx) => (
                            <React.Fragment key={idx}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))
                        : message.text}
                    </p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-primary-light' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share what's on your mind... (completely anonymous)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-6">
        {/* Privacy Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-green-800 mb-1">100% Anonymous & Confidential</h3>
              <p className="text-sm text-green-700">
                This chat is completely anonymous. No personal information is stored or shared.<br />
                If you're in crisis, please contact emergency services or a crisis hotline immediately.
              </p>
            </div>
          </div>
        </div>
        {/* Crisis Resources */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Crisis Resources</h3>
          <div className="text-sm text-red-700 space-y-1">
            <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
            <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
            <p><strong>Emergency:</strong> 911</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousChat;
