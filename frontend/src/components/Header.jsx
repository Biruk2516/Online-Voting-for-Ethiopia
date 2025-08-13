import React, { useState, useEffect } from "react";
import axios from "axios";

const MODELS = {
  am: "Helsinki-NLP/opus-mt-en-am",
  ti: "Helsinki-NLP/opus-mt-en-ti",
  om: "Helsinki-NLP/opus-mt-en-om",
  en: null, // no translation needed
};

const API_TOKEN = "hf_xxx_your_token_here";

async function translateText(text, lang) {
  if (!MODELS[lang]) return text; // English or unsupported, return as is
  const response = await axios.post(
    `https://api-inference.huggingface.co/models/${MODELS[lang]}`,
    { inputs: text },
    {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    }
  );
  return response.data[0]?.translation_text || text;
}

export default function Header() {
  const [language, setLanguage] = useState("en");
  const [headerText, setHeaderText] = useState({
    title: "Ethiopian Online Voting System",
    languageLabel: "Language",
  });

  useEffect(() => {
    async function translateHeader() {
      if (language === "en") {
        setHeaderText({
          title: "Ethiopian Online Voting System",
          languageLabel: "Language",
        });
      } else {
        const title = await translateText("Ethiopian Online Voting System", language);
        const langLabel = await translateText("Language", language);
        setHeaderText({ title, languageLabel: langLabel });
      }
    }
    translateHeader();
  }, [language]);

  return (
    <header className="p-4 flex justify-between items-center border-b">
      <h1 className="text-xl font-bold">{headerText.title}</h1>
      <div>
        <label htmlFor="lang-select" className="mr-2">{headerText.languageLabel}:</label>
        <select
          id="lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="en">English</option>
          <option value="am">አማርኛ (Amharic)</option>
          <option value="ti">ትግርኛ (Tigrinya)</option>
          <option value="om">Oromo</option>
        </select>
      </div>
    </header>
  );
}
