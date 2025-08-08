import React, { useState, useEffect } from "react";
import {
  FaInfoCircle,
  FaCopy,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./sidebar";

// Brain SVG
const Brain = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 4.5C8.5 4.5 6 7 6 10.5C6 12.5 7 14 8 15.5C9 17 9.5 18.5 9.5 20C9.5 21 9 22 7.5 22M12 4.5C15.5 4.5 18 7 18 10.5C18 12.5 17 14 16 15.5C15 17 14.5 18.5 14.5 20C14.5 21 15 22 16.5 22M12 4.5V2M4 12H2M12 20V22M20 12H22M12 9V15M8.5 9H9.5C10.6 9 11.5 9.9 11.5 11V11.5C11.5 12.6 12.4 13.5 13.5 13.5H14.5C15.6 13.5 16.5 12.6 16.5 11.5V11C16.5 9.9 17.4 9 18.5 9H19.5"
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
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 150, damping: 20 } },
  hover: { scale: 1.02, boxShadow: "0px 8px 16px rgba(0,0,0,0.25)" },
};

const SuggestorAgent = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [insights, setInsights] = useState(() => {
    const stored = localStorage.getItem("insights");
    return stored ? JSON.parse(stored) : [];
  });
  const [suggestions, setSuggestions] = useState(() => {
    const stored = localStorage.getItem("suggestions");
    return stored ? JSON.parse(stored) : [];
  });
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [error, setError] = useState("");
  const [domain, setDomain] = useState(() => localStorage.getItem("pdfDomain") || "");
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

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

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  const handleClearData = async () => {
    setSuggestionLoading(true);
    setError("");
    try {
      const themeValue = localStorage.getItem("theme");
      localStorage.clear();
      if (themeValue) {
        localStorage.setItem("theme", themeValue);
      }
      setInsights([]);
      setSuggestions([]);
      setDomain("");

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
      setSuggestionLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    if (!insights || insights.length === 0) {
      setError("No insights available to generate suggestions.");
      return;
    }
    setSuggestionLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/generate-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insights }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error ${res.status}: ${errText || "Unknown error"}`);
      }
      const data = await res.json();
      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        throw new Error("Invalid suggestions format received from server.");
      }
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err.message || "Failed to generate suggestions.");
      setSuggestions([]);
    } finally {
      setSuggestionLoading(false);
    }
  };

  const handleCopy = (suggestion, index) => {
    navigator.clipboard.writeText(suggestion);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
        .suggestion-card {
          background-color: ${theme === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(31, 41, 55, 0.95)"};
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .suggestion-card:hover .copy-button {
          opacity: 1;
        }
        .copy-button {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      `}</style>

      {/* Sidebar Component */}
      <Sidebar
        theme={theme}
        toggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        handleClearData={handleClearData}
        isLoading={suggestionLoading}
      />

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-0"}`}>
        <motion.section className="max-w-7xl mx-auto p-8" variants={containerVariants} initial="hidden" animate="visible">
          <motion.header variants={itemVariants} className="mb-8 text-center">
            <h1 className="text-4xl font-poppins font-bold gradient-text">NeuroLens Suggestor Agent</h1>
            <p className={`mt-2 text-lg font-medium ${theme === "light" ? "text-gray-800" : "text-gray-300"}`}>
              Generate AI-powered suggestions based on your insights. Click below to get started.
            </p>
          </motion.header>

          {/* Domain display */}
          <AnimatePresence>
            {domain ? (
              <motion.div
                className={`p-6 rounded-lg mb-8 ${
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

          {/* Get Suggestions Button */}
          <motion.div className="mb-12 text-center">
            <motion.button
              onClick={fetchSuggestions}
              disabled={suggestionLoading || !insights.length}
              className={`px-10 py-4 rounded-full gradient-button shadow-lg text-lg font-semibold ${
                suggestionLoading || !insights.length
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-orange-600 hover:to-emerald-600"
              }`}
              whileHover={!suggestionLoading && insights.length ? { scale: 1.05 } : {}}
              whileTap={!suggestionLoading && insights.length ? { scale: 0.95 } : {}}
              aria-label="Get AI-generated suggestions"
            >
              {suggestionLoading ? (
                <>
                  <svg
                    className="animate-spin mr-2 inline-block h-6 w-6 text-white align-middle"
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
                  Generating...
                </>
              ) : (
                "Get Suggestions"
              )}
            </motion.button>
          </motion.div>

          {/* Suggestions display */}
          <AnimatePresence>
            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error && (
                <motion.p
                  className="col-span-full text-center text-red-500 text-lg font-semibold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {error}
                </motion.p>
              )}
              {!error && !suggestionLoading && suggestions.length === 0 && (
                <motion.p
                  className="col-span-full text-center text-gray-500 text-lg font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  No suggestions generated yet. Click "Get Suggestions" to start.
                </motion.p>
              )}
              {!error &&
                suggestions.length > 0 &&
                suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="suggestion-card relative"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                          Suggestion {index + 1}
                        </h3>
                        <p className={`text-base leading-relaxed ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                          {suggestion}
                        </p>
                      </div>
                      <motion.button
                        className={`copy-button p-2 rounded-full ${
                          theme === "light" ? "bg-orange-100 text-orange-600" : "bg-gray-700 text-emerald-400"
                        }`}
                        onClick={() => handleCopy(suggestion, index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Copy suggestion"
                      >
                        <FaCopy size={18} />
                      </motion.button>
                    </div>
                    {copiedIndex === index && (
                      <motion.span
                        className="absolute top-2 right-2 text-sm text-emerald-500 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Copied!
                      </motion.span>
                    )}
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <motion.footer
            className={`mt-16 text-center py-6 font-medium ${
              theme === "light" ? "border-orange-200 text-gray-500" : "border-gray-700 text-gray-400"
            } border-t`}
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

export default SuggestorAgent;