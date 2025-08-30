import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./TranslatorHub.css";

const TranslatorHub = () => {
  const [inputText, setInputText] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
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

  // Image to Text
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
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

  return (
    <div className="translator-wrapper">
      <canvas id="background-canvas"></canvas>

      <div className="translator-page">
        <h1 className="title-glow">🌐 Translator Hub</h1>

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
            <section className="card image-card slide-in">
              <label className="section-label">Image to Text</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              <button
                className="ripple image-btn"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                disabled={imageLoading}
              >
                {imageLoading ? "Extracting..." : "📷 Upload Image"}
              </button>
              {imageError && <p className="error">{imageError}</p>}
              <p className="image-hint">Upload an image to extract text.</p>
            </section>
          </div>

          {/* Controls */}
          <div className="controls">
            <div className="select-container">
              <label>
                Source:
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                  <option value="ta">Tamil</option>
                </select>
              </label>
              <label>
                Target:
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                  <option value="ta">Tamil</option>
                </select>
              </label>
            </div>
            <button
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
            >
              {loading ? "Translating..." : "Translate"}
            </button>
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
