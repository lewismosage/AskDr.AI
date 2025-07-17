import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Lock } from "lucide-react";
import axios from "../../lip/api";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

// Constants
const MESSAGE_LIMIT = 2;
const STORAGE_KEY = "chatMessageCount";

const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI health assistant. I can help you with health questions, medication information, and general wellness advice. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is authenticated (has access token)
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // Clear the message limit for authenticated users
      localStorage.removeItem(STORAGE_KEY);
      setMessageCount(0);
      setShowLimitMessage(false);
    }
  }, []);

  // Initialize message count from localStorage
  useEffect(() => {
    const storedCount = localStorage.getItem(STORAGE_KEY);
    const count = storedCount ? parseInt(storedCount) : 0;
    setMessageCount(count);

    if (count >= MESSAGE_LIMIT) {
      setShowLimitMessage(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const incrementMessageCount = () => {
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());

    if (newCount >= MESSAGE_LIMIT) {
      setShowLimitMessage(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("accessToken");
    if (!inputMessage.trim() || isTyping || (showLimitMessage && !accessToken))
      return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    if (!accessToken) {
      incrementMessageCount();
    }

    try {
      const headers = accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {};

      const res = await axios.post(
        "/chat/ask/",
        {
          question: inputMessage,
          ...(sessionId ? { session_id: sessionId } : {}),
        },
        { headers }
      );

      const data = res.data || {};
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }

      let aiText = "";
      if (typeof data.summary === "string" && data.summary.trim()) {
        aiText += data.summary.trim();
      }
      if (
        Array.isArray(data.recommendations) &&
        data.recommendations.length > 0
      ) {
        aiText += (aiText ? "\n\n" : "") + "Recommendations:";
        data.recommendations.forEach((rec: string) => {
          aiText += `\n- ${rec}`;
        });
      }
      if (!aiText) {
        aiText = "Sorry, I could not understand the response.";
      }

      const aiResponse: Message = {
        id: messages.length + 2,
        text: aiText,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      let errorMsg =
        "Sorry, there was an error getting a response from the assistant.";
      if (error?.response?.data?.error) {
        errorMsg += `\n${error.response.data.error}`;
      }
      const aiResponse: Message = {
        id: messages.length + 2,
        text: errorMsg,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Check if user has reached the message limit
  const accessToken = localStorage.getItem("accessToken");
  const hasReachedLimit = showLimitMessage && !accessToken;

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <Bot className="h-6 w-6 text-primary mr-2" />
            AskDr.AI Assistant
          </h1>
          <p className="text-sm text-gray-600">
            Your personal health companion
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-3xl ${
                  message.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    message.sender === "user" ? "ml-3" : "mr-3"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === "user"
                        ? "bg-primary text-white"
                        : "bg-secondary text-white"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-white shadow-sm border border-gray-200"
                  }`}
                >
                  <p
                    className={`text-sm whitespace-pre-line ${
                      message.sender === "user" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {message.text}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-primary-light"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex max-w-3xl">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                </div>
                <div className="bg-white shadow-sm border border-gray-200 px-4 py-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasReachedLimit && (
            <div className="flex justify-center">
              <div className="bg-white border border-yellow-200 rounded-lg p-4 max-w-md w-full shadow-sm">
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-yellow-500 mr-2" />
                  <h3 className="font-medium text-gray-900">
                    Message Limit Reached
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  You've used your {MESSAGE_LIMIT} free messages this month.
                  Please sign in to continue using the chat assistant.
                </p>
                <div className="mt-4">
                  <Link
                    to="/auth"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                hasReachedLimit
                  ? "Sign in to continue chatting..."
                  : "Ask me about your health concerns..."
              }
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isTyping || hasReachedLimit}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping || hasReachedLimit}
              className="bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          {!hasReachedLimit && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              {!sessionId && (
                <span>
                  Free messages remaining: {MESSAGE_LIMIT - messageCount} of{" "}
                  {MESSAGE_LIMIT}.{" "}
                </span>
              )}
              This AI assistant provides general health information and is not a
              substitute for professional medical advice.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
