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

  // Function to extract clean translations from the response
  const extractTranslations = (responseText) => {
    // Split by lines and filter out explanations
    const lines = responseText.split("\n");
    const translations = [];

    for (let line of lines) {
      // Look for lines that contain Sinhala/Tamil characters or are in bold format
      if (line.includes("**") && line.includes("**")) {
        // Extract text between ** markers
        const match = line.match(/\*\*(.*?)\*\*/);
        if (match && match[1]) {
          translations.push(match[1].trim());
        }
      } else if (line.includes("(") && line.includes(")")) {
        // Extract pronunciation guides or simple translations
        const beforeParens = line.split("(")[0].trim();
        if (
          beforeParens &&
          beforeParens.length > 0 &&
          !beforeParens.includes("*") &&
          !beforeParens.includes("Here") &&
          !beforeParens.includes("The most")
        ) {
          translations.push(beforeParens);
        }
      }
    }

    // If no structured translations found, try to find direct translations
    if (translations.length === 0) {
      for (let line of lines) {
        line = line.trim();
        // Look for lines that might contain direct translations
        if (
          line &&
          !line.toLowerCase().includes("translation") &&
          !line.toLowerCase().includes("here") &&
          !line.toLowerCase().includes("means") &&
          !line.toLowerCase().includes("formal") &&
          !line.toLowerCase().includes("use") &&
          !line.includes("*") &&
          line.length > 2 &&
          line.length < 100
        ) {
          translations.push(line);
        }
      }
    }

    return translations.length > 0 ? translations : [responseText.trim()];
  };

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

      // Extract clean translations from the response
      const cleanTranslations = extractTranslations(response.data.output);
      setOutputText(cleanTranslations);
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

      {/* Language selection */}
      <div className="language-selection">
        <div className="language-group">
          <label htmlFor="sourceLang">Source Language:</label>
          <select
            id="sourceLang"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="si">Sinhala</option>
            <option value="ta">Tamil</option>
          </select>
        </div>

        <div className="language-group">
          <label htmlFor="targetLang">Target Language:</label>
          <select
            id="targetLang"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="si">Sinhala</option>
            <option value="ta">Tamil</option>
          </select>
        </div>
      </div>

      {/* Translate button */}
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? "Translating..." : "Translate"}
      </button>

      {/* Output */}
      <h3>Translated Text:</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="translation-output">
        {Array.isArray(outputText) ? (
          <ul>
            {outputText.map((translation, index) => (
              <li key={index}>{translation}</li>
            ))}
          </ul>
        ) : (
          <p>{outputText}</p>
        )}
      </div>
    </div>
  );
};

export default TranslatorHub;
