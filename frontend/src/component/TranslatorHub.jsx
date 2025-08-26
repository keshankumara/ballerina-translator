import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TranslatorHub.css";

const TranslatorHub = () => {
  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("si");
  const [outputText, setOutputText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Handle translation request
  const handleTranslate = async () => {
    setLoading(true);
    setError("");
    setOutputText("");
    try {
      const requestBody = { text: inputText, sourceLang, target: targetLang };
      const response = await axios.post("http://localhost:8080/translate", requestBody);
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

  return (
    <div className="translator-page">
      <header className="translator-header">
        <h1>Translator Hub</h1>
      </header>

      <main className="translator-main">
        {/* Input Text */}
        <div className="card input-card">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type text here..."
          />
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="select-container">
            <label>
              Source:
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </label>
            <label>
              Target:
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </label>
          </div>
          <button onClick={handleTranslate} disabled={loading || !inputText.trim()}>
            {loading ? "Translating..." : "Translate"}
          </button>
        </div>

        {/* Output Text */}
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
