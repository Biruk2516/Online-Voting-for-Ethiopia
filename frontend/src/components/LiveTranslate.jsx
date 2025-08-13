// src/components/LiveTranslate.jsx
import React, { useState } from "react";
import { translateToAmharic } from "../utils/translate";

function LiveTranslate() {
  const [originalText, setOriginalText] = useState("Welcome to the Ethiopian Voting System");
  const [translatedText, setTranslatedText] = useState("");

  const handleTranslate = async () => {
    const amharic = await translateToAmharic(originalText);
    setTranslatedText(amharic);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{originalText}</h1>
      <button onClick={handleTranslate} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
        Translate to Amharic
      </button>
      <p className="mt-4 text-lg">{translatedText}</p>
    </div>
  );
}

export default LiveTranslate;
