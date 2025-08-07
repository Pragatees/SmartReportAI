import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaHome,
  FaLightbulb,
  FaRobot,
  FaComments,
  FaSun,
  FaMoon,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaFilePdf,
  FaTrash,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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

// Framer Motion variants
const sidebarVariants = {
  open: { width: "280px", opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { width: 0, opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
};
const navItemVariants = {
  open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } },
};
const buttonVariants = {
  hover: { scale: 1.1, rotate: 3, boxShadow: "0px 6px 12px rgba(0,0,0,0.2)" },
  tap: { scale: 0.9 },
};
const insightVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } },
};

const navItems = [
  { icon: <FaHome />, text: "Identifier Agent", path: "/home" },
  { icon: <FaLightbulb />, text: "Insightor Agent", path: "/insight" },
  { icon: <FaRobot />, text: "Suggest Agent", path: "/suggest" },
  { icon: <FaComments />, text: "Chatbot", path: "/bot" },
  { icon: <FaFilePdf />, text: "Final Report", path: "/report" },
];

export default function InsightAgentWithSidebar() {
  // Theme and sidebar state
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Content/data state
  const [domain, setDomain] = useState(() => localStorage.getItem("pdfDomain") || "");
  const [content, setContent] = useState(() => localStorage.getItem("pdfText") || "");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [insights, setInsights] = useState(() => {
    const stored = localStorage.getItem("insights");
    return stored ? JSON.parse(stored) : [];
  });

  // Theme and color management
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Persist domain & content
  useEffect(() => {
    localStorage.setItem("pdfDomain", domain);
    localStorage.setItem("pdfText", content);
  }, [domain, content]);

  // Persist insights
  useEffect(() => {
    if (Array.isArray(insights) && insights.length > 0) {
      localStorage.setItem("insights", JSON.stringify(insights));
    } else {
      localStorage.removeItem("insights");
    }
  }, [insights]);

  // Sidebar, theme, and data management
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const toggleSidebar = () => setSidebarOpen((o) => !o);
  const toggleInsight = (i) => setExpanded((e) => ({ ...e, [i]: !e[i] }));

  const handleClearData = async () => {
    setLoading(true);
    setError("");
    try {
      const themeValue = localStorage.getItem("theme"); // Preserve theme
      localStorage.clear(); // Clear all localStorage
      if (themeValue) {
        localStorage.setItem("theme", themeValue); // Restore theme
      }
      setDomain("");
      setContent("");
      setInsights([]);
      setSummary("");
      setExpanded({});

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
      setLoading(false);
    }
  };

  // Fetch insights and summary
  const handleGetInsights = async () => {
    if (!domain.trim() || !content.trim()) {
      setError("Please provide both domain and content");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, content, language: "English" }),
      });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Server error: ${res.status} - ${errorData || "Unknown error"}`);
      }
      const data = await res.json();
      if (!data.detailed_insights || !Array.isArray(data.detailed_insights)) {
        throw new Error("Invalid detailed_insights format received from server");
      }
      setInsights(data.detailed_insights);
      setSummary(data.domain_summary || "");
      setExpanded({});
    } catch (err) {
      setError(err.message || "Failed to generate insights. Please try again.");
      setInsights([]);
      setSummary("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-inter flex ${
        theme === "light" ? "bg-gradient-to-br from-orange-50 to-emerald-50" : "bg-gradient-to-br from-gray-900 to-gray-800"
      }`}
    >
      {/* Shared Styles */}
      <style>
        {`
          .gradient-text {
            background: linear-gradient(90deg, #f97316, #10b981);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .gradient-button {
            background: linear-gradient(90deg, #f97316, #10b981);
          }
          .gradient-button:hover {
            background: linear-gradient(90deg, #ea580c, #059669);
          }
          .insight-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .insight-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
          }
          .active-nav-item {
            background: linear-gradient(90deg, rgba(249, 115, 22, 0.2), rgba(16, 185, 129, 0.2));
            border-left: 3px solid #f97316;
          }
        `}
      </style>

      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-full z-40 shadow-xl overflow-hidden ${
          theme === "light" ? "bg-white border-r border-orange-100" : "bg-gray-800 border-r border-gray-700"
        }`}
        initial={sidebarOpen ? "open" : "closed"}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="flex flex-col h-full w-[280px]">
          <div className="p-4 flex flex-col items-center border-b dark:border-gray-700">
            <div className="w-12 h-12 mb-2">
              <Brain className="w-full h-full" />
            </div>
            <motion.h2
              className="text-xl font-bold font-poppins gradient-text"
              initial={{ opacity: 1 }}
              animate={sidebarOpen ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              NeuroLens
            </motion.h2>
          </div>
          <ul className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item, idx) => (
              <motion.li
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-lg ${
                  idx === 1
                    ? "active-nav-item"
                    : theme === "light"
                    ? "hover:bg-orange-50"
                    : "hover:bg-gray-700"
                }`}
              >
                <a
                  href={item.path}
                  className={`flex items-center p-3 space-x-3 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  } font-medium`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <motion.span variants={navItemVariants} animate={sidebarOpen ? "open" : "closed"}>
                    {item.text}
                  </motion.span>
                </a>
              </motion.li>
            ))}
          </ul>
          <div className="p-4 border-t dark:border-gray-700 space-y-2">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleClearData}
              className={`w-full flex items-center justify-center p-2 rounded-lg ${
                theme === "light" ? "hover:bg-orange-50 text-orange-600" : "hover:bg-gray-700 text-emerald-400"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Clear all data except theme"
              disabled={loading}
            >
              <FaTrash size={20} />
              <motion.span
                className={`ml-3 ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
                variants={navItemVariants}
                animate={sidebarOpen ? "open" : "closed"}
              >
                Clear Data
              </motion.span>
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={toggleTheme}
              className={`w-full flex items-center justify-center p-2 rounded-lg ${
                theme === "light" ? "hover:bg-orange-50 text-orange-600" : "hover:bg-gray-700 text-emerald-400"
              }`}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
              {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
              <motion.span
                className={`ml-3 ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}
                variants={navItemVariants}
                animate={sidebarOpen ? "open" : "closed"}
              >
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* External Sidebar Toggle */}
      <motion.button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg transition-colors duration-300 ${
          theme === "light" ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "bg-gray-700 text-emerald-400 hover:bg-gray-600"
        }`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: sidebarOpen ? 280 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <FaBars size={20} />
      </motion.button>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-0"}`}>
        <motion.section
          className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.header variants={itemVariants} className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-poppins font-bold gradient-text">
              NeuroLens Insight Agent
            </h1>
            <p
              className={`mt-2 text-lg sm:text-xl max-w-3xl mx-auto font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              Review the extracted domain and content from your PDF. Click below to gain valuable insights.
            </p>
          </motion.header>

          {/* Domain Info */}
          <AnimatePresence>
            {domain ? (
              <motion.div
                className={`p-6 rounded-lg mb-8 ${
                  theme === "light" ? "bg-orange-50/70 border-orange-100" : "bg-gray-800/70 border-gray-700"
                } border flex items-center justify-center space-x-4 backdrop-blur-sm shadow-lg`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <FaInfoCircle className={`text-2xl ${theme === "light" ? "text-orange-500" : "text-emerald-400"}`} />
                <p className={`text-sm font-semibold ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                  Identified Domain: <strong>{domain}</strong>
                </p>
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`text-sm mb-8 text-center font-semibold ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                No domain identified yet. Please upload a PDF in the Identifier Agent.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Content Input */}
          <div className="mb-12">
            <motion.textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Document content will appear here..."
              rows={8}
              className={`w-full p-4 rounded-lg border transition-colors duration-300 ${
                theme === "light"
                  ? "bg-orange-50/70 border-orange-200 text-gray-800 focus:ring-orange-400"
                  : "bg-gray-800/70 border-gray-600 text-gray-200 focus:ring-emerald-400"
              } focus:outline-none focus:ring-2 resize-none shadow-lg`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            />
          </div>

          {/* Generate Insights */}
          <AnimatePresence>
            {domain && content && (
              <motion.div
                className="flex justify-center mb-12"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleGetInsights}
                  disabled={loading}
                  className={`px-8 py-3 rounded-full font-semibold text-white font-medium gradient-button shadow-lg flex items-center space-x-2 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Get valuable insights"
                >
                  {loading && (
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  <span>{loading ? "Processing..." : "Generate Insights"}</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-red-500 text-sm mb-8 text-center font-semibold"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            <div>
              {insights.length > 0 ? (
                <motion.div
                  className={`p-6 rounded-lg mb-8 ${
                    theme === "light" ? "bg-orange-50/70 border-orange-100" : "bg-gray-800/70 border-gray-700"
                  } border backdrop-blur-sm shadow-lg`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <h2
                    className={`text-2xl font-poppins font-bold mb-6 ${
                      theme === "light" ? "text-gray-800" : "text-gray-200"
                    }`}
                  >
                    Document Insights
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {insights.map((insight, i) => (
                      <motion.div
                        key={i}
                        className={`insight-card p-6 rounded-lg ${
                          theme === "light" ? "bg-white border-orange-200" : "bg-gray-900 border-gray-600"
                        } border shadow-md`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                      >
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleInsight(i)}
                        >
                          <h3
                            className={`text-lg font-semibold ${
                              theme === "light" ? "text-gray-800" : "text-gray-200"
                            }`}
                          >
                            {insight.title}
                          </h3>
                          {expanded[i] ? (
                            <FaChevronUp className={theme === "light" ? "text-orange-500" : "text-emerald-400"} />
                          ) : (
                            <FaChevronDown className={theme === "light" ? "text-orange-500" : "text-emerald-400"} />
                          )}
                        </div>
                        <AnimatePresence>
                          {expanded[i] && (
                            <motion.div
                              variants={insightVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                            >
                              <p
                                className={`text-sm font-medium mt-4 ${
                                  theme === "light" ? "text-gray-700" : "text-gray-300"
                                }`}
                              >
                                <strong>Description:</strong> {insight.description}
                              </p>
                              {insight.supporting_data?.length > 0 && (
                                <>
                                  <p
                                    className={`text-sm font-medium mt-4 ${
                                      theme === "light" ? "text-gray-700" : "text-gray-300"
                                    }`}
                                  >
                                    <strong>Supporting Data:</strong>
                                  </p>
                                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                                    {insight.supporting_data.map((item, k) => (
                                      <li
                                        key={k}
                                        className={theme === "light" ? "text-gray-600" : "text-gray-400"}
                                      >
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                              {insight.risk_factors?.length > 0 && (
                                <>
                                  <p
                                    className={`text-sm font-medium mt-4 ${
                                      theme === "light" ? "text-gray-700" : "text-gray-300"
                                    }`}
                                  >
                                    <strong>Risk Factors:</strong>
                                  </p>
                                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                                    {insight.risk_factors.map((risk, k) => (
                                      <li
                                        key={k}
                                        className={theme === "light" ? "text-red-600" : "text-red-400"}
                                      >
                                        {risk}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                  {summary && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-8 text-sm font-semibold ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      <strong>Domain Summary:</strong> {summary}
                    </motion.p>
                  )}
                </motion.div>
              ) : (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`text-sm mb-8 text-center font-semibold ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  No insights available. Click "Generate Insights" to generate insights.
                </motion.p>
              )}
            </div>
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            className={`py-8 text-center text-sm font-medium ${
              theme === "light" ? "text-gray-500 border-orange-200" : "text-gray-400 border-gray-700"
            } border-t`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            Powered by NeuroLens | &copy; {new Date().getFullYear()} xAI
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}