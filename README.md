Smart Report AI: Multi Domain Document Analyzer
Overview
Smart Report AI is a multi-agent AI system designed to analyze reports across multiple domains, including healthcare, finance, and education. It offers a user-friendly, no-login-required interface for uploading documents (PDF, JPG, PNG, TXT), extracting text, identifying domains, and generating insights and recommendations using advanced AI models.
Features

Multi-Domain Analysis: Processes reports in healthcare (e.g., medical reports), finance (e.g., financial statements), and education (e.g., academic documents), identifying domain-specific insights.
File Upload & Text Extraction: Supports drag-and-drop uploads for multiple file formats, with robust PDF text extraction using pdfjs-dist.
Domain Identification: An "Identifier Agent" classifies the domain of uploaded content, displayed via a "Find Domain" button.
User-Friendly Interface: Built with React.js and Tailwind CSS, featuring a responsive design, dark/light theme toggling, and a clean layout with a header, footer, and sidebar navigation.
FastAPI Backend: Handles file uploads and text processing with seamless frontend integration.
AI-Powered Insights: Uses AI models (e.g., Google Gemini or similar) to summarize reports and provide actionable recommendations in a card-based format.
No Login Required: Accessible without authentication for quick and easy use.
Additional Features: Includes collapsible result panels, potential chatbot integration, and sidebar navigation with a brain SVG logo and links to agents (Identifier Agent, Insight Agent, Suggestor, Chatbot).
Navigation: Utilizes react-router-dom (version 5) for routes like /home, /insight, and /suggestor.

Prerequisites

Node.js: Version 14.x or higher for the React frontend.
Python: Version 3.8 or higher for the FastAPI backend.
npm: For managing frontend dependencies.
pip: For managing Python dependencies.

Installation
Frontend Setup

Clone the repository:git clone <repository-url>
cd smart-report-ai/frontend


Install dependencies:npm install


Start the development server:npm start

The frontend will run on http://localhost:3000.

Backend Setup

Navigate to the backend directory:cd smart-report-ai/backend


Create a virtual environment and activate it:python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


Install dependencies:pip install fastapi uvicorn pdfjs-dist


Start the FastAPI server:uvicorn main:app --reload

The backend will run on http://localhost:8000.

Usage

Access the Application:
Open http://localhost:3000 in your browser.
No login is required to use the application.


Upload a Document:
Use the drag-and-drop interface on the /home route to upload a PDF, JPG, PNG, or TXT file.
Click the "Find Domain" button to identify the document's domain (e.g., healthcare, finance, education).


View Insights:
Navigate to the /insight route to view AI-generated summaries and insights.
Use the /suggestor route for actionable recommendations.


Toggle Themes:
Switch between dark and light themes using the toggle button, with preferences saved in local storage.


Explore Additional Features:
Use the sidebar to access different agents (Identifier Agent, Insight Agent, Suggestor, Chatbot).
Collapse/expand panels to view analysis results.



Project Structure
smart-report-ai/
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (e.g., Header, Footer, UploadArea)
│   │   ├── pages/       # Page components (e.g., Home, Insight, Suggestor)
│   │   ├── App.js       # Main app with routing
│   │   └── index.js     # Entry point
├── backend/
│   ├── main.py          # FastAPI application
│   ├── requirements.txt # Backend dependencies
└── README.md            # This file

Dependencies

Frontend:
React.js
Tailwind CSS
react-router-dom (version 5)
pdfjs-dist


Backend:
FastAPI
Uvicorn
pdfjs-dist (for text extraction)



Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes and commit (git commit -m "Add feature").
Push to the branch (git push origin feature-branch).
Open a pull request.

License
This project is licensed under the MIT License.
Contact
For questions or feedback, please contact the project maintainers at your-email@example.com.
