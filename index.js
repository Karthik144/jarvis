const { OpenAI } = require('openai');
const readline = require('readline');
const axios = require("axios");
const TavilySearchAPIRetriever = require("@langchain/community/retrievers/tavily_search_api").TavilySearchAPIRetriever;
require('dotenv').config();


const client = new OpenAI();

async function main() {

  const assistantDescription =
    "You are a crypto trading advisor. Provide insightful answers, using the Tavily search API for additional information. Include URL sources in responses. When asked for analysis or insight offer nuanced analyses using the Relative Strength Index (RSI) function (rsi_analysis)."; 

  const assistant = await client.beta.assistants.create({
    name: "Crypto Trading Advisor",
    description: assistantDescription,
    model: "gpt-4-1106-preview",
    tools: [
      // First function - web search
      {
        type: "function",
        function: {
          name: "tavily_search",
          description:
            "Get information on recent crypto/blockchain related events from the web.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "The search query to use. For example: 'Latest news on Bitcoin applications'",
              },
            },
            required: ["query"],
          },
        },
      },

      // Second function - retrieve coin market data
      {
        type: "function",
        function: {
          name: "coin_market_data",
          description:
            "Get a user-requested coin's live market data (price, market cap, volume).",
          parameters: {
            type: "object",
            properties: {
              symbol: {
                type: "string",
                description: "The trading symbol of the coin, e.g. BTC or ETH",
              },
            },
            required: ["symbol"],
          },
        },
      },

      // Third function - retrieve trending coins data
      {
        type: "function",
        function: {
          name: "top_coins_data",
          description:
            "Get the top-7 trending coins on CoinGecko as searched by users in the last 24 hours (ordered by most popular first).",
        },
      },

      // Fourth function - analyze coin data and provide insight based on RSI
      {
        type: "function",
        function: {
          name: "rsi_analysis",
          description:
            "Calculate the Relative Strength Index (RSI) for a given token based on a 14 day period with closing prices for each day in the period.",
          parameters: {
            type: "object",
            properties: {
              symbol: {
                type: "string",
                description: "The trading symbol of the coin, e.g. BTC or ETH",
              },
            },
            required: ["symbol"],
          },
        },
      },
    ],
  });

  // Create a thread 
  const thread = await client.beta.threads.create();
  
  // Ongoing convo 
  while (true) {
    const userInput = await getUserInput();

    if (userInput.toLowerCase() === 'exit') {
      break;
    }

    // Create a message 
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userInput,
    });

    // Create a run 
    let run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    run = await waitForRunCompletion(thread.id, run.id);

    if (run.status === 'failed') {
      console.log("INSIDE RUN FAILED"); 
      console.log(run.error);
    } else if (run.status === 'requires_action') {
      console.log("INSIDE FUNCTION CALLED"); 
      run = await submitToolOutputs(thread.id, run.id, run.required_action.submit_tool_outputs.tool_calls);
      run = await waitForRunCompletion(thread.id, run.id);
    }

    await printMessagesFromThread(thread.id, run.id);
  }
}


main();

async function getUserInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('You: ', (input) => {
      rl.close();
      resolve(input);
    });
  });
}

const waitForRunCompletion = async (thread_id, run_id) => {
  return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
          try {
              const run = await client.beta.threads.runs.retrieve(thread_id, run_id);
              console.log(`Current run status: ${run.status}`);

              if (['completed', 'failed', 'requires_action'].includes(run.status)) {
                  clearInterval(interval);
                  resolve(run);
              }
          } catch (error) {
              clearInterval(interval);
              reject(error);
          }
      }, 1000); 
  });
};

// Calculate Relative Strength Index (RSI)
async function calcRSI(symbol) {

  console.log("Coin ID in symbol:", symbol);

  let parsedTokenSymbol = JSON.parse(symbol);
  const coinList = await fetchAllCoins();
  let coinId = ""; 
  
  // Get correct id to use for coin gecko api 
  for (const coin of coinList) {
    if (parsedTokenSymbol.symbol.toLowerCase() === coin.symbol) {
      // Found a match based on user input
      coinId = coin.id; 
    }
  }

  let priceGains = [];
  let priceLosses = [];

  // Get previous 14 day price data from coin gecko
  const currentDate = new Date();
  let last14Days = [];
  let previousPrices = [];

  for (let i = 0; i < 14; i++) {
    let previousDate = new Date();
    previousDate.setDate(currentDate.getDate() - i);
    // Format and add to the array
    last14Days.push(formatDate(previousDate));
  }

  for (const day of last14Days) {
    const previousDatePrice = await getPrice(day, coinId);
    previousPrices.push(previousDatePrice);
  }

  // Subtract previous day's close from today's close to determine if it's a gain or loss or no change
  for (let i = 1; i < previousPrices.length; i++) {
    const priceDiff = previousPrices[i] - previousPrices[i - 1];
    if (priceDiff > 0) {
      priceGains.push(priceDiff);
    } else if (priceDiff < 0) {
      priceLosses.push(Math.abs(priceDiff));
    }
  }

  // Calc the avg gain and avg loss for the past 14 days
  const totalGain = priceGains.reduce((acc, gain) => acc + gain, 0);
  const totalLoss = priceLosses.reduce((acc, loss) => acc + loss, 0);

  const avgGain = totalGain / 14;
  const avgLoss = totalLoss / 14;

  // Calc RS by finding the ratio of avg. gain to avg. loss
  const RS = avgGain / avgLoss;

  // Calc RSI by doing 100 - (100 / (1+RS))
  const RSI = 100 - 100 / (1 + RS);
  return RSI;
}

async function getPrice(date, coinId) {
  try {
    const requestURL = `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${date}&localization=false`;
    const response = await axios.get(requestURL);
    const price = response.data.market_data.current_price.usd;
    return price;
  
  } catch (error) {
    console.error("Error:", error);
  }
}

// Format given date to dd-mm-yyyy
function formatDate(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1; // Month is 0-indexed
    let year = date.getFullYear();

    // Add leading zero if day or month is less than 10
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;

    return `${day}-${month}-${year}`;
}

// Retrieve list of tokens in a user specified category

// Retrieve list of all categories from coin gecko
async function retrieveCategories() {
  try {
    const requestURL = "https://api.coingecko.com/api/v3/coins/categories/list";
    const response = await axios.get(requestURL);
    const categories = response.data;
    return categories;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// Retrieve list of tokens from category name 
// NOTE: NEED TO COMPLETE
async function retrieveTokensInCategory(categoryId) {
  try {
    const requestURL = "https://api.coingecko.com/api/v3/coins/categories/list";
    const response = await axios.get(requestURL);
    const categories = response.data;
    return categories;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// Retrieve trending tokens from coin gecko 
async function retrieveTrendingCoins() {
  try {
    const requestURL = "https://api.coingecko.com/api/v3/search/trending";
    const response = await axios.get(requestURL);
    const trendingCoins = response.data;
    return trendingCoins;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

async function retrieveCoinMarketData(symbol) {

  let parsedTokenSymbol = JSON.parse(symbol);
  const coinList = await fetchAllCoins(); 

  for (const coin of coinList) {
    if (parsedTokenSymbol.symbol.toLowerCase() === coin.symbol) {
      // Found a match based on user input 
      const marketData = await fetchCoinMarketData(coin.id); 
      return marketData; 
    } 
  }
}

// Lists all supported coins (id, symbol, name) by CoinGecko
async function fetchAllCoins() {
  try {
    const requestURL =
      "https://api.coingecko.com/api/v3/coins/list";
    const response = await axios.get(requestURL);
    const coins = response.data;
    return coins;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// Retrieve coin market data 
async function fetchCoinMarketData(coinId) {
  try {
    const requestURL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`;
    const response = await axios.get(requestURL);
    const data = response.data;
    return data; 
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

async function tavilySearch(query) {

  const retriever = new TavilySearchAPIRetriever({
    apiKey: process.env.TAVILY_API_KEY,
    k: 3,
    searchDepth: 'advanced', 
  });

  const searchResult = await retriever.getRelevantDocuments(query);

  return searchResult;
}

async function submitToolOutputs(thread_id, run_id, tools_to_call) {
  const tool_output_array = [];

  for (const tool of tools_to_call) {
      let output = null;
      const tool_call_id = tool.id;
      const function_name = tool.function.name;
      const function_args = tool.function.arguments;

      if (function_name === "tavily_search") {
        console.log("INSIDE TAVILY SEARCH"); 
        output = await tavilySearch(JSON.parse(function_args).query);
      } else if (function_name === "coin_market_data") {
        console.log("INSIDE MARKET DATA FUNC"); 
        output = await retrieveCoinMarketData(function_args); 
      } else if (function_name === "top_coins_data") {
        console.log("INSIDE TOP COINS FUNC"); 
        output = await retrieveTrendingCoins(); 
      } else if (function_name === "rsi_analysis") {
        console.log("INSIDE RSI ANALYSIS FUNC")
        output = await calcRSI(function_args);
      }

      // Convert output to a string
      if (output) {
          const outputString = typeof output === 'string' ? output : JSON.stringify(output);
          tool_output_array.push({ tool_call_id, output: outputString });
      }
  }  

  try {
    const response = await client.beta.threads.runs.submitToolOutputs(thread_id, run_id, {
      tool_outputs: tool_output_array
    });
    return response;
  } catch (error) {
    console.error("Error submitting tool outputs:", error);
  }
}



async function printMessagesFromThread(thread_id, run_id) {
  const messages = await client.beta.threads.messages.list(thread_id);

  // Find the last message for the current run
  const lastMessage = messages.data
  .filter(message => message.run_id === run_id && message.role === "assistant")
  .pop();

  // Print the last message coming from the assistant
  if (lastMessage) {
    console.log(lastMessage.content[0]["text"].value);
  }

}