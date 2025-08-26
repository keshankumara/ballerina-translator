import React, { useState } from "react";
import axios from "axios";
import "./TranslatorHub.css";

const TranslatorHub = () => {
  // State variables to store text and results
  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("en");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form submission to call the backend API
  const handleTranslate = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Sending request with:", {
        text: inputText,
        sourceLang,
        target: targetLang,
      });

      const response = await axios.post("/api/translate", {
        text: inputText,
        sourceLang,
        target: targetLang,
      });

      console.log("Response received:", response.data);
      setOutputText(response.data.output);
    } catch (err) {
      console.error("Error details:", err);
      if (err.response) {
        // Server responded with error status
        setError(
          `Server error: ${err.response.status} - ${
            err.response.data || err.message
          }`
        );
      } else if (err.request) {
        // Request was made but no response received
        setError(
          "No response from server. Please check if the backend is running on http://localhost:8080"
        );
      } else {
        // Something else happened
        setError(`Request error: ${err.message}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="translator-container">
      <h1>Translator Hub</h1>

      {/* Input for text to be translated */}
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text to translate"
        rows="4"
        cols="50"
      ></textarea>
      <br />

      {/* Language selection */}
      <label htmlFor="sourceLang">Source Language: </label>
      <select
        id="sourceLang"
        value={sourceLang}
        onChange={(e) => setSourceLang(e.target.value)}
      >
        <option value="en">English</option>
        <option value="si">Sinhala</option>
        <option value="ta">Tamil</option>
      </select>
      <br />

      <label htmlFor="targetLang">Target Language: </label>
      <select
        id="targetLang"
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
      >
        <option value="en">English</option>
        <option value="si">Sinhala</option>
        <option value="ta">Tamil</option>
      </select>
      <br />

      {/* Translate button */}
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? "Translating..." : "Translate"}
      </button>

      {/* Output */}
      <h3>Translated Text:</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>{outputText}</p>
    </div>
  );
};

export default TranslatorHub;
