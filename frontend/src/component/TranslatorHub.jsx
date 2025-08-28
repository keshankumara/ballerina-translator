import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./TranslatorHub.css";

const TranslatorHub = () => {
  // Common states
  const [activeTab, setActiveTab] = useState("text");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("si");
  const [outputText, setOutputText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Text translation states
  const [inputText, setInputText] = useState("");

  // Image translation states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Voice translation states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);

  // Typing effect for output (Unicode-safe)
  useEffect(() => {
    let intervalId;
    const chars = Array.from(outputText);
    if (chars.length === 0) {
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
      if (index >= chars.length) {
        clearInterval(intervalId);
      }
    }, 30);
    return () => {
      clearInterval(intervalId);
    };
  }, [outputText]);

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/jpeg;base64, prefix
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Convert audio blob to base64
  const convertAudioToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        // Remove the data:audio/webm;base64, prefix
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle text translation
  const handleTextTranslate = async () => {
    setLoading(true);
    setError("");
    setOutputText("");
    try {
      const requestBody = { text: inputText, sourceLang, target: targetLang };
      const response = await axios.post(
        "http://localhost:8080/translate",
        requestBody
      );
      if (response.data && typeof response.data.output === "string") {
        setOutputText(response.data.output);
      } else {
        setError("Unexpected response format from backend.");
      }
    } catch (err) {
      if (err.response) setError(`Server error: ${err.response.status}`);
      else if (err.request) setError("No response from server. Check backend.");
      else setError(`Request error: ${err.message}`);
    }
    setLoading(false);
  };

  // Handle image upload and OCR
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageTranslate = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setOutputText("");
    try {
      const base64Image = await convertToBase64(selectedImage);
      const requestBody = { base64Image };
      const response = await axios.post(
        "http://localhost:8080/imageTranslate",
        requestBody
      );
      if (response.data && typeof response.data.output === "string") {
        setOutputText(response.data.output);
      } else {
        setError("Unexpected response format from backend.");
      }
    } catch (err) {
      if (err.response) setError(`Server error: ${err.response.status}`);
      else if (err.request) setError("No response from server. Check backend.");
      else setError(`Request error: ${err.message}`);
    }
    setLoading(false);
  };

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceTranslate = async () => {
    if (!audioBlob) {
      setError("Please record audio first.");
      return;
    }

    setLoading(true);
    setError("");
    setOutputText("");
    try {
      const base64Audio = await convertAudioToBase64(audioBlob);
      const requestBody = { base64Audio, sourceLang, target: targetLang };
      const response = await axios.post(
        "http://localhost:8080/voiceTranslate",
        requestBody
      );
      if (response.data && typeof response.data.output === "string") {
        setOutputText(response.data.output);
      } else {
        setError("Unexpected response format from backend.");
      }
    } catch (err) {
      if (err.response) setError(`Server error: ${err.response.status}`);
      else if (err.request) setError("No response from server. Check backend.");
      else setError(`Request error: ${err.message}`);
    }
    setLoading(false);
  };

  // Clear states when switching tabs
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setOutputText("");
    setError("");
    setInputText("");
    setSelectedImage(null);
    setImagePreview(null);
    setAudioBlob(null);
    setAudioURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="translator-page">
      <header className="translator-header">
        <h1>Translator Hub</h1>
        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === "text" ? "active" : ""}`}
            onClick={() => handleTabSwitch("text")}
          >
            Text Translation
          </button>
          <button
            className={`tab-button ${activeTab === "image" ? "active" : ""}`}
            onClick={() => handleTabSwitch("image")}
          >
            Image OCR
          </button>
          <button
            className={`tab-button ${activeTab === "voice" ? "active" : ""}`}
            onClick={() => handleTabSwitch("voice")}
          >
            Voice Translation
          </button>
        </div>
      </header>

      <main className="translator-main">
        {/* Text Translation Tab */}
        {activeTab === "text" && (
          <>
            <div className="card input-card">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type text here..."
              />
            </div>

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
                onClick={handleTextTranslate}
                disabled={loading || !inputText.trim()}
              >
                {loading ? "Translating..." : "Translate"}
              </button>
            </div>
          </>
        )}

        {/* Image OCR Tab */}
        {activeTab === "image" && (
          <>
            <div className="card input-card">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                style={{ marginBottom: "10px" }}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: "300px" }}
                  />
                </div>
              )}
            </div>

            <div className="controls">
              <button
                onClick={handleImageTranslate}
                disabled={loading || !selectedImage}
              >
                {loading ? "Extracting Text..." : "Extract Text from Image"}
              </button>
            </div>
          </>
        )}

        {/* Voice Translation Tab */}
        {activeTab === "voice" && (
          <>
            <div className="card input-card">
              <div className="voice-controls">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`record-button ${isRecording ? "recording" : ""}`}
                  disabled={loading}
                >
                  {isRecording ? "🔴 Stop Recording" : "🎤 Start Recording"}
                </button>
                {audioURL && (
                  <div className="audio-preview">
                    <audio controls src={audioURL} />
                  </div>
                )}
              </div>
            </div>

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
                onClick={handleVoiceTranslate}
                disabled={loading || !audioBlob}
              >
                {loading ? "Transcribing..." : "Transcribe & Translate"}
              </button>
            </div>
          </>
        )}

        {/* Output Text - Common for all tabs */}
        <div className="card output-card fade-in">
          {error ? (
            <p className="error">{error}</p>
          ) : (
            <p>{displayedText || "Your translation will appear here..."}</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default TranslatorHub;
