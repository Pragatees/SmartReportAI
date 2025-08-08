import React, { useState, useEffect } from "react";
import {
  FaInfoCircle,
  FaPaperPlane,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./sidebar";

// Brain SVG
const Brain = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 4.5C8.5 4.5 6 7 6 10.5C6 12.5 7 14 8 15.5C9 17 9.5 18.5 9.5 20C9.5 21 9 22 7.5 22M12 4.5C15.5 4.5 18 7 18 10.5C18 12.5 17 14 16 15.5C15 17 14.5 18.5 14.5 20M12 4.5V2M4 12H2M12 20V22M20 12H22"
      stroke="url(#brainGradient)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="brainGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f97316" />
        <stop offset="1" stopColor="#10b981" />
      </linearGradient>
    </defs>
  </svg>
);

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } },
};
const buttonVariants = {
  hover: { scale: 1.05, rotate: 3, boxShadow: "0px 6px 12px rgba(0,0,0,0.2)" },
  tap: { scale: 0.9 },
};

const ChatbotAgent = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [domain, setDomain] = useState(() => localStorage.getItem("pdfDomain") || "");
  const [content, setContent] = useState(() => localStorage.getItem("pdfText") || "");
  const [insights, setInsights] = useState(() => {
    const stored = localStorage.getItem("insights");
    return stored ? JSON.parse(stored) : [];
  });
  const [suggestions, setSuggestions] = useState(() => {
    const stored = localStorage.getItem("suggestions");
    return stored ? JSON.parse(stored) : [];
  });
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("chatMessages");
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatStarted, setChatStarted] = useState(() => localStorage.getItem("chatStarted") === "true");

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pdfDomain", domain);
    localStorage.setItem("pdfText", content);
  }, [domain, content]);

  useEffect(() => {
    if (Array.isArray(insights) && insights.length > 0) {
      localStorage.setItem("insights", JSON.stringify(insights));
    } else {
      localStorage.removeItem("insights");
    }
  }, [insights]);

  useEffect(() => {
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      localStorage.setItem("suggestions", JSON.stringify(suggestions));
    } else {
      localStorage.removeItem("suggestions");
    }
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem("chatStarted", chatStarted.toString());
  }, [chatStarted]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const checkVectorDb = async () => {
      try {
        const response = await fetch("http://localhost:8000/vector-db-stats");
        if (!response.ok) {
          throw new Error("Failed to fetch vector database stats");
        }
        const stats = await response.json();
        if (stats.total_vectors > 0 && !chatStarted) {
          setChatStarted(true);
        } else if (stats.total_vectors === 0 && chatStarted) {
          setChatStarted(false);
          localStorage.setItem("chatStarted", "false");
        }
      } catch (err) {
        console.error("Error checking vector database:", err.message);
      }
    };
    checkVectorDb();
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  const handleClearData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const themeValue = localStorage.getItem("theme");
      localStorage.clear();
      if (themeValue) {
        localStorage.setItem("theme", themeValue);
      }
      setDomain("");
      setContent("");
      setInsights([]);
      setSuggestions([]);
      setMessages([]);
      setChatStarted(false);

      const response = await fetch("http://localhost:8000/clear-vector-db", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to clear vector database: ${response.status} - ${errText || "Unknown error"}`);
      }

      const data = await response.json();
      console.log(data.message);
      alert("All data, including vector database, cleared successfully!");
    } catch (err) {
      setError(err.message || "Failed to clear vector database.");
      console.error("Error clearing vector database:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!content || !domain || !insights.length || !suggestions.length) {
      setError("Please ensure content, domain, insights, and suggestions are available before starting the chat.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const storeResponse = await fetch("http://localhost:8000/store-vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          domain_result: { domain, reason: localStorage.getItem("domainReason") || "Domain identified" },
          insights_result: { detailed_insights: insights, domain_summary: localStorage.getItem("domainSummary") || "" },
          suggestions,
        }),
      });

      if (!storeResponse.ok) {
        const errText = await storeResponse.text();
        throw new Error(`Failed to store in vector database: ${storeResponse.status} - ${errText || "Unknown error"}`);
      }

      const storeData = await storeResponse.json();
      console.log(storeData.message);
      setChatStarted(true);
    } catch (err) {
      setError(err.message || "Failed to initialize chat.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage = { text: input, sender: "user", timestamp };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const queryResponse = await fetch("http://localhost:8000/query-vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, k: 5, distance_threshold: 2.0 }),
      });

      if (!queryResponse.ok) {
        const errText = await queryResponse.text();
        throw new Error(`Server error ${queryResponse.status}: ${errText || "Unknown error"}`);
      }

      const queryData = await queryResponse.json();
      if (!queryData.response || typeof queryData.response !== "string") {
        throw new Error("Invalid response format received from server.");
      }

      const botMessage = { text: queryData.response, sender: "bot", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || "Failed to get response from chatbot.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-inter flex ${
        theme === "light" ? "bg-gradient-to-br from-orange-50 to-emerald-50" : "bg-gradient-to-br from-gray-900 to-gray-800"
      }`}
    >
      {/* Global Styles */}
      <style>{`
        .gradient-text {
          background: linear-gradient(90deg, #f97316, #10b981);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .gradient-button {
          background: linear-gradient(90deg, #f97316, #10b981);
          color: white;
          font-weight: 600;
          transition: background 0.3s ease;
        }
        .gradient-button:hover {
          background: linear-gradient(90deg, #ea580c, #059669);
        }
        .chat-container {
          background: ${theme === "light" ? "#ffffff" : "#1f2937"};
          border: 1px solid ${theme === "light" ? "#fed7aa" : "#4b5563"};
        }
        .chat-bubble-user {
          background: ${theme === "light" ? "#f97316" : "#ea580c"};
          color: white;
          border-radius: 20px 20px 0 20px;
          margin-left: auto;
        }
        .chat-bubble-bot {
          background: ${theme === "light" ? "#e5e7eb" : "#4b5563"};
          color: ${theme === "light" ? "#111827" : "#d1d5db"};
          border-radius: 20px 20px 20px 0;
          margin-right: auto;
        }
        .timestamp {
          font-size: 0.75rem;
          color: ${theme === "light" ? "#6b7280" : "#9ca3af"};
          margin-top: 0.25rem;
        }
      `}</style>

      {/* Sidebar Component */}
      <Sidebar
        theme={theme}
        toggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        handleClearData={handleClearData}
        isLoading={isLoading}
      />

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-0"}`}>
        <motion.section className="max-w-7xl mx-auto p-8" variants={containerVariants} initial="hidden" animate="visible">
          <motion.header variants={itemVariants} className="mb-8 text-center">
            <h1 className="text-3xl font-poppins font-bold gradient-text">NeuroLens Chatbot</h1>
            <p className={`mt-2 text-lg font-medium ${theme === "light" ? "text-gray-800" : "text-gray-300"}`}>
              Interact with our AI chatbot using insights from your uploaded content.
            </p>
          </motion.header>

          {/* Domain display */}
          <AnimatePresence>
            {domain ? (
              <motion.div
                className={`p-5 rounded-lg mb-8 ${
                  theme === "light" ? "bg-orange-50/80 border-orange-300" : "bg-gray-800 border-gray-600"
                } border flex items-center justify-center space-x-3 shadow-md`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <FaInfoCircle className={`text-3xl ${theme === "light" ? "text-orange-500" : "text-emerald-400"}`} />
                <span className={`text-lg font-semibold ${theme === "light" ? "text-gray-900" : "text-gray-200"}`}>
                  Identified Domain: <strong>{domain}</strong>
                </span>
              </motion.div>
            ) : (
              <motion.p
                className={`text-center mb-8 font-semibold ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                No domain identified yet.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Start Chat Button or Chat Container */}
          <AnimatePresence>
            {!chatStarted ? (
              <motion.div className="mb-8 text-center" variants={itemVariants}>
                <motion.button
                  onClick={handleStartChat}
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-full gradient-button shadow-lg font-semibold ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:from-orange-600 hover:to-emerald-600"
                  }`}
                  whileHover={isLoading ? {} : { scale: 1.05 }}
                  whileTap={isLoading ? {} : { scale: 0.95 }}
                  aria-label="Start conversation"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin mr-2 inline-block h-5 w-5 text-white align-middle"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Initializing...
                    </>
                  ) : (
                    "Start Conversation"
                  )}
                </motion.button>
                {error && (
                  <motion.p
                    className="text-center text-red-500 mt-4 font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.div
                className={`rounded-xl shadow-lg w-full h-[60vh] flex flex-col chat-container`}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  <AnimatePresence>
                    {messages.length === 0 && !error && (
                      <motion.p
                        className="text-center text-gray-500 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Start the conversation by typing a message below.
                      </motion.p>
                    )}
                    {error && (
                      <motion.p
                        className="text-center text-red-500 font-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {error}
                      </motion.p>
                    )}
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        className={`max-w-[70%] p-4 ${
                          msg.sender === "user" ? "chat-bubble-user" : "chat-bubble-bot"
                        } flex flex-col`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-lg pt-1">{msg.sender === "user" ? "👤" : "🤖"}</span>
                          <span>{msg.text}</span>
                        </div>
                        <div className="timestamp text-right">{msg.timestamp}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className={`p-4 border-t ${theme === "light" ? "border-orange-200" : "border-gray-700"} flex items-center`}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your query..."
                    className={`flex-1 p-3 rounded-lg ${
                      theme === "light"
                        ? "bg-orange-50 text-gray-900 border-orange-300"
                        : "bg-gray-800 text-gray-200 border-gray-600"
                    } border focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    disabled={isLoading}
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={`ml-3 p-3 rounded-full gradient-button ${
                      isLoading || !input.trim() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    whileHover={isLoading || !input.trim() ? {} : { scale: 1.05 }}
                    whileTap={isLoading || !input.trim() ? {} : { scale: 0.95 }}
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : (
                      <FaPaperPlane size={20} />
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.footer
            className={`mt-16 text-center py-6 font-medium border-t ${
              theme === "light" ? "border-orange-200 text-gray-500" : "border-gray-700 text-gray-400"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Powered by NeuroLens | &copy; {new Date().getFullYear()} xAI
          </motion.footer>
        </motion.section>
      </div>
    </div>
  );
};

export default ChatbotAgent;