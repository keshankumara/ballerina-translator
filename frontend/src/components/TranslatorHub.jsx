import React, { useState } from "react";
import axios from "axios";

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
      const response = await axios.post("http://localhost:8080/translate", {
        text: inputText,
        sourceLang,
        target: targetLang,
      });
      setOutputText(response.data.output);
    } catch (err) {
      setError("Translation failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
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
