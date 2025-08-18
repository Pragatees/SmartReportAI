import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBrain, 
  FaSearch, 
  FaChartLine, 
  FaLightbulb, 
  FaBullseye, 
  FaComments,
  FaFilePdf,
  FaImage,
  FaFileAlt,
  FaMobile,
  FaArrowRight,
  FaRocket,
  FaUpload,
  FaCog,
  FaEye,
  FaCheckCircle,
  FaBars,
  FaTimes,
  FaGlobe,
  FaStar,
  FaChevronDown
} from 'react-icons/fa';

const StartPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const formatsRef = useRef(null);
  const ctaRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Rotating features animation
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 4000);

    // Workflow steps animation
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 6);
    }, 2500);

    // Mouse tracking for parallax effects
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearInterval(featureInterval);
      clearInterval(stepInterval);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (ref) => {
    window.scrollTo({
      top: ref.current.offsetTop - 80,
      behavior: 'smooth'
    });
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    window.location.href = '/home';
  };

  const features = [
    {
      icon: <FaBrain className="text-4xl text-orange-500" />,
      title: "Multi-Agent AI Architecture",
      description: "Coordinated AI agents working together for comprehensive analysis",
      color: "from-orange-400 to-orange-600",
      delay: "0ms"
    },
    {
      icon: <FaSearch className="text-4xl text-green-500" />,
      title: "Smart Report Type Detection", 
      description: "Identifier Agent automatically recognizes report domains and contexts",
      color: "from-green-400 to-green-600",
      delay: "200ms"
    },
    {
      icon: <FaChartLine className="text-4xl text-orange-600" />,
      title: "Insight Extraction via NLP",
      description: "Analyzer Agent uses advanced NLP to extract meaningful data patterns",
      color: "from-orange-500 to-orange-700",
      delay: "400ms"
    },
    {
      icon: <FaLightbulb className="text-4xl text-green-400" />,
      title: "Critical Reasoning",
      description: "Thinker Agent provides deep analysis and critical insights",
      color: "from-green-300 to-green-500",
      delay: "600ms"
    },
    {
      icon: <FaBullseye className="text-4xl text-orange-500" />,
      title: "Personalized Suggestions",
      description: "Suggestor Agent delivers tailored recommendations based on analysis",
      color: "from-orange-400 to-orange-600",
      delay: "800ms"
    },
    {
      icon: <FaComments className="text-4xl text-green-600" />,
      title: "Interactive Chatbot Support",
      description: "Real-time query resolution and conversational insights",
      color: "from-green-400 to-green-600",
      delay: "1000ms"
    }
  ];

  const supportedFormats = [
    { icon: <FaFilePdf className="text-orange-500" />, name: "PDF Reports" },
    { icon: <FaImage className="text-green-500" />, name: "OCR Images" },
    { icon: <FaFileAlt className="text-orange-600" />, name: "Text Documents" },
    { icon: <FaMobile className="text-green-600" />, name: "Mobile Friendly" }
  ];

  const workflowSteps = [
    { icon: <FaUpload />, title: "Upload", desc: "Submit your report", color: "orange" },
    { icon: <FaSearch />, title: "Identify", desc: "Detect domain type", color: "green" },
    { icon: <FaCog />, title: "Analyze", desc: "Extract key insights", color: "orange" },
    { icon: <FaEye />, title: "Think", desc: "Critical reasoning", color: "green" },
    { icon: <FaBullseye />, title: "Suggest", desc: "Personalized advice", color: "orange" },
    { icon: <FaComments />, title: "Chat", desc: "Interactive support", color: "green" }
  ];

  const FloatingElement = ({ children, className, delay = 0 }) => (
    <div 
      className={`${className} animate-float`}
      style={{ 
        animationDelay: `${delay}ms`,
        animationDuration: '6s'
      }}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 text-gray-800 overflow-x-hidden">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
          75% { transform: translateY(-15px) rotate(-1deg); }
        }
        @keyframes morphing {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.33); }
          40%, 50% { opacity: 1; }
          100% { opacity: 0; transform: scale(1.33); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-morphing { animation: morphing 8s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite; }
        .animate-gradient-shift { 
          background-size: 400% 400%;
          animation: gradient-shift 3s ease infinite;
        }
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .hover-lift:hover {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .magnetic-effect {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingElement className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20" delay={0} />
        <FloatingElement className="absolute top-40 right-20 w-16 h-16 bg-green-200 rounded-full opacity-20" delay={1000} />
        <FloatingElement className="absolute bottom-40 left-1/4 w-24 h-24 bg-orange-100 rounded-full opacity-30" delay={2000} />
        <FloatingElement className="absolute top-1/3 right-1/3 w-12 h-12 bg-green-100 rounded-full opacity-25" delay={1500} />
        
        {/* Morphing background shapes */}
        <div 
          className="absolute top-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-orange-100/20 to-green-100/20 animate-morphing"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-100/15 to-orange-100/15 animate-morphing"
          style={{
            transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`,
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Header/Navbar */}
      <header className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'glass-effect shadow-2xl' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center group cursor-pointer">
              <div className="relative">
                <FaBrain className="text-3xl text-orange-500 mr-2 group-hover:animate-spin transition-all duration-500" />
                <div className="absolute -inset-1 bg-orange-300/30 rounded-full opacity-0 group-hover:opacity-100 animate-pulse-ring"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-green-600 transition-all duration-300">
                SmartReport AI
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { text: 'Features', ref: featuresRef },
                { text: 'How It Works', ref: howItWorksRef },
                { text: 'Formats', ref: formatsRef },
                { text: 'Get Started', ref: ctaRef }
              ].map((item, index) => (
                <button 
                  key={item.text}
                  onClick={() => scrollToSection(item.ref)} 
                  className="font-medium hover:text-orange-500 transition-all duration-300 relative group magnetic-effect"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item.text}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-green-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
              <button
                onClick={handleGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 
                           rounded-full font-bold text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl
                           relative overflow-hidden group"
              >
                <span className="relative z-10">Try Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </button>
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-700 focus:outline-none relative group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative">
                {isMenuOpen ? <FaTimes className="text-2xl transition-transform duration-300 rotate-180" /> : <FaBars className="text-2xl transition-transform duration-300" />}
                <div className="absolute -inset-2 bg-orange-200/50 rounded-full opacity-0 group-hover:opacity-100 animate-pulse-ring"></div>
              </div>
            </button>
          </div>
          
          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-500 overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
            <div className="glass-effect rounded-2xl shadow-2xl p-6">
              <div className="flex flex-col space-y-4">
                {[
                  { text: 'Features', ref: featuresRef },
                  { text: 'How It Works', ref: howItWorksRef },
                  { text: 'Formats', ref: formatsRef },
                  { text: 'Get Started', ref: ctaRef }
                ].map((item, index) => (
                  <button 
                    key={item.text}
                    onClick={() => scrollToSection(item.ref)} 
                    className="font-medium hover:text-orange-500 transition-all duration-300 py-3 px-4 rounded-lg hover:bg-orange-50 text-left
                               transform hover:translate-x-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {item.text}
                  </button>
                ))}
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 
                             rounded-full font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  Try Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden pt-24 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/60 to-green-100/60"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-orange-300 to-green-300 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className={`container mx-auto px-6 py-20 relative z-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="relative group">
                <FaBrain className="text-8xl text-orange-500 animate-pulse group-hover:animate-spin transition-all duration-500" />
                <div className="absolute -inset-4 bg-orange-300/30 rounded-full blur-xl animate-pulse-ring"></div>
                <div className="absolute -inset-6 bg-green-300/20 rounded-full blur-2xl animate-pulse-ring" style={{ animationDelay: '1s' }}></div>
                
                {/* Orbiting elements */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                  <FaStar className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-orange-400 text-lg" />
                  <FaGlobe className="absolute top-1/2 -right-8 transform -translate-y-1/2 text-green-400 text-lg" />
                  <FaLightbulb className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-orange-400 text-lg" />
                  <FaRocket className="absolute top-1/2 -left-8 transform -translate-y-1/2 text-green-400 text-lg" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 bg-clip-text text-transparent animate-gradient-shift">
              SmartReport AI
            </h1>
            
            <div className="relative mb-6">
              <h2 className="text-xl md:text-3xl font-semibold text-orange-700 animate-pulse">
                Multi-Agent Insight Engine for Personalized Report Understanding
              </h2>
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-200/50 to-green-200/50 blur-lg opacity-50 animate-pulse"></div>
            </div>

            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8 transform transition-all duration-1000 hover:scale-105">
              Transform complex reports into clear, actionable insights using AI agents and chatbot support. 
              Experience the future of document analysis with our revolutionary multi-agent architecture.
            </p>
            
            <button
              onClick={handleGetStarted}
              className="mt-8 px-16 py-5 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 
                         rounded-full font-bold text-xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl
                         flex items-center mx-auto group text-white shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <FaRocket className="mr-4 group-hover:animate-bounce relative z-10 text-2xl" />
              <span className="relative z-10">Get Started</span>
              <FaArrowRight className="ml-4 group-hover:translate-x-3 transition-transform duration-300 relative z-10 text-xl" />
            </button>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <FaChevronDown className="text-2xl text-orange-500 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section ref={featuresRef} className="py-24 px-6 bg-gradient-to-r from-green-50 to-orange-50 relative">
        <div className="container mx-auto">
          <h3 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent animate-gradient-shift">
            Powerful AI Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-3xl backdrop-blur-sm border border-orange-200 transition-all duration-700 hover-lift cursor-pointer shadow-lg group
                           ${activeFeature === index ? 'bg-gradient-to-br from-orange-100 to-green-100 shadow-2xl ring-2 ring-orange-300 scale-105' : 'bg-white hover:bg-orange-50'}
                           transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                style={{ 
                  transitionDelay: feature.delay,
                  animationDelay: feature.delay 
                }}
                onMouseEnter={() => {
                  setActiveFeature(index);
                  setHoveredCard(index);
                }}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="mb-6 relative group">
                    <div className="transform group-hover:scale-125 transition-transform duration-500">
                      {feature.icon}
                    </div>
                    {(activeFeature === index || hoveredCard === index) && (
                      <div className="absolute -inset-6 bg-gradient-to-r from-orange-200/50 to-green-200/50 rounded-full blur-xl animate-pulse-ring"></div>
                    )}
                  </div>
                  
                  <h4 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                    {feature.title}
                  </h4>
                  
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Feature number indicator */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="container mx-auto">
          <h3 className="text-5xl font-bold text-center mb-20 bg-gradient-to-r from-green-500 to-orange-500 bg-clip-text text-transparent animate-gradient-shift">
            How SmartReport AI Works
          </h3>
          
          {/* Workflow Timeline */}
          <div className="max-w-7xl mx-auto mb-20">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative flex flex-col items-center group">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 text-2xl relative z-10 text-white shadow-2xl transform transition-all duration-500 hover:scale-125
                    ${currentStep === index ? 'animate-pulse scale-125' : ''}
                    ${step.color === 'orange' ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-green-400 to-green-600'}`}>
                    <div className="transform group-hover:rotate-12 transition-transform duration-300">
                      {step.icon}
                    </div>
                    
                    {/* Pulse rings */}
                    {currentStep === index && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-green-500 animate-pulse-ring"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-orange-500 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
                      </>
                    )}
                  </div>
                  
                  <h4 className="font-bold mb-2 text-center text-gray-800 group-hover:text-orange-600 transition-colors duration-300 text-lg">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 text-center group-hover:text-gray-700 transition-colors duration-300">
                    {step.desc}
                  </p>
                  
                  {/* Animated connection lines */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-20 w-full">
                      <div className={`h-1 bg-gradient-to-r from-orange-300 to-green-300 rounded-full overflow-hidden
                        ${currentStep >= index ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="h-full bg-gradient-to-r from-orange-500 to-green-500 transform -translate-x-full animate-pulse" 
                             style={{ animation: currentStep > index ? 'none' : 'pulse 2s ease-in-out infinite' }}></div>
                      </div>
                      
                      {/* Flow particles */}
                      <div className="absolute top-0 left-0 w-full h-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full absolute -top-0.5 animate-bounce" 
                             style={{ 
                               left: `${(currentStep > index ? 100 : (currentStep === index ? 50 : 0))}%`,
                               transition: 'left 2s ease-in-out'
                             }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Process Description */}
          <div className="glass-effect rounded-3xl p-12 backdrop-blur-sm border border-orange-200 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h4 className="text-3xl font-bold mb-8 text-orange-700 animate-gradient-shift bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  Intelligent Multi-Agent Processing
                </h4>
                <div className="space-y-6">
                  {[
                    { text: "Submit your report in PDF, image, or text format", icon: FaUpload },
                    { text: "Our agents collaborate to understand, analyze, and reason", icon: FaBrain },
                    { text: "Get insights with real-time chatbot support", icon: FaComments }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 group hover:transform hover:translate-x-2 transition-all duration-300">
                      <div className="flex-shrink-0 p-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full text-white group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="text-sm" />
                      </div>
                      <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300 text-lg">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="w-80 h-80 bg-gradient-to-r from-orange-200 to-green-200 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 animate-morphing">
                    <FaBrain className="text-9xl text-orange-500 animate-pulse group-hover:animate-spin transition-all duration-500" />
                  </div>
                  
                  {/* Orbiting mini icons */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s' }}>
                    <FaSearch className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-green-500 text-2xl" />
                    <FaChartLine className="absolute top-1/2 -right-6 transform -translate-y-1/2 text-orange-500 text-2xl" />
                    <FaLightbulb className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-green-500 text-2xl" />
                    <FaBullseye className="absolute top-1/2 -left-6 transform -translate-y-1/2 text-orange-500 text-2xl" />
                  </div>
                  
                  <div className="absolute -inset-8 bg-gradient-to-r from-orange-300/20 to-green-300/20 rounded-full blur-2xl animate-pulse group-hover:blur-3xl transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section ref={formatsRef} className="py-24 px-6 bg-gradient-to-r from-green-50 to-orange-50 relative overflow-hidden">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold mb-16 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent animate-gradient-shift">
            Supported Input Formats
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {supportedFormats.map((format, index) => (
              <div
                key={index}
                className="relative p-8 bg-white rounded-3xl backdrop-blur-sm border border-orange-200 hover:bg-orange-50 transition-all duration-500 hover-lift shadow-lg group cursor-pointer"
                style={{ 
                  animationDelay: `${index * 200}ms`,
                  transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
                  opacity: isVisible ? 1 : 0
                }}
                onMouseEnter={() => setHoveredCard(`format-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-green-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-6 flex justify-center transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                    {format.icon}
                  </div>
                  <p className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300 text-lg mb-2">
                    {format.name}
                  </p>
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400 to-green-400 opacity-20 animate-pulse"></div>
                </div>

                {/* Success checkmark animation */}
                {hoveredCard === `format-${index}` && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white transform scale-0 animate-ping">
                    <FaCheckCircle className="text-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="container mx-auto text-center">
          <div className="relative glass-effect rounded-3xl p-16 backdrop-blur-sm border border-orange-200 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
            {/* Background animated elements */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-gradient-to-r from-orange-400 to-green-400 rounded-full opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${4 + Math.random() * 3}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="mb-8">
                <FaRocket className="text-6xl text-orange-500 mx-auto mb-6 animate-bounce" />
              </div>
              
              <h3 className="text-5xl font-bold mb-8 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent animate-gradient-shift">
                Ready to Transform Your Reports?
              </h3>
              
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of professionals who trust SmartReport AI for intelligent report analysis. 
                Experience the AI revolution today!
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                {[
                  { icon: FaCheckCircle, text: "Free Trial Available" },
                  { icon: FaRocket, text: "Instant Setup" },
                  { icon: FaBrain, text: "AI-Powered Analysis" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-center space-x-3 p-4 bg-white/50 rounded-2xl backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group">
                    <item.icon className="text-green-500 text-xl group-hover:animate-pulse" />
                    <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleGetStarted}
                className="px-16 py-5 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 
                           rounded-full font-bold text-xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl
                           flex items-center mx-auto group text-white shadow-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <FaRocket className="mr-4 group-hover:animate-bounce relative z-10 text-2xl" />
                <span className="relative z-10">Start Analyzing Now</span>
                <FaArrowRight className="ml-4 group-hover:translate-x-3 transition-transform duration-300 relative z-10 text-xl" />
                
                {/* Button glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-green-400 rounded-full opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500"></div>
              </button>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center justify-center space-x-8 text-gray-500">
                <div className="flex items-center space-x-2">
                  <FaStar className="text-yellow-400" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <div className="hidden md:block w-px h-6 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="font-semibold">10K+ Users</span>
                </div>
                <div className="hidden md:block w-px h-6 bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <FaBrain className="text-orange-500" />
                  <span className="font-semibold">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gradient-to-r from-orange-100 to-green-100 border-t border-orange-200 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="flex items-center justify-center mb-6 group cursor-pointer">
            <div className="relative">
              <FaBrain className="text-3xl text-orange-500 mr-3 group-hover:animate-spin transition-all duration-500" />
              <div className="absolute -inset-2 bg-orange-300/30 rounded-full opacity-0 group-hover:opacity-100 animate-pulse-ring"></div>
            </div>
            <span className="text-2xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
              SmartReport AI
            </span>
          </div>
          
          <div className="space-y-2 mb-6">
            <p className="text-gray-600 font-semibold">
              Powered by Multi-Agent AI | © {new Date().getFullYear()} SmartReport AI Technologies
            </p>
            <p className="text-sm text-gray-500">
              Transforming report analysis with AI-driven innovation
            </p>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400" />
              <span>Trusted by professionals worldwide</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-1">
              <FaGlobe className="text-blue-400" />
              <span>Available globally</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StartPage;