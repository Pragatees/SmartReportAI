import React from "react";
import { FaHome, FaLightbulb, FaRobot, FaComments, FaFilePdf, FaTrash, FaSun, FaMoon, FaBars } from "react-icons/fa";
import { motion } from "framer-motion";

// Brain SVG Component with Hover Animation
const Brain = ({ className }) => (
  <motion.svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ rotate: 0, scale: 1 }}
    whileHover={{ rotate: 5, scale: 1.1 }}
    transition={{ type: "spring", stiffness: 200, damping: 10 }}
  >
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
  </motion.svg>
);

// Animation Variants for Elements (no sidebar width animation)
const buttonVariants = {
  hover: { scale: 1.1, boxShadow: "0px 8px 16px rgba(0,0,0,0.25)", transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

const textVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.2 } },
};

// Navigation Items
const navItems = [
  { icon: <FaHome />, text: "Identifier Agent", path: "/home" },
  { icon: <FaLightbulb />, text: "Insightor Agent", path: "/insight" },
  { icon: <FaRobot />, text: "Suggest Agent", path: "/suggest" },
  { icon: <FaComments />, text: "Chatbot", path: "/bot" },
  { icon: <FaFilePdf />, text: "Final Report", path: "/report" },
];

const Sidebar = ({ theme, toggleTheme, sidebarOpen, toggleSidebar, handleClearData, isLoading }) => {
  const currentPath = window.location.pathname;

  return (
    <>
      {/* Sidebar Styles */}
      <style>{`
        .gradient-text {
          background: linear-gradient(90deg, #f97316, #10b981);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .active-nav-item {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.3), rgba(16, 185, 129, 0.3));
          border-left: 4px solid #f97316;
          box-shadow: inset 0 0 10px rgba(249, 115, 22, 0.2);
        }
        .nav-item:hover {
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.1), rgba(16, 185, 129, 0.1));
          transform: translateX(5px);
          transition: all 0.2s ease;
        }
        .glow-effect:hover {
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.5), 0 0 15px rgba(16, 185, 129, 0.5);
        }
      `}</style>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-40 shadow-2xl overflow-hidden ${
          theme === "light" ? "bg-white border-r border-orange-100" : "bg-gray-900 border-r border-gray-800"
        }`}
        style={{ width: sidebarOpen ? "280px" : "0px", transition: "none" }}
      >
        <div className="flex flex-col h-full w-[280px]">
          <div className="p-6 flex flex-col items-center border-b dark:border-gray-800">
            <motion.div
              className="w-16 h-16 mb-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            >
              <Brain className="w-full h-full" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold font-poppins gradient-text"
              variants={textVariants}
              initial="initial"
              animate="animate"
            >
              Smart Report AI
            </motion.h2>
          </div>

          <ul className="flex-1 p-4 space-y-3 overflow-auto">
            {navItems.map((item, idx) => (
              <li
                key={idx}
                className={`rounded-lg nav-item ${
                  currentPath === item.path
                    ? "active-nav-item"
                    : theme === "light"
                    ? "hover:bg-orange-50"
                    : "hover:bg-gray-800"
                }`}
              >
                <a
                  href={item.path}
                  className={`flex items-center p-3 space-x-4 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  } font-medium`}
                >
                  <motion.span
                    className="text-2xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className={sidebarOpen ? "block" : "hidden"}>{item.text}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="p-4 border-t dark:border-gray-800 space-y-3">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleClearData}
              className={`w-full flex items-center justify-center p-3 rounded-lg glow-effect ${
                theme === "light" ? "hover:bg-orange-100 text-orange-600" : "hover:bg-gray-800 text-emerald-400"
              }`}
              aria-label="Clear all data except theme"
              disabled={isLoading}
            >
              <motion.span whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <FaTrash size={20} />
              </motion.span>
              <span className={`ml-3 ${theme === "light" ? "text-gray-700" : "text-gray-200"} ${sidebarOpen ? "block" : "hidden"}`}>
                Clear Data
              </span>
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={toggleTheme}
              className={`w-full flex items-center justify-center p-3 rounded-lg glow-effect ${
                theme === "light" ? "hover:bg-orange-100 text-orange-600" : "hover:bg-gray-800 text-emerald-400"
              }`}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
              <motion.span whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
              </motion.span>
              <span className={`ml-3 ${theme === "light" ? "text-gray-700" : "text-gray-200"} ${sidebarOpen ? "block" : "hidden"}`}>
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <motion.button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg transition-colors duration-300 glow-effect ${
          theme === "light" ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "bg-gray-800 text-emerald-400 hover:bg-gray-700"
        }`}
        style={{ left: sidebarOpen ? "284px" : "4px" }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <FaBars size={20} />
      </motion.button>
    </>
  );
};

export default Sidebar;