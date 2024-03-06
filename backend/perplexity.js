const { OpenAI } = require("openai");
const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.API_KEY;

const messages = [
  {
    role: "system",
    content:
      "You are a crypto researcher that provides detailed reports about tokens. In the report, for each token, provide a summary, potential applications, and new non-price related updates.",
  },
  {
    role: "user",
    content:
      "Can you give me a report on the following tokens: Chainlink, Uniswap, DAI, Arbitrum, Maker, TheGraph, FraxEther, Axelar, Gnosis, Lido.",
  },
];

const selectedModel = "sonar-small-online";

async function main() {
  console.log("INSIDE MAIN");

  const client = new OpenAI({
    apiKey: apiKey,
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
}

main();
