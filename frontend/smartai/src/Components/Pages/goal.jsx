import React, { useState, useEffect } from "react";
import { FaBullseye, FaCheckCircle, FaTimes, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./sidebar";

// Brain SVG for consistency with Smart Report AI
const Brain = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
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

// Framer Motion variants for animations
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

// Instructions for the goal specification process
const instructions = [
  { icon: <FaBullseye />, text: "Enter your specific goal in the input field." },
  { icon: <FaCheckCircle />, text: "Ensure extracted PDF text is available in local storage." },
  { icon: <FaInfoCircle />, text: "Click 'Specify Goal' to generate an actionable plan." },
];

const GoalSpecifyAgent = () => {
  // Initialize state with values from localStorage
  const [goal, setGoal] = useState(() => localStorage.getItem("goal") || "");
  const [pdfText, setPdfText] = useState(() => localStorage.getItem("pdfText") || "");
  const [response, setResponse] = useState(() => {
    const savedResponse = localStorage.getItem("response");
    return savedResponse ? JSON.parse(savedResponse) : null;
  });
  const [error, setError] = useState(() => localStorage.getItem("error") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Persist theme to localStorage and update html class
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.className = theme;
  }, [theme]);

  // Persist goal to localStorage
  useEffect(() => {
    localStorage.setItem("goal", goal);
  }, [goal]);

  // Persist response to localStorage
  useEffect(() => {
    if (response) {
      localStorage.setItem("response", JSON.stringify(response));
    } else {
      localStorage.removeItem("response");
    }
  }, [response]);

  // Persist error to localStorage
  useEffect(() => {
    localStorage.setItem("error", error);
  }, [error]);

  // Monitor pdfText changes in localStorage
  useEffect(() => {
    const storedPdfText = localStorage.getItem("pdfText") || "";
    setPdfText(storedPdfText);
  }, []);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleClear = () => {
    setGoal("");
    setResponse(null);
    setError("");
    localStorage.removeItem("goal");
    localStorage.removeItem("response");
    localStorage.removeItem("error");
  };

  const handleSpecifyGoal = async () => {
    if (!goal.trim()) {
      setError("Please enter a goal.");
      return;
    }
    if (!pdfText.trim()) {
      setError("No PDF text found in local storage. Please upload a document first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse(null);

    try {
      const apiResponse = await fetch("http://localhost:8000/specify-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, pdf_content: pdfText }),
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        // Handle HTTP errors (e.g., 400, 500) with detail field
        setError(data.detail || "Failed to specify goal.");
        return;
      }

      // Check for "Not domain matched" case
      if (data === "Not domain matched") {
        setError("The provided goal does not match the domain of the uploaded document.");
        return;
      }

      // Validate response structure
      if (!data.procedure || !data.approach || !Array.isArray(data.steps) || data.steps.length < 3 || data.steps.length > 5) {
        setError("Invalid response format from the server.");
        return;
      }

      setResponse(data);
    } catch (err) {
      setError("Failed to specify goal. Please check your connection and try again.");
      console.error("Error specifying goal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-inter flex ${
        theme === "light"
          ? "bg-gradient-to-br from-orange-50 to-emerald-50"
          : "bg-gradient-to-br from-gray-900 to-gray-800"
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
          .timeline-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: linear-gradient(90deg, #f97316, #10b981);
          }
        `}
      </style>

      {/* Sidebar Component */}
      <Sidebar
        theme={theme}
        toggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        handleClearData={() => {
          setGoal("");
          setResponse(null);
          setError("");
          localStorage.removeItem("pdfText");
          localStorage.removeItem("goal");
          localStorage.removeItem("response");
          localStorage.removeItem("error");
        }}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-0"}`}>
        <motion.section
          className="py-12 px-4 sm:px-6 lg:px-8 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl font-poppins font-extrabold mb-4 gradient-text">
              Smart Report AI Goal Specification Agent
            </h1>
            <h1 className="text-[50px]">📈</h1>
            <p
              className={`text-lg sm:text-xl max-w-3xl mx-auto font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              Specify your goal and leverage our AI to generate a clear, actionable plan based on your uploaded document's content. Enter your goal below to get started! 🚀
            </p>
          </motion.div>
        </motion.section>

        <section className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Instructions Section */}
          <motion.div className="mb-12" variants={containerVariants} initial="hidden" animate="visible">
            <motion.h3
              variants={itemVariants}
              className={`text-2xl font-poppins font-bold mb-6 text-center ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              How to Specify Your Goal
            </motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructions.map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, boxShadow: "0px 8px 16px rgba(0,0,0,0.15)" }}
                  className={`p-6 rounded-lg ${
                    theme === "light" ? "bg-orange-50/70 border-orange-100" : "bg-gray-800/70 border-gray-700"
                  } border flex items-start space-x-4 backdrop-blur-sm shadow-lg transition-all duration-300`}
                >
                  <div className={`text-2xl ${theme === "light" ? "text-orange-500" : "text-emerald-400"}`}>
                    {step.icon}
                  </div>
                  <p className={`text-sm font-medium ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                    {step.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Goal Input Section */}
          <motion.div
            className={`mb-12 p-8 rounded-lg border-2 transition-all duration-300 ${
              theme === "light"
                ? "border-orange-200 bg-orange-50/70"
                : "border-gray-700 bg-gray-800/70"
            } backdrop-blur-sm shadow-lg`}
            variants={itemVariants}
          >
            <label
              htmlFor="goal-input"
              className={`block text-sm font-semibold mb-4 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Enter Your Goal
            </label>
            <div className="relative">
              <input
                id="goal-input"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="E.g., Develop a risk mitigation plan for the project"
                disabled={isLoading}
                className={`w-full p-4 pr-12 border rounded-lg text-sm font-medium transition-all duration-300 ${
                  theme === "light"
                    ? "border-orange-200 bg-orange-50/50 text-gray-800 focus:ring-orange-400"
                    : "border-gray-700 bg-gray-800/50 text-gray-200 focus:ring-emerald-400"
                } focus:outline-none focus:ring-2`}
              />
              <AnimatePresence>
                {goal && (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleClear}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                      theme === "light"
                        ? "text-gray-600 hover:text-red-500 hover:bg-orange-100"
                        : "text-gray-300 hover:text-red-400 hover:bg-gray-600"
                    }`}
                    title="Clear goal input"
                    aria-label="Clear goal input"
                  >
                    <FaTimes size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleSpecifyGoal}
              disabled={isLoading}
              className={`mt-6 px-8 py-3 rounded-full font-semibold text-white font-medium gradient-button shadow-lg ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Specify goal and generate plan"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="inline-block mr-2 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <FaBullseye className="inline-block mr-2" /> Specify Goal
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Loading Spinner */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${
                    theme === "light" ? "border-orange-500" : "border-emerald-400"
                  }`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
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

          {/* Response Display with Timeline */}
          <AnimatePresence>
            {response && response.procedure && response.approach && Array.isArray(response.steps) && (
              <motion.div
                className={`mb-12 p-8 rounded-lg ${
                  theme === "light" ? "bg-orange-50/70 border-orange-100" : "bg-gray-800/70 border-gray-700"
                } border backdrop-blur-sm shadow-lg`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h3
                  variants={itemVariants}
                  className={`text-2xl font-poppins font-bold mb-6 ${
                    theme === "light" ? "text-gray-800" : "text-gray-200"
                  }`}
                >
                  Goal Specification Plan 📋
                </motion.h3>
                <div className="relative">
                  {/* Timeline Line */}
                  <div
                    className={`absolute left-4 top-0 h-full w-1 ${
                      theme === "light" ? "bg-orange-200" : "bg-gray-700"
                    }`}
                  ></div>

                  {/* Procedure */}
                  <motion.div variants={itemVariants} className="mb-8 flex items-start">
                    <div className="timeline-dot mt-1 mr-4"></div>
                    <div className="flex-1">
                      <h4
                        className={`text-lg font-semibold ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        Procedure
                      </h4>
                      <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                        {response.procedure}
                      </p>
                    </div>
                  </motion.div>

                  {/* Approach */}
                  <motion.div variants={itemVariants} className="mb-8 flex items-start">
                    <div className="timeline-dot mt-1 mr-4"></div>
                    <div className="flex-1">
                      <h4
                        className={`text-lg font-semibold ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        Approach
                      </h4>
                      <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                        {response.approach}
                      </p>
                    </div>
                  </motion.div>

                  {/* Steps */}
                  <motion.div variants={itemVariants} className="flex items-start">
                    <div className="timeline-dot mt-1 mr-4"></div>
                    <div className="flex-1">
                      <h4
                        className={`text-lg font-semibold ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        Steps
                      </h4>
                      <ul className="list-disc list-inside space-y-2">
                        {response.steps.map((step, index) => (
                          <li
                            key={index}
                            className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
                          >
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
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
            Powered by Smart Report AI | &copy; {new Date().getFullYear()} xAI
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default GoalSpecifyAgent;