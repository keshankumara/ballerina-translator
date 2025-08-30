# 🌐 Ballerina Translator

A modern, full-stack translation application that combines the power of **Ballerina** backend services with a **React** frontend to provide seamless text translation, image OCR, and voice transcription capabilities using Google's Gemini AI.

![Project Structure](https://img.shields.io/badge/Backend-Ballerina-blue) ![Frontend](https://img.shields.io/badge/Frontend-React%2BVite-green) ![API](https://img.shields.io/badge/AI-Google%20Gemini-orange)

## 🚀 Features

### 🔤 **Text Translation**

- Translate text between multiple languages instantly
- Support for 100+ language pairs
- Real-time translation with Google Gemini AI

### 🖼️ **Image OCR & Translation**

- **Drag & Drop Interface**: Simply drag images onto the interface
- **Multi-format Support**: JPEG, PNG, GIF, WebP
- **Text Extraction**: Extract text from images using advanced OCR
- **Instant Translation**: Automatically translate extracted text

### 🎤 **Voice Recognition & Translation**

- **Voice Recording**: Record audio directly in the browser
- **Speech-to-Text**: Convert speech to text using Gemini Speech API
- **Multi-language Support**: Transcribe and translate from various languages

### 🎨 **Modern UI/UX**

- Responsive design for all devices
- Intuitive drag-and-drop interface
- Real-time visual feedback
- Clean, modern styling with CSS animations

## 📁 Project Structure

```
ballerina-translator/
├── Backend/                    # Ballerina API Service
│   ├── main.bal               # HTTP service endpoints & request handling
│   ├── service.bal            # Gemini API integration & business logic
│   ├── Ballerina.toml         # Project configuration
│   ├── config.toml            # API keys & server settings
│   └── Dependencies.toml      # Project dependencies
├── frontend/                   # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   └── TranslatorHub.jsx    # Main translation interface
│   │   ├── App.jsx            # Root application component
│   │   └── main.jsx           # Application entry point
│   ├── package.json           # NPM dependencies
│   └── vite.config.js         # Vite build configuration
└── README.md                  # This file
```

## 🛠️ Tech Stack

### **Backend (Ballerina)**

- **Framework**: Ballerina HTTP service
- **AI Integration**: Google Gemini API (Text, Vision, Speech)
- **Architecture**: Microservice with separated concerns
- **Features**: CORS support, error handling, input validation

### **Frontend (React + Vite)**

- **Framework**: React 18 with Vite build tool
- **Styling**: Modern CSS with animations
- **HTTP Client**: Axios for API communication
- **UI Features**: Drag & drop, file upload, audio recording

## 🚀 Quick Start

### Prerequisites

- **Ballerina** (Latest version) - [Download](https://ballerina.io/downloads/)
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/keshankumara/ballerina-translator.git
cd ballerina-translator
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Configure API key
# Edit config.toml and add your Gemini API key:
echo 'API_key = "your_gemini_api_key_here"' > config.toml

# Build and run the service
bal build
bal run
```

The backend will start on **http://localhost:8082**

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on **http://localhost:3000**

## 📋 API Endpoints

### **Text Translation**

```http
POST http://localhost:8082/translate
Content-Type: application/json

{
  "text": "Hello, world!",
  "sourceLang": "en",
  "target": "es"
}
```

### **Image OCR & Translation**

```http
POST http://localhost:8082/imageTranslate
Content-Type: application/json

{
  "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

### **Voice Transcription & Translation**

```http
POST http://localhost:8082/voiceTranslate
Content-Type: application/json

{
  "base64Audio": "base64_encoded_audio_data",
  "sourceLang": "en",
  "target": "es"
}
```

### **Health Check**

```http
GET http://localhost:8082/health
```

## ⚙️ Configuration

### Backend Configuration (`Backend/config.toml`)

```toml
# Google Gemini API Configuration
API_key = "your_gemini_api_key_here"

# Server Configuration
serverPort = 8082
clientTimeout = 30.0
```

### Frontend Configuration

The frontend automatically connects to the backend on `http://localhost:8082`. To change this, update the base URL in the API calls within `TranslatorHub.jsx`.

## 🎯 Usage Examples

### 1. **Text Translation**

1. Open the application at `http://localhost:3000`
2. Enter text in the input field
3. Select source and target languages
4. Click "Translate" to get instant results

### 2. **Image Translation**

1. **Drag & Drop**: Drag an image file onto the drop zone
2. **File Upload**: Click "Choose File" to select an image
3. The application will extract text and display the translation

### 3. **Voice Translation**

1. Click the microphone button to start recording
2. Speak clearly in your source language
3. Click stop to end recording
4. The application will transcribe and translate your speech

## 🏗️ Architecture

### **Modular Backend Design**

- **`main.bal`**: HTTP service layer handling requests, CORS, and validation
- **`service.bal`**: Business logic layer with Gemini API integrations
- **Separation of Concerns**: Clean architecture with isolated responsibilities

### **Component-Based Frontend**

- **`TranslatorHub.jsx`**: Main interface component with drag-drop functionality
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error handling and user feedback

## 🔧 Development

### **Running in Development Mode**

```bash
# Backend (Terminal 1)
cd Backend
bal run --reload

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### **Building for Production**

```bash
# Backend
cd Backend
bal build

# Frontend
cd frontend
npm run build
```

# screenshots

![dashboard](screnshots/dashboard.png)

## 🐛 Troubleshooting

### **Common Issues**

1. **Port Conflicts**: Ensure ports 8082 (backend) and 3000 (frontend) are available
2. **API Key Issues**: Verify your Gemini API key is correctly set in `config.toml`
3. **CORS Errors**: Backend includes CORS headers for frontend communication
4. **File Upload Limits**: Large images may need backend timeout adjustments

### **Logs & Debugging**

- **Backend Logs**: Ballerina provides detailed logging in the terminal
- **Frontend Debugging**: Use browser dev tools for network and console logs

**Made with ❤️ using Ballerina and React**
