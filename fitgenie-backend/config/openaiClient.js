// config/openaiClient.js
const axios = require("axios");

const openaiClient = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json"
  }
});

const callChatCompletion = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in .env");
  }

  const res = await openaiClient.post(
    "/chat/completions",
    {
      model: "gpt-4.1-mini",   // ✅ valid model name
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    }
  );

  return res.data.choices[0].message.content;
};

module.exports = { callChatCompletion };