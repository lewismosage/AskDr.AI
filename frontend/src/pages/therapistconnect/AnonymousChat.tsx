import React, { useState, useEffect } from "react";
import { Shield, Bot, User, Send, Lock } from "lucide-react";
import axios from "../../lip/api";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AnonymousChatProps {
  initialMessages?: Message[];
}

// Constants
const MESSAGE_LIMIT = 5;
const STORAGE_KEY = "mentalHealthMessageCount";

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const AnonymousChat: React.FC<AnonymousChatProps> = ({ initialMessages }) => {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem("anonymous_session_id");
  });
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [
      {
        id: 1,
        text: "Hello! I'm your anonymous mental health companion. I'm here to provide a safe, judgment-free space where you can share your thoughts and feelings. Everything we discuss is completely confidential. How are you feeling today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]
  );
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "plus" | "pro" | null>(null);
  const [messagesAllowed, setMessagesAllowed] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // Clear message limits if user is authenticated
      localStorage.removeItem(STORAGE_KEY);
      setMessageCount(0);
      setShowLimitMessage(false);
      checkChatAccess(); // Check user's plan and message limits
    } else if (messageCount >= MESSAGE_LIMIT) {
      // Redirect to auth with return path if limit reached
      navigate(`/auth?from=${encodeURIComponent(location.pathname)}`);
    }
  }, [messageCount, navigate, location.pathname]);

  // Check backend access for authenticated users
  const checkChatAccess = async () => {
    try {
      const response = await axios.get("/features/check-chat-access/");
      setUserPlan(response.data.plan);
      setMessagesAllowed(response.data.messages_allowed);
      if (!response.data.has_access) {
        setShowLimitMessage(true);
      }
    } catch (error) {
      console.error("Error checking chat access:", error);
    }
  };

  // Initialize message count from localStorage
  useEffect(() => {
    const storedCount = localStorage.getItem(STORAGE_KEY);
    const count = storedCount ? parseInt(storedCount) : 0;
    setMessageCount(count);

    if (count >= MESSAGE_LIMIT) {
      setShowLimitMessage(true);
    }
  }, []);

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
        "/mentalhealth/chat/",
        {
          message: inputMessage,
          ...(sessionId ? { session_id: sessionId } : {}),
        },
        { headers }
      );

      const data = res.data || {};
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem("anonymous_session_id", data.session_id);
      }

      let aiText = "";
      if (typeof data.reply === "string" && data.reply.trim()) {
        aiText = data.reply.trim();
      } else if (data.error) {
        aiText =
          "Sorry, there was an error: " +
          (typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error));
      } else {
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
        "Sorry, there was an error getting a response from the MentalWell AI.";
      
      if (error?.response?.data?.error === "message_limit_reached") {
        errorMsg = `You've reached your monthly message limit. ${
          userPlan === "free"
            ? "Upgrade your plan to continue chatting."
            : "Please try again next month."
        }`;
        
        // Force update the UI to show upgrade options
        if (!userPlan) {
          try {
            const response = await axios.get("/api/features/check-chat-access/");
            setUserPlan(response.data.plan);
            setMessagesAllowed(response.data.messages_allowed);
          } catch (err) {
            console.error("Error checking chat access:", err);
          }
        }
        setShowLimitMessage(true);
      } else if (error?.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error?.response?.data?.error) {
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

  // Check if user has reached the message limit
  const accessToken = localStorage.getItem("accessToken");
  const hasReachedLimit =
    showLimitMessage ||
    (!accessToken && messageCount >= MESSAGE_LIMIT) ||
    (userPlan === "free" && messageCount >= (messagesAllowed || 10));

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
                        : message.text.toLowerCase().includes("error")
                        ? "bg-red-50 border border-red-200" // Special styling for error messages
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">
                      {message.sender === "ai"
                        ? message.text.split(/\n/).map((line, idx) => (
                            <React.Fragment key={idx}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))
                        : message.text}
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
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
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
                      {!accessToken
                        ? "Message Limit Reached"
                        : userPlan === "free"
                        ? "Monthly Limit Reached"
                        : "Message Limit Reached"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {!accessToken
                      ? "Sign in to continue using the chat assistant."
                      : userPlan === "free"
                      ? `You've used all ${messagesAllowed} free messages this month. Upgrade to continue chatting.`
                      : "You need to be subscribed to continue using the chat assistant."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {!accessToken ? (
                      <button
                        onClick={() => navigate(`/auth?from=${encodeURIComponent(location.pathname)}`)}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                      >
                        Sign In
                      </button>
                    ) : userPlan === "free" ? (
                      <>
                        <Link
                          to="/pricing"
                          className="flex-1 text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                        >
                          Upgrade Plan
                        </Link>
                        <button
                          onClick={() => setShowLimitMessage(false)}
                          className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/pricing"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                      >
                        View Plans
                      </Link>
                    )}
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
                placeholder={
                  hasReachedLimit
                    ? accessToken
                      ? "Upgrade your plan to continue chatting..."
                      : "Sign in to continue chatting..."
                    : "Share what's on your mind... (completely anonymous)"
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                disabled={isTyping || hasReachedLimit}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping || hasReachedLimit}
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            {userPlan === "free" && !hasReachedLimit && (
              <div className="text-xs text-gray-500 mt-1 text-right">
                Messages used: {messageCount}/{messagesAllowed}
              </div>
            )}
            {!hasReachedLimit && !accessToken && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Free messages remaining: {MESSAGE_LIMIT - messageCount} of{" "}
                {MESSAGE_LIMIT}
              </p>
            )}
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
              <h3 className="text-sm font-semibold text-green-800 mb-1">
                100% Anonymous & Confidential
              </h3>
              <p className="text-sm text-green-700">
                This chat is completely anonymous. No personal information is
                stored or shared.
                <br />
                If you're in crisis, please contact emergency services or a
                crisis hotline immediately.
              </p>
            </div>
          </div>
        </div>
        {/* Crisis Resources */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Crisis Resources</h3>
          <div className="text-sm text-red-700 space-y-1">
            <p>
              <strong>National Suicide Prevention Lifeline:</strong> 988
            </p>
            <p>
              <strong>Crisis Text Line:</strong> Text HOME to 741741
            </p>
            <p>
              <strong>Emergency:</strong> 911
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousChat;