// test.js
import axios from "axios";

const API_TOKEN = "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";

async function test() {
  try {
    const res = await axios.post(
      "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-am",
      { inputs: "Hello world" },
      { headers: { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" } }
    );
    console.log(res.data);
  } catch (e) {
    console.error("Error:", e.response?.data || e.message);
  }
}

test();
