const { OpenAI } = require("openai");
const axios = require("axios");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function tavilyAdvancedSearch(query) {

    console.log("FUNCTION CALLED");
    const endpoint = "https://api.tavily.com/search";

    try {
        const response = await axios.post(endpoint, {
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_images: false,
        include_answer: false,
        include_raw_content: false,
        max_results: 5,
        include_domains: [],
        exclude_domains: [],
        });

        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error in tavilySearch:", error);
    }
}

async function runConversation(){
    const messages = [
        { role: "system", content: "You are a helpful crypto research assistant." },
        { role: "user", content: "What are new updates with Injective?" },
    ];

    const tools = [
        {
            type: "function",
            function: {
                name: "tavilyAdvancedSearch",
                description: "Get basic crypto/blockchain info from the internet. Use this only when you need more detailed info.",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query to use. For example: 'Latest news on Bitcoin applications'",
                        },
                    },
                    required: ["query"],
                },
            },
        },
    ];

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: messages,
        tools: tools,
        tool_choice: "auto", // auto is default, but we'll be explicit
    });

    const responseMessage = response.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    if (responseMessage.tool_calls) {
      const availableFunctions = {
        tavilyAdvancedSearch: tavilyAdvancedSearch,
      };

      messages.push(responseMessage);

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableFunctions[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const functionResponse = await functionToCall(functionArgs.query);

        const contentString = JSON.stringify(functionResponse);

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: contentString,
        }); // extend conversation with function response
      }
      const secondResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: messages,
      }); // get a new response from the model where it can see the function response
    return secondResponse.choices;

}
    
}




runConversation().then(console.log).catch(console.error);
