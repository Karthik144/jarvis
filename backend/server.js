const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:3000", // Local testing url
  })
);

app.use(express.json());

const { OpenAI } = require("openai");
// const readline = require("readline");
const axios = require("axios");
const TavilySearchAPIRetriever =
  require("@langchain/community/retrievers/tavily_search_api").TavilySearchAPIRetriever;
require("dotenv").config();

let client, assistant;

async function initializeOpenAI() {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const assistantDescription =
    "You are a crypto research bot. Use the provided function to get numersical RSI data and recent data on the applications/news of the cryptocurrency, then give a detailed and useful summary on the token based on this data."; 


  assistant = await client.beta.assistants.create({
    name: "Crypto Trading Advisor",
    description: assistantDescription,
    model: "gpt-4-1106-preview",
    tools: [
      // Main summary function
      {
        type: "function",
        function: {
          name: "getSummary",
          description:
            "Create a detailed report on the coin with RSI data and the cryptocurrency's applications/news.",
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
}

async function main(userInput) {
  console.log("USER INPUT PASSED IN", userInput);

  // Create a thread
  const thread = await client.beta.threads.create();

  // Ongoing convo
  while (true) {
    // const userInput = await getUserInput();

    if (userInput.toLowerCase() === "exit") {
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

    if (run.status === "failed") {
      console.log("OPEN AI RUN FAILED TO START");
      console.log(run.error);
    } else if (run.status === "requires_action") {
      console.log("INSIDE FUNCTION CALLED");
      run = await submitToolOutputs(
        thread.id,
        run.id,
        run.required_action.submit_tool_outputs.tool_calls
      );
      run = await waitForRunCompletion(thread.id, run.id);
    }

    const lastMessage = await printMessagesFromThread(thread.id, run.id);
    return { message: lastMessage };
    // return {
    //   threadId: thread.id,
    //   runId: run ? run.id : null,
    //   message: lastMessage,
    // };
  }
}

async function summary(symbol) {
  const parsedSymbol = JSON.parse(symbol).symbol;

  // RSI analysis
  const rsi = await calcRSI(symbol);

  console.log("RSI IN SUMMARY:", rsi); 
  // Applications + News
  const queryObject = {
    query: `What are the newest applications of the $${parsedSymbol} cryptocurrency?`,
  };
  const jsonString = JSON.stringify(queryObject);
  const searchResult = await tavilySearch(JSON.parse(jsonString).query);

  // const searchResult = await tavilySearch(
  //   "What are the newest applications of ethereum?"
  // );

  console.log("SEARCH RESULT", searchResult); 


  whitePaperExtracted = await getWhitepaper(symbol);

  console.log("WHITEPAPER KEY POINTS", whitePaperExtracted); 



  // White paper

  return {
    rsi,
    searchResult,
    whitePaperExtracted
  };
  // return rsi; 
}

async function followUp(userInput, threadId, runId) {
  // Create a message
  await client.beta.threads.messages.create(threadId, {
    role: "user",
    content: userInput,
  });

  // Create a run
  let run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  run = await waitForRunCompletion(threadId, runId);

  if (run.status === "failed") {
    console.log("INSIDE RUN FAILED");
    console.log(run.error);
  } else if (run.status === "requires_action") {
    console.log("INSIDE FUNCTION CALLED");
    run = await submitToolOutputs(
      threadId,
      runId,
      run.required_action.submit_tool_outputs.tool_calls
    );
    run = await waitForRunCompletion(threadId, runId);
  }

  const lastMessage = await printMessagesFromThread(threadId, runId);
  return lastMessage;
}

async function getUserInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("You: ", (input) => {
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

        if (["completed", "failed", "requires_action"].includes(run.status)) {
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
  const parsedSymbol = JSON.parse(symbol).symbol;
  console.log("Coin Symbol in calcRSI:", parsedSymbol);
  const coinId = await fetchCoinId(parsedSymbol);
  console.log("Coin ID in calcRSI:", coinId);

  let priceGains = [];
  let priceLosses = [];

  // Get previous 14 day price data from coin gecko
  const last14DayPrices = await getHistoricalPrices(coinId);

  console.log("AFTER GET HISTORICAL PRICES"); 
  // Subtract previous day's close from today's close to determine if it's a gain or loss or no change
  for (let i = 1; i < last14DayPrices.length; i++) {
    const priceDiff = last14DayPrices[i] - last14DayPrices[i - 1];
    if (priceDiff > 0) {
      priceGains.push(priceDiff);
    } else if (priceDiff < 0) {
      priceLosses.push(Math.abs(priceDiff));
    }
  }

  // Calc the avg gain and avg loss for the past 14 days
  const totalGain = priceGains.reduce((acc, gain) => acc + gain, 0);
  const totalLoss = priceLosses.reduce((acc, loss) => acc + loss, 0);

  const avgGain = totalGain / last14DayPrices.length;
  const avgLoss = totalLoss / last14DayPrices.length;

  // Calc RS by finding the ratio of avg. gain to avg. loss
  const RS = avgGain / avgLoss;

  console.log("RS", RS); 
  // Calc RSI by doing 100 - (100 / (1+RS))
  const RSI = 100 - 100 / (1 + RS);
  console.log("RSI", RSI); 
  return RSI;
}

// Get Whitepaper Key info
async function getWhitepaper(symbol) {
  const parsedSymbol = JSON.parse(symbol).symbol;


  const whitepapers = {
    "ETH": "https://api-new.whitepaper.io/documents/pdf?id=H1ugBX9Bd",
    "BTC": "https://api-new.whitepaper.io/documents/pdf?id=SksIiBd6z",
    "LINK": "https://api-new.whitepaper.io/documents/pdf?id=B1U9CtOiE",
    "COSMOS": "https://api-new.whitepaper.io/documents/pdf?id=BJNXW5ZnU",
    "USDC": "https://api-new.whitepaper.io/documents/pdf?id=HJX1cRBSO"
  }

  const queryObject = {
    query: `${whitepapers[symbol]} What are some key points from the $${parsedSymbol} cryptocurrency whitepaper?`,
  };
  const jsonString = JSON.stringify(queryObject);
  const searchResult = await tavilySearch(JSON.parse(jsonString).query);

  return searchResult;
  // axiosRetry(axios, { retries: 5 });
  // axios({
  //   url,
  //   method: 'GET',
  //   responseType: 'stream',
  // }).then(response => {
  //   const stream = response.data;
  //   const writeStream = fs.createWriteStream('./output.pdf');
  //   stream.pipe(writeStream);

  //   writeStream.on('finish', async () => {
  //       const dataBuffer = fs.readFileSync('./output.pdf');
  //       const data = await pdf(dataBuffer);
  //       console.log(data.text);
  //       //need to input this data.text into GPT summarizer

  //   });
  // });
}

async function getHistoricalPrices(coinId) {
  console.log("Coin ID Inside Historical Prices:", coinId);
  try {
    const requestURL = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=14&interval=daily`;
    const response = await axios.get(requestURL);
    // Note: Struct is an array of arrays (each sub array has unix timestamp and price)
    const queriedPrices = response.data.prices;
    let prices = [];
    for (let i = 0; i < queriedPrices.length; i++) {
      const price = queriedPrices[i][1];
      prices.push(price);
    }
    console.log("RICES", prices); 
    return prices;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// Format given date to dd-mm-yyyy
// function formatDate(date) {
//     let day = date.getDate();
//     let month = date.getMonth() + 1; // Month is 0-indexed
//     let year = date.getFullYear();

//     // Add leading zero if day or month is less than 10
//     day = day < 10 ? '0' + day : day;
//     month = month < 10 ? '0' + month : month;

//     return `${day}-${month}-${year}`;
// }


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
  const parsedSymbol = JSON.parse(symbol).symbol;
  const coinId = await fetchCoinId(parsedSymbol);
  const marketData = await fetchCoinMarketData(coinId);
  return marketData;
}

// Lists all supported coins (id, symbol, name) by CoinGecko
// async function fetchAllCoins() {
//   try {
//     const requestURL =
//       "https://api.coingecko.com/api/v3/coins/list";
//     const response = await axios.get(requestURL);
//     const coins = response.data;
//     return coins;
//   } catch (error) {
//     console.error("Error:", error);
//     return [];
//   }
// }
async function fetchCoinId(searchTerm) {
  try {
    const requestURL = `https://api.coingecko.com/api/v3/search?query=${searchTerm}`;
    const response = await axios.get(requestURL);
    const coinId = response.data.coins[0].id;
    return coinId;
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
  try {
    console.log("INSIDE TAVILY SEARCH");
    const retriever = new TavilySearchAPIRetriever({
      apiKey: process.env.TAVILY_API_KEY,
      k: 10,
      searchDepth: "advanced",
    });

    console.log("BEFORE GET REL DOCS CALLED");
    const searchResult = await retriever.getRelevantDocuments(query);
    return searchResult;
  } catch (error) {
    console.error("Error in tavilySearch:", error);
  }
}

async function submitToolOutputs(threadId, runId, toolsToCall) {
  const toolOutputArray = [];

  for (const tool of toolsToCall) {
    let output = null;
    const toolCallId = tool.id;
    const functionName = tool.function.name;
    const functionArgs = tool.function.arguments;

    console.log("FUNCTION ARGS", functionArgs); 
    console.log("FUNCTION NAME", functionName); 
    if (functionName === "getSummary") {
      console.log("INSIDE SUMMARY");
      output = await summary(functionArgs);
      console.log("AFTER OUTPUT"); 
    } 


    console.log("BEFORE IF OUTPUT"); 
    // Convert output to a string
    if (output) {
      console.log("INSIDE CONVERSION");
      const outputString =
        typeof output === "string" ? output : JSON.stringify(output);
      toolOutputArray.push({ tool_call_id: toolCallId, output: outputString });
    }
  }

  try {
    const response = await client.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      {
        tool_outputs: toolOutputArray,
      }
    );
    return response;
  } catch (error) {
    console.error("Error submitting tool outputs:", error);
  }
}

async function printMessagesFromThread(thread_id, run_id) {
  const messages = await client.beta.threads.messages.list(thread_id);

  // Find the last message for the current run
  const lastMessage = messages.data
    .filter(
      (message) => message.run_id === run_id && message.role === "assistant"
    )
    .pop();

  // Log the last message for debugging
  console.log("Last Message:", lastMessage);

  // Print the last message coming from the assistant
  if (lastMessage) {
    return lastMessage.content[0]["text"].value;
  } else {
    // Log if no message is found
    console.log("No last message found");
    return null;
  }
}

app.post("/analyze", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    const result = await main(userInput);
    res.json(result);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.post("/followup", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    const threadId = req.body.threadId;
    const runId = req.body.runId;
    console.log("User Input", userInput);
    console.log("Thread ID", threadId);
    console.log("Run ID", runId);
    const result = await followUp(userInput, threadId, runId);
    console.log("RESULT", result);
    res.json(result);
  } catch (error) {
    res.status(500).send(`Server error: ${error.message}`);
  }
});

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  await initializeOpenAI();
});
