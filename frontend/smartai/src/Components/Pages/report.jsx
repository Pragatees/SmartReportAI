import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaHome,
  FaLightbulb,
  FaRobot,
  FaComments,
  FaSun,
  FaMoon,
  FaFilePdf,
  FaTrash,
  FaDownload,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";

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

const navItems = [
  { icon: <FaHome />, text: "Identifier Agent", path: "/home" },
  { icon: <FaLightbulb />, text: "Insightor Agent", path: "/insight" },
  { icon: <FaRobot />, text: "Suggest Agent", path: "/suggest" },
  { icon: <FaComments />, text: "Chatbot", path: "/bot" },
  { icon: <FaFilePdf />, text: "Final Report", path: "/report" },
];

export default function FinalReport() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pdfText, setPdfText] = useState(() => localStorage.getItem("pdfText") || "");
  const [pdfDomain, setPdfDomain] = useState(() => localStorage.getItem("pdfDomain") || "");
  const [insights, setInsights] = useState(() => {
    const stored = localStorage.getItem("insights");
    return stored ? JSON.parse(stored) : [];
  });
  const [suggestions, setSuggestions] = useState(() => {
    const stored = localStorage.getItem("suggestions");
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const toggleSidebar = () => setSidebarOpen((o) => !o);

  const handleClearData = async () => {
    setLoading(true);
    setError("");
    try {
      const themeValue = localStorage.getItem("theme"); // Preserve theme
      localStorage.clear(); // Clear all localStorage
      if (themeValue) {
        localStorage.setItem("theme", themeValue); // Restore theme
      }
      setPdfText("");
      setPdfDomain("");
      setInsights([]);
      setSuggestions([]);

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let yOffset = 20;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("NeuroLens Final Report", 20, yOffset);
    yOffset += 10;

    // Extracted Text
    if (pdfText) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Extracted Text:", 20, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(pdfText, 170);
      doc.text(splitText, 20, yOffset);
      yOffset += splitText.length * 5 + 10;
    }

    // Domain
    if (pdfDomain) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Identified Domain:", 20, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(pdfDomain, 20, yOffset);
      yOffset += 15;
    }

    // Insights
    if (insights.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Insights:", 20, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      insights.forEach((insight, index) => {
        const title = `${index + 1}. ${insight.title}`;
        doc.text(title, 20, yOffset);
        yOffset += 5;
        const splitDesc = doc.splitTextToSize(insight.description, 170);
        doc.text(splitDesc, 25, yOffset);
        yOffset += splitDesc.length * 5;
        if (insight.supporting_data?.length > 0) {
          insight.supporting_data.forEach((item, i) => {
            const dataItem = `- ${item}`;
            const splitData = doc.splitTextToSize(dataItem, 165);
            doc.text(splitData, 25, yOffset);
            yOffset += splitData.length * 5;
          });
        }
        yOffset += 5;
      });
    }

    // Suggestions
    if (suggestions.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Suggestions:", 20, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      suggestions.forEach((suggestion, index) => {
        const text = `${index + 1}. ${suggestion}`;
        const splitText = doc.splitTextToSize(text, 170);
        doc.text(splitText, 20, yOffset);
        yOffset += splitText.length * 5 + 5;
      });
    }

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Generated by NeuroLens | © ${new Date().getFullYear()} xAI`, 20, yOffset);

    // Download
    doc.save("NeuroLens_Final_Report.pdf");
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
        .active-nav-item {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.2), rgba(16, 185, 129, 0.2));
          border-left: 3px solid #f97316;
        }
      `}</style>

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
          <ul className="flex-1 p-4 space-y-2 overflow-auto">
            {navItems.map((item, idx) => (
              <motion.li
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-lg ${
                  idx === 4
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

      {/* Sidebar toggle button */}
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

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[280px]" : "ml-0"}`}>
        <motion.section className="max-w-7xl mx-auto p-8" variants={containerVariants} initial="hidden" animate="visible">
          <motion.header variants={itemVariants} className="mb-8 text-center">
            <h1 className="text-3xl font-poppins font-bold gradient-text">NeuroLens Final Report</h1>
            <p className={`mt-2 text-lg font-medium ${theme === "light" ? "text-gray-800" : "text-gray-300"}`}>
              Review all extracted data, insights, and suggestions. Download the report as a PDF.
            </p>
          </motion.header>

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

          {/* Download PDF Button */}
          <motion.div className="mb-8 text-center">
            <motion.button
              onClick={handleDownloadPDF}
              className="px-8 py-3 rounded-full gradient-button shadow-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Download report as PDF"
              disabled={loading}
            >
              <FaDownload className="inline-block mr-2" />
              Download Report as PDF
            </motion.button>
          </motion.div>

          {/* Extracted Text */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className={`text-2xl font-poppins font-bold mb-4 ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
              Extracted Text
            </h2>
            {pdfText ? (
              <motion.textarea
                value={pdfText}
                readOnly
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
            ) : (
              <p className={`text-center font-semibold ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                No extracted text available.
              </p>
            )}
          </motion.div>

          {/* Identified Domain */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className={`text-2xl font-poppins font-bold mb-4 ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
              Identified Domain
            </h2>
            {pdfDomain ? (
              <motion.div
                className={`p-5 rounded-lg ${
                  theme === "light" ? "bg-orange-50/80 border-orange-300" : "bg-gray-800 border-gray-600"
                } border flex items-center justify-center space-x-3 shadow-md`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <FaFilePdf className={`text-3xl ${theme === "light" ? "text-orange-500" : "text-emerald-400"}`} />
                <span className={`text-lg font-semibold ${theme === "light" ? "text-gray-900" : "text-gray-200"}`}>
                  Domain: <strong>{pdfDomain}</strong>
                </span>
              </motion.div>
            ) : (
              <p className={`text-center font-semibold ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                No domain identified.
              </p>
            )}
          </motion.div>

          {/* Insights */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className={`text-2xl font-poppins font-bold mb-4 ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
              Insights
            </h2>
            {insights.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    className={`p-6 rounded-lg border shadow-md ${
                      theme === "light" ? "bg-white border-orange-200" : "bg-gray-900 border-gray-600"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                  >
                    <h3 className={`text-lg font-semibold ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
                      {insight.title}
                    </h3>
                    <p className={`text-sm font-medium mt-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                      {insight.description}
                    </p>
                    {insight.supporting_data?.length > 0 && (
                      <ul className="list-disc list-inside mt-4 text-sm space-y-1">
                        {insight.supporting_data.map((item, i) => (
                          <li key={i} className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className={`text-center font-semibold ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                No insights available.
              </p>
            )}
          </motion.div>

          {/* Suggestions */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className={`text-2xl font-poppins font-bold mb-4 ${theme === "light" ? "text-gray-800" : "text-gray-200"}`}>
              Suggestions
            </h2>
            {suggestions.length > 0 ? (
              <motion.div
                className="px-6 py-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <ol className={`list-decimal list-inside space-y-4 text-gray-800 dark:text-gray-200`}>
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-lg leading-relaxed">
                      {suggestion}
                    </li>
                  ))}
                </ol>
              </motion.div>
            ) : (
              <p className={`text-center font-semibold ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                No suggestions available.
              </p>
            )}
          </motion.div>

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
}