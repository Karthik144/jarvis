const { OpenAI } = require("openai");
const { OpenAIStream, StreamingTextResponse } = require("ai");


const selectedModel = "sonar-small-online";

// async function generateReport(messages) {
//   console.log("INSIDE GENERATE REPORT");

//   const client = new OpenAI({
//     apiKey: "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",
//     dangerouslyAllowBrowser: true,
//     baseURL: "https://api.perplexity.ai",
//   });

//   console.log("BEFORE RESPONSE");
//   const response = await client.chat.completions.create({
//     model: selectedModel,
//     messages: messages,
//   });
//   console.log("AFTER RESPONSE");
//   console.log(response);
//   console.log(response.choices[0].message);

//   return response.choices[0].message;
// }

// module.exports = { generateReport };

// const perplexity = new OpenAI({
//   apiKey: "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",
//   baseURL: "https://api.perplexity.ai/",
// });

// // Set the runtime to edge
// export const config = {
//   runtime: "edge",
// };

// export async function onRequestPost({ request }) {
//   // Extract the `messages` from the body of the request
//   const { messages } = await request.json();

//   // Ask Perplexity for a streaming chat completion using the PPLX 70B online model
//   const response = await perplexity.chat.completions.create({
//     model: "pplx-70b-online",
//     stream: true,
//     max_tokens: 1000,
//     messages,
//   });

//   // Convert the response into a friendly text-stream.
//   const stream = OpenAIStream(response);

//   // Respond with the stream
//   return new StreamingTextResponse(stream);
// }