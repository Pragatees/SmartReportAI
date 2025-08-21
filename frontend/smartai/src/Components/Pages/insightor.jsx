import React, { useState, useEffect } from "react";
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
  const [content, setContent] = useState(() => localStorage.getItem("pdfText") || "");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [goalSpecification, setGoalSpecification] = useState(() => {
    const stored = localStorage.getItem("goalSpecification");
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("pdfText", content);
  }, [content]);

  useEffect(() => {
    if (goalSpecification) {
      localStorage.setItem("goalSpecification", JSON.stringify(goalSpecification));
    } else {
      localStorage.removeItem("goalSpecification");
    }
  }, [goalSpecification]);

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
      setContent("");
      setPrimaryGoal("");
      setGoalSpecification(null);
      alert("All data cleared successfully!");
    } catch (err) {
      setError(err.message || "Failed to clear data.");
      console.error("Error clearing data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecifyGoal = async (e) => {
    e.preventDefault();
    if (!content || !primaryGoal.trim()) {
      setError("Please ensure PDF content and primary goal are provided.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const goalResponse = await fetch("http://localhost:8000/specify-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: primaryGoal,
          pdf_content: content,
        }),
      });

      if (!goalResponse.ok) {
        const errText = await goalResponse.text();
        throw new Error(`Failed to specify goal: ${goalResponse.status} - ${errText || "Unknown error"}`);
      }

      const goalData = await goalResponse.json();
      setGoalSpecification(goalData);
    } catch (err) {
      setError(err.message || "Failed to specify goal.");
      console.error("Error specifying goal:", err.message);
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
        .goal-specification {
          background: ${theme === "light" ? "rgba(255, 247, 237, 0.8)" : "rgba(31, 41, 55, 0.8)"};
          border: 1px solid ${theme === "light" ? "#fed7aa" : "#4b5563"};
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .goal-specification h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: ${theme === "light" ? "#111827" : "#d1d5db"};
        }
        .goal-specification p {
          margin-bottom: 1rem;
          color: ${theme === "light" ? "#374151" : "#9ca3af"};
        }
        .goal-specification ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          color: ${theme === "light" ? "#374151" : "#9ca3af"};
        }
        .goal-specification li {
          margin-bottom: 0.5rem;
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
            <h1 className="text-3xl font-poppins font-bold gradient-text">Smart Report AI Goal Specification</h1>
            <p className={`mt-2 text-lg font-medium ${theme === "light" ? "text-gray-800" : "text-gray-300"}`}>
              Enter your goal and get a tailored plan based on your uploaded PDF content.
            </p>
          </motion.header>

          {/* Goal Input Form */}
          <motion.div variants={itemVariants} className="mb-8">
            <form onSubmit={handleSpecifyGoal}>
              <label className={`block text-lg font-medium mb-2 ${theme === "light" ? "text-gray-800" : "text-gray-300"}`}>
                Primary Goal:
              </label>
              <textarea
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="Enter your primary goal here..."
                className={`w-full p-3 rounded-lg ${
                  theme === "light" ? "bg-white text-gray-900 border-orange-300" : "bg-gray-800 text-gray-200 border-gray-600"
                } border focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                rows={4}
                disabled={isLoading}
              />
              <motion.div className="mt-4 text-center">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-full gradient-button shadow-lg font-semibold ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:from-orange-600 hover:to-emerald-600"
                  }`}
                  whileHover={isLoading ? {} : { scale: 1.05 }}
                  whileTap={isLoading ? {} : { scale: 0.95 }}
                  aria-label="Specify goal"
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
                      Processing...
                    </>
                  ) : (
                    "Specify Goal"
                  )}
                </motion.button>
              </motion.div>
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
            </form>
          </motion.div>

          {/* Goal Specification Display */}
          <AnimatePresence>
            {goalSpecification && (
              <motion.div
                className="goal-specification"
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <h3>Goal Specification</h3>
                <p>
                  <strong>Procedure:</strong> {goalSpecification.procedure}
                </p>
                <p>
                  <strong>Approach:</strong> {goalSpecification.approach}
                </p>
                <div>
                  <strong>Steps:</strong>
                  <ul>
                    {goalSpecification.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
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
            Powered by Smart Report AI | &copy; {new Date().getFullYear()} xAI
          </motion.footer>
        </motion.section>
      </div>
    </div>
  );
};

export default ChatbotAgent;