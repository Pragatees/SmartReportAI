import React, { useState, useEffect } from "react";
import {
  FaFilePdf,
  FaCopy,
  FaTimes,
  FaUpload,
  FaCheckCircle,
  FaInfoCircle,
  FaSearch,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./sidebar";

// Brain SVG
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

// Framer Motion variants
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

const instructions = [
  { icon: <FaUpload />, text: "Upload or drag a PDF or image file into the designated area." },
  { icon: <FaFilePdf />, text: "Wait for NeuroLens to extract the text automatically." },
  { icon: <FaSearch />, text: "Click 'Find Domain' to identify the document's domain." },
  { icon: <FaCopy />, text: "Copy the extracted text or clear it to start over." },
];

const PdfTextExtractor = () => {
  const [pdfText, setPdfText] = useState(() => localStorage.getItem("pdfText") || "");
  const [domain, setDomain] = useState(() => localStorage.getItem("pdfDomain") || null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [success, setSuccess] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Persist theme to localStorage and update html class
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.className = theme;
  }, [theme]);

  // Persist pdfText and domain to localStorage
  useEffect(() => {
    if (pdfText) {
      localStorage.setItem("pdfText", pdfText);
    } else {
      localStorage.removeItem("pdfText");
    }
  }, [pdfText]);

  useEffect(() => {
    if (domain) {
      localStorage.setItem("pdfDomain", domain);
    } else {
      localStorage.removeItem("pdfDomain");
    }
  }, [domain]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleClearData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const themeValue = localStorage.getItem("theme"); // Preserve theme
      localStorage.clear(); // Clear all localStorage
      if (themeValue) {
        localStorage.setItem("theme", themeValue); // Restore theme
      }
      setPdfText("");
      setDomain(null);
      setSuccess(false);
      setFileInfo(null);
      document.getElementById("file-upload").value = "";

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

  const extractTextFromFile = async (file) => {
    setIsLoading(true);
    setSuccess(false);
    setDomain(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("http://localhost:8000/ocr/extract-text", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to extract text from file");
      }
      setPdfText(data.text);
      setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
      setSuccess(true);
    } catch (err) {
      console.error("Failed to extract text:", err);
      setError(err.message || "Failed to extract text from file. Please try again.");
      setPdfText("");
      setFileInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/tif",
      "image/tiff",
    ];
    if (file && validTypes.includes(file.type)) {
      await extractTextFromFile(file);
    } else {
      setError("Please upload a valid file (PDF, PNG, JPG, JPEG, TIF, TIFF).");
      setPdfText("");
      setFileInfo(null);
      setDomain(null);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/tif",
      "image/tiff",
    ];
    if (file && validTypes.includes(file.type)) {
      await extractTextFromFile(file);
    } else {
      setError("Please drop a valid file (PDF, PNG, JPG, JPEG, TIF, TIFF).");
      setPdfText("");
      setFileInfo(null);
      setDomain(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setPdfText("");
    setError("");
    setSuccess(false);
    setFileInfo(null);
    setDomain(null);
    localStorage.removeItem("pdfText");
    localStorage.removeItem("pdfDomain");
    document.getElementById("file-upload").value = "";
  };

  const handleCopy = () => {
    if (pdfText) {
      navigator.clipboard.writeText(pdfText);
      alert("Text copied to clipboard!");
    }
  };

  const handleFindDomain = async () => {
    if (pdfText) {
      setDomainLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:8000/identify-domain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pdfText }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch domain from server");
        }
        const data = await response.json();
        setDomain(data.domain);
      } catch (err) {
        console.error("Failed to identify domain:", err);
        setError("Failed to identify domain. Please try again.");
        setDomain(null);
      } finally {
        setDomainLoading(false);
      }
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
        `}
      </style>

      {/* Sidebar Component */}
      <Sidebar
        theme={theme}
        toggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        handleClearData={handleClearData}
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
              NeuroLens Identifier Agent
            </h1>
            <p
              className={`text-lg sm:text-xl max-w-3xl mx-auto font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              Extract text from PDFs or images and identify the document's domain with our AI-powered Identifier Agent. Upload or drag-and-drop your file to get started.
            </p>
            <motion.a
              href="/"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 inline-block px-8 py-3 rounded-full font-semibold text-white font-medium gradient-button shadow-lg"
            >
              Learn More About NeuroLens
            </motion.a>
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
              How to Use
            </motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* File Upload Section */}
          <motion.div
            className={`mb-12 p-8 rounded-lg border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? "border-orange-400 bg-orange-100/70"
                : theme === "light"
                ? "border-orange-200 bg-orange-50/70"
                : "border-gray-700 bg-gray-800/70"
            } backdrop-blur-sm shadow-lg`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <label
              htmlFor="file-upload"
              className={`block text-sm font-semibold mb-4 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Upload or Drop PDF/Image File
            </label>
            <input
              id="file-upload"
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/jpg,image/tif,image/tiff"
              onChange={handleFileUpload}
              disabled={isLoading}
              className={`block w-full text-sm font-medium ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }
                file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold
                ${theme === "light" ? "file:gradient-button file:text-white" : "file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"}
                disabled:file:bg-gray-400 disabled:cursor-not-allowed`}
            />
            <AnimatePresence>
              {isDragging && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 text-sm text-orange-500 text-center font-semibold"
                >
                  Drop your file here!
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {fileInfo && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`mt-4 text-sm font-medium ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
                >
                  <p><strong>File:</strong> {fileInfo.name}</p>
                  <p><strong>Size:</strong> {fileInfo.size}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Loading Spinner for File Extraction */}
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

          {/* Success Message */}
          <AnimatePresence>
            {success && !isLoading && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`text-sm mb-8 text-center font-semibold ${
                  theme === "light" ? "text-emerald-600" : "text-emerald-400"
                }`}
              >
                <FaCheckCircle className="inline-block mr-2" /> Text extracted successfully!
              </motion.p>
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

          {/* Find Domain Button */}
          <AnimatePresence>
            {success && !isLoading && (
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleFindDomain}
                  disabled={domainLoading}
                  className={`px-8 py-3 rounded-full font-semibold text-white font-medium gradient-button shadow-lg ${
                    domainLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Identify the domain of the extracted text"
                >
                  <FaSearch className="inline-block mr-2" /> Find Domain
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Domain Loading Spinner */}
          <AnimatePresence>
            {domainLoading && (
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
                    theme === "light" ? "border-orange-500" : "border-emerald-400"
                  }`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Domain Result */}
          <AnimatePresence>
            {domain && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`p-6 rounded-lg mb-8 ${
                  theme === "light" ? "bg-orange-50/70 border-orange-100" : "bg-gray-800/70 border-gray-700"
                } border flex items-center justify-center space-x-4 backdrop-blur-sm shadow-lg`}
              >
                <FaInfoCircle className={`text-2xl ${theme === "light" ? "text-orange-500" : "text-emerald-400"}`} />
                <p className={`text-sm font-semibold ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                  Identified Domain: <strong>{domain}</strong>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Output Area */}
          <div className="relative mb-12">
            <motion.textarea
              value={pdfText}
              readOnly
              rows={12}
              placeholder="Extracted text will appear here..."
              className={`w-full p-6 border rounded-lg text-sm font-medium transition-all duration-300 ${
                theme === "light"
                  ? "border-orange-200 bg-orange-50/70 text-gray-800 focus:ring-orange-400"
                  : "border-gray-700 bg-gray-800/70 text-gray-200 focus:ring-emerald-400"
              } focus:outline-none focus:ring-2 resize-none backdrop-blur-sm shadow-lg`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            />
            <AnimatePresence>
              {pdfText && (
                <motion.div
                  className="absolute top-4 right-4 flex space-x-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleCopy}
                    className={`p-2 rounded-full ${
                      theme === "light"
                        ? "text-gray-600 hover:text-orange-500 hover:bg-orange-100"
                        : "text-gray-300 hover:text-emerald-400 hover:bg-gray-600"
                    }`}
                    title="Copy extracted text to clipboard"
                    aria-label="Copy extracted text to clipboard"
                  >
                    <FaCopy size={18} />
                  </motion.button>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleClear}
                    className={`p-2 rounded-full ${
                      theme === "light"
                        ? "text-gray-600 hover:text-red-500 hover:bg-orange-100"
                        : "text-gray-300 hover:text-red-400 hover:bg-gray-600"
                    }`}
                    title="Clear extracted text"
                    aria-label="Clear extracted text"
                  >
                    <FaTimes size={18} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
        </section>
      </div>
    </div>
  );
};

export default PdfTextExtractor;