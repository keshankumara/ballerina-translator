import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactCountryFlag from "react-country-flag";
import { supportedLanguages } from "../config/languages.js";
import "./TranslatorHub.css";

const TranslatorHub = () => {
  const [inputText, setInputText] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("si");
  const [outputText, setOutputText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  // Typing effect
  useEffect(() => {
    let intervalId;
    const chars = Array.from(outputText);
    if (!chars.length) {
      setDisplayedText("");
      return;
    }
    let index = 0;
    let currentText = "";
    setDisplayedText("");
    intervalId = setInterval(() => {
      currentText += chars[index];
      setDisplayedText(currentText);
      index++;
      if (index >= chars.length) clearInterval(intervalId);
    }, 30);
    return () => clearInterval(intervalId);
  }, [outputText]);

  // Voice recognition: continuous until stopped
  const handleVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // continuous listening
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        // Always replace previous text with new voice text
        const transcript = event.results[event.resultIndex][0].transcript;
        setInputText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError(`Voice error: ${event.error}`);
        setListening(false);
      };

      recognitionRef.current.onend = () => setListening(false);
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setInputText(""); // clear previous text before starting
      recognitionRef.current.lang = sourceLang;
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // Translation
  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError("");
    setOutputText("");
    try {
      const requestBody = { text: inputText, sourceLang, target: targetLang };
      const response = await axios.post(
        "http://localhost:8082/translate",
        requestBody
      );
      if (response.data && typeof response.data.output === "string") {
        setOutputText(response.data.output);
      } else {
        setError("Unexpected response format from backend.");
      }
    } catch (err) {
      if (err.response) setError(`Server error: ${err.response.status}`);
      else if (err.request) setError("No response from server.");
      else setError(`Request error: ${err.message}`);
    }
    setLoading(false);
  };

  // Swap source and target languages
  const handleSwapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  // Image to Text
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processImageFile(file);
  };

  // Process image file (common function for upload and drag & drop)
  const processImageFile = async (file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImageError("File size must be less than 10MB.");
      return;
    }

    setImageLoading(true);
    setImageError("");
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1]; // remove data:image/...;base64,
        try {
          const response = await axios.post(
            "http://localhost:8082/imageTranslate",
            { base64Image }
          );
          if (response.data && typeof response.data.output === "string") {
            setInputText(response.data.output);
          } else {
            setImageError("Unexpected response format from backend.");
          }
        } catch (apiErr) {
          console.error("API Error:", apiErr);
          if (apiErr.response) {
            setImageError(
              `Server error: ${apiErr.response.status} - ${
                apiErr.response.data || "Unknown error"
              }`
            );
          } else if (apiErr.request) {
            setImageError(
              "No response from server. Check if backend is running."
            );
          } else {
            setImageError(`Request error: ${apiErr.message}`);
          }
        }
        setImageLoading(false);
      };
      reader.onerror = () => {
        setImageError("Failed to read image file.");
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File reading error:", err);
      setImageError("Failed to read image file.");
      setImageLoading(false);
    }
  };

  // Drag and Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone completely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      processImageFile(file);
    }
  };

  return (
    <div className="translator-wrapper">
      <canvas id="background-canvas"></canvas>

      <div className="translator-page">
        <div className="header-with-logo">
          <img src="/globe-logo.svg" alt="Globe Logo" className="app-logo" />
          <h1 className="title-glow">Ballerina Translator</h1>
        </div>

        <main className="translator-main">
          <div className="input-blocks">
            {/* Input */}
            <section className="card input-card slide-in">
              <label htmlFor="input" className="section-label">
                Enter Text
              </label>
              <textarea
                id="input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your text here..."
              />
              <button
                className={`ripple voice-btn ${listening ? "listening" : ""}`}
                onClick={handleVoiceInput}
              >
                {listening ? "🎙 Listening... Click to Stop" : "🎤 Speak"}
              </button>
            </section>

            {/* Image to Text Block */}
            <section
              className={`card image-card slide-in ${
                isDragging ? "drag-over" : ""
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <label className="section-label">📷 Image to Text</label>
              <div className="drop-zone">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />

                <div className="drop-zone-content">
                  {isDragging ? (
                    <div className="drop-indicator">
                      <div className="drop-icon">📁</div>
                      <p>Drop your image here!</p>
                    </div>
                  ) : (
                    <div className="upload-options">
                      <div className="drag-drop-text">
                        <div className="upload-icon">🖼️</div>
                        <p>Drag & drop an image here</p>
                        <span className="or-text">or</span>
                      </div>
                      <button
                        className="ripple image-btn"
                        onClick={() =>
                          fileInputRef.current && fileInputRef.current.click()
                        }
                        disabled={imageLoading}
                      >
                        {imageLoading ? "Extracting..." : "📷 Browse Files"}
                      </button>
                    </div>
                  )}
                </div>

                {imageError && <p className="error">{imageError}</p>}
                <p className="image-hint">
                  Supports JPG, PNG, GIF, WebP • Max size: 10MB
                </p>
              </div>
            </section>
          </div>

          {/* Controls */}
          <div className="controls-card card slide-in">
            <label className="section-label">⚙️ Translation Settings</label>
            <div className="controls">
              <div className="select-container">
                <label className="lang-label">
                  <span className="lang-icon">🌍</span>
                  <div className="custom-select-wrapper">
                    <div className="selected-flag-display">
                      <ReactCountryFlag
                        countryCode={
                          supportedLanguages.find(
                            (lang) => lang.code === sourceLang
                          )?.countryCode || "US"
                        }
                        svg
                        style={{
                          width: "24px",
                          height: "18px",
                          marginRight: "8px",
                          borderRadius: "3px",
                        }}
                      />
                      <span className="selected-lang-text">
                        {supportedLanguages.find(
                          (lang) => lang.code === sourceLang
                        )?.name || "English"}
                      </span>
                    </div>
                    <select
                      value={sourceLang}
                      onChange={(e) => setSourceLang(e.target.value)}
                      className="flag-select"
                    >
                      {supportedLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
                <button
                  className="swap-btn ripple"
                  onClick={handleSwapLanguages}
                  title="Swap languages"
                >
                  ⇄
                </button>
                <label className="lang-label">
                  <span className="lang-icon">🎯</span>
                  <div className="custom-select-wrapper">
                    <div className="selected-flag-display">
                      <ReactCountryFlag
                        countryCode={
                          supportedLanguages.find(
                            (lang) => lang.code === targetLang
                          )?.countryCode || "LK"
                        }
                        svg
                        style={{
                          width: "24px",
                          height: "18px",
                          marginRight: "8px",
                          borderRadius: "3px",
                        }}
                      />
                      <span className="selected-lang-text">
                        {supportedLanguages.find(
                          (lang) => lang.code === targetLang
                        )?.name || "Sinhala"}
                      </span>
                    </div>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="flag-select"
                    >
                      {supportedLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              </div>
              <button
                className="translate-btn ripple"
                onClick={handleTranslate}
                disabled={loading || !inputText.trim()}
              >
                <span className="btn-icon">🔄</span>
                {loading ? "Translating..." : "Translate"}
              </button>
            </div>
          </div>

          {/* Output */}
          <section className="card output-card fade-in delay">
            <label className="section-label">Translation</label>
            {error ? (
              <p className="error">{error}</p>
            ) : (
              <p>{displayedText || "Your translation will appear here..."}</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default TranslatorHub;
