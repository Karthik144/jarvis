const { OpenAI } = require("openai");
const axios = require("axios");
require("dotenv").config();


const selectedModel = "sonar-small-online";

async function generateReport(messages) {
  console.log("INSIDE GENERATE REPORT");

  const client = new OpenAI({
    apiKey: "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",
    dangerouslyAllowBrowser: true,
    baseURL: "https://api.perplexity.ai",
  });

  console.log("BEFORE RESPONSE");
  const response = await client.chat.completions.create({
    model: selectedModel,
    messages: messages,
  });
  console.log("AFTER RESPONSE");
  console.log(response);
  console.log(response.choices[0].message);

  return response.choices[0].message;
}

module.exports = { generateReport };
