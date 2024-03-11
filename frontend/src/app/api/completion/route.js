import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

const perplexity = new OpenAI({
  apiKey: "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",
  baseURL: "https://api.perplexity.ai",
});

export async function POST(req) {
  const requestBody = await req.json(); 
  const promptObject = JSON.parse(requestBody.prompt);
  const { tokens } = promptObject;

  const messages = [
    {
      role: "system",
      content:
        "Generate a formal report on the given crypto tokens. For each token, use '# Token Name' as the main heading. Under each token, include three subheadings: '## Summary' for a brief overview, '## Applications' for potential uses, and '## Updates' for recent non-price related developments. Ensure there is appropriate spacing between sections for clarity. Present the information directly, avoiding conversational language, and adhere to the structured format with the specified headings and subheadings for consistency.",
    },
    {
      role: "user",
      content: `Generate a detailed report for the following tokens: ${tokens}`,
    },
  ];


  console.log("Messages inside post:", messages);

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
