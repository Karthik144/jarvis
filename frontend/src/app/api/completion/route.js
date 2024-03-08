import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

const perplexity = new OpenAI({
  apiKey: "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",
  baseURL: "https://api.perplexity.ai",
});

export async function POST(req) {
  // Extract the `messages` from the body of the request
  const { tokens } = await req.json();
  const messages = [
    {
        role: "system",
        content:
            "You are a crypto researcher that provides detailed reports about tokens. In the report, for each token, provide a summary, potential applications, and new non-price related updates.",
    },
    {
        role: "user", 
        content: `Given the following tokens, generate a detailed report. Tokens: ${tokens}`
    }
];


  console.log("Messages inside post:", messages);
  // Request the OpenAI-compatible API for the response based on the prompt
  const response = await perplexity.chat.completions.create({
    model: "pplx-7b-chat",
    stream: true,
    messages: messages,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}