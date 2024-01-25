const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
require("dotenv").config();

const { OpenAI } = require("openai");
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { spawn } = require("child_process");
const TavilySearchAPIRetriever =
  require("@langchain/community/retrievers/tavily_search_api").TavilySearchAPIRetriever;

app.use(
  cors({
    origin: "http://localhost:3000", // Local testing url
  })
);

async function main(userInput) {
  console.log("USER INPUT PASSED IN", userInput);
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // const userInput = "What are people saying about Pendle on Twitter?";
  //const userInput = "what is defidad saying about pendle on twitter?"

  // Create a thread
  const thread = await client.beta.threads.create();

  // Create a message
  await client.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userInput,
  });

  // Create a run
  let run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: "asst_YCT2knc7B6WZEaeU0pvNcXZ6",
  });

  run = await waitForRunCompletion(thread.id, run.id);

  if (run.status === "failed") {
    console.log("Run Failed With Error", run.error);
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
}

async function tavilyBasicSearch(query) {
  const endpoint = "https://api.tavily.com/search";

  try {
    const response = await axios.post(endpoint, {
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: "basic",
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

async function tavilyAdvancedSearch(query) {
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

async function getLowBetaHighGrowthPairs() {
  const poolsWithBetaCalc = await addBetaCalcToExistingData();

  // Sort pools by beta values in ascending order
  const sortedPools = poolsWithBetaCalc.sort((a, b) => {
    // Handle cases where beta might be undefined or null
    const betaA = a.beta || Infinity;
    const betaB = b.beta || Infinity;

    return betaA - betaB;
  });

  return sortedPools;
}

async function searchProducts(searchTerm) {
  const allProducts = await getInsuranceProducts();

  const results = {
    "Nexus Mutual Covers": [],
    "InsurAce Covers": {},
  };

  // Convert the search term to lowercase for case-insensitive comparison
  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  // Function to search within each product's properties
  const searchInNexusProducts = (product) =>
    product.name.toLowerCase().includes(lowerCaseSearchTerm);

  const searchInInsuraceProducts = (cover) =>
    cover.Protocol.toLowerCase().includes(lowerCaseSearchTerm);

  // Search in Nexus Mutual Covers
  if (allProducts["Nexus Mutual Covers"]) {
    results["Nexus Mutual Covers"] = allProducts["Nexus Mutual Covers"].filter(
      searchInNexusProducts
    );
  }

  // Search in InsurAce Covers
  if (allProducts["InsurAce Covers"]) {
    results["InsurAce Covers"] = {
      SmartContractVulnerabilityCover: allProducts[
        "InsurAce Covers"
      ].SmartContractVulnerabilityCover.filter(searchInInsuraceProducts),
      CustodianRiskCover: allProducts[
        "InsurAce Covers"
      ].CustodianRiskCover.filter(searchInInsuraceProducts),
      StablecoinDePegRiskCover: allProducts[
        "InsurAce Covers"
      ].StablecoinDePegRiskCover.filter(searchInInsuraceProducts),
    };
  }
  return results;
}

async function getSentiment(tokenName) {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", [
      "./sentimentAnalysis/twitter.py",
      tokenName,
    ]);

    let sentimentDict = null;

    python.stdout.on("data", (data) => {
      sentimentDict = JSON.parse(data.toString());
    });

    python.stderr.on("data", (data) => {
      console.error(`stderror: ${data}`);
    });

    python.on("close", (code) => {
      console.log(`child process exited with code: ${code}`);
      resolve(sentimentDict);
    });
 });
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
    if (functionName === "tavilyBasicSearch") {
        output = await tavilyBasicSearch(JSON.parse(functionArgs).query);
    } else if (functionName === "tavilyAdvancedSearch") {
        output = await tavilyAdvancedSearch(JSON.parse(functionArgs).query);
    } else if (functionName === "lowBetaHighGrowth") {
        output = await getLowBetaHighGrowthPairs();
    } else if (functionName === "checkForInsurance") {
        output = await searchProducts(functionArgs);
    } else if (functionName === "sentimentAnalysis") {
      output = await getSentiment(JSON.parse(functionArgs).query);
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
  if (
    lastMessage &&
    lastMessage.content &&
    lastMessage.content.length > 0 &&
    lastMessage.content[0].text
  ) {
    const messageContent = lastMessage.content[0].text; // Access the text object
    const messageText = messageContent.value || JSON.stringify(messageContent); // Get the text value or stringify if it's an object
    console.log("Message Content:", messageText);
    return messageText;
  } else {
    // Log if no message is found
    console.log("No last message found");
    return null;
  }
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

// HELPER FUNCS FOR BETA CALCS
async function addBetaCalcToExistingData() {
  const pools = await getPoolData("arbitrum", "uniswap-v3");

  // Get first 10 elements from pool data
  const firstTenPools = pools.slice(0, 10); // Note: Makes a shallow copy - might need to change later for efficiency

  for (let i = 0; i < firstTenPools.length; i++) {
    const poolID = firstTenPools[i].pool;
    const beta = await calcBeta(poolID);

    // Append the beta value to the current pool object
    firstTenPools[i].beta = beta;
    await sleep(1000); // Waits for 1 second
  }
  return firstTenPools;
}

// Get data from the /pools endpoint from Defillama
async function getPoolData(chain, project) {
  const currentTime = new Date().getTime();

  // If not stored in cache, then get data from api and then store back into cache
  try {
    const requestURL = "https://yields.llama.fi/pools";
    const response = await axios.get(requestURL);

    if (response.data.status === "success") {
      const filteredPools = response.data.data.filter(
        (pool) =>
          pool.chain &&
          pool.chain.toLowerCase() === chain.toLowerCase() &&
          pool.project &&
          pool.project.toLowerCase() === project.toLowerCase()
      );

      // Sort the filtered pools using the calcRank function
      const sortedPools = sortPoolData(filteredPools);

      return sortedPools;
    } else {
      console.error("API call was not successful.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while fetching pool data:", error);
    return null;
  }
}

function sortPoolData(pools) {
  return pools.sort((a, b) => calcRank(b) - calcRank(a));
}

function calcRank(pool) {
  // Function to safely handle null values
  const safeValue = (value) => value || 0;

  // Calculate the rank based on the weight
  return (
    0.3 * safeValue(pool.apy) +
    0.3 * safeValue(pool.apyBase) +
    0.1 * safeValue(pool.tvlUsd) +
    0.05 * safeValue(pool.apyPct1D) +
    0.05 * safeValue(pool.apyPct7D) +
    0.15 * safeValue(pool.apyPct30D) +
    0.025 * safeValue(pool.apyBase7d) +
    0.075 * safeValue(pool.apyMean30d)
  );
}

// Cache object for the following methods
let cache2 = {
  dailyPoolAPY: {
    timestamp: null,
    data: null,
    expiration: 3600 * 1000, // Cache duration - 1 hour
  },
  dailyEthPrices: {
    timestamp: null,
    data: null,
    expiration: 3600 * 1000, // Cache duration - 1 hour
  },
};

async function calcBeta(poolID) {
  try {
    // Get daily pool apy and eth price data concurrently
    const [poolAPYResponse, ethPrices] = await fetchAPYAndEthPrices(poolID);

    if (!poolAPYResponse || !ethPrices) {
      console.error("Failed to retrieve data.");
      return;
    }

    const { apyArray, startTimestamp, endTimestamp } = poolAPYResponse;

    // Filter data points so both apy data and eth data are on same time horizon
    const filteredEthPrices = filterData(
      apyArray,
      ethPrices,
      startTimestamp,
      endTimestamp
    );

    // Calc daily returns
    const dailyAPYReturns = calculateDailyReturns(apyArray, apyArray.length);
    const dailyETHReturns = calculateDailyReturns(
      filteredEthPrices,
      apyArray.length
    );

    const apyMean = calculateMean(dailyAPYReturns);
    const ethMean = calculateMean(dailyETHReturns);

    // Calc covariance and variance
    const covariance = calculateCovariance(
      dailyAPYReturns,
      dailyETHReturns,
      apyMean,
      ethMean
    );
    const variance = calculateVariance(dailyETHReturns, ethMean);

    const beta = covariance / variance;
    return beta;
  } catch (error) {
    console.error("An error occurred in calcBeta:", error);
  }
}

// Make sure we only use eth prices for the timeline specified
function filterData(dailyAPY, ethPrices, startTimestamp, endTimestamp) {
  const dataPoints = ethPrices.reduce((filteredData, priceEntry) => {
    const timestamp = priceEntry[0];
    const dataPoint = priceEntry[1];

    if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
      filteredData.push(dataPoint);
    }

    return filteredData;
  }, []);

  return dataPoints;
}

async function fetchAPYAndEthPrices(poolID) {
  return Promise.all([getDailyPoolAPY(poolID), getDailyEthPrices()]);
}

function calculateDailyReturns(data, length) {
  // Ensure the length does not exceed the data array's length
  length = Math.min(length, data.length);

  // Slice the data array to only include the number of elements specified by length
  const slicedData = data.slice(0, length);

  return slicedData
    .slice(1) // Still start from the second element
    .map((value, index) => {
      const previousValue = slicedData[index]; // Reference to the previous element in the sliced data
      if (previousValue === 0) {
        // Prevent division by zero
        return 0;
      }
      return (value - previousValue) / previousValue;
    });
}

function calculateCovariance(x, y, xMean, yMean) {
  return (
    x
      .map((xValue, i) => (xValue - xMean) * (y[i] - yMean))
      .reduce((sum, current) => sum + current, 0) / x.length
  );
}

function calculateVariance(data, mean) {
  return (
    data
      .map((x) => Math.pow(x - mean, 2))
      .reduce((sum, current) => sum + current, 0) / data.length
  );
}

function calculateMean(array) {
  const sum = array.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  return sum / array.length;
}

// Retrieve daily pool APY for one year
async function getDailyPoolAPY(poolID) {
  try {
    const requestURL = `https://yields.llama.fi/chart/${poolID}`;
    const response = await axios.get(requestURL);

    if (response.data.status === "success") {
      const dailyAPYData = response.data.data;

      // Check if dailyAPYData is not empty
      if (dailyAPYData.length === 0) {
        console.log("No data available.");
        return null;
      }

      // Convert timestamps to Unix time and print
      const startTimestamp = new Date(dailyAPYData[0].timestamp).getTime();
      const endTimestamp = new Date(
        dailyAPYData[dailyAPYData.length - 3].timestamp
      ).getTime();

      // Note if the apy is 0 or null need to remove it but also need to remove that date for ethereum data so it's completely aligned

      // Map APY values for return
      const apyArray = dailyAPYData.map((pool) => pool.apy);
      return { apyArray, startTimestamp, endTimestamp };
    } else {
      console.log("API call was not successful.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while fetching pool data:", error);
    return null;
  }
}

// Retrieve the max amount of data points defillama has on eth prices
async function getDailyEthPrices() {
  const currentTime = new Date().getTime();
  const cacheEntry = cache2.dailyEthPrices;

  // Check if cache is valid and return data if possible
  if (
    cacheEntry.timestamp &&
    currentTime - cacheEntry.timestamp < cacheEntry.expiration
  ) {
    console.log("Returning Daily ETH Prices from cache");
    return cacheEntry.data;
  }

  try {
    const requestURL = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=max`;
    const response = await axios.get(requestURL);
    // Note: Struct is an array of arrays (each sub array has unix timestamp and price)
    const queriedPrices = response.data.prices;

    // Update cache with newly retrieved data before returning
    cache2.dailyEthPrices = {
      timestamp: currentTime,
      data: queriedPrices,
      expiration: cacheEntry.expiration,
    };

    return queriedPrices;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

async function getInsuranceProducts() {
  const [nexusMutualProducts, insurAceProducts] = await Promise.all([
    getNexusMutualProducts(),
    getInsurAceProducts(),
  ]);

  const allProducts = {
    "Nexus Mutual Covers": nexusMutualProducts,
    "InsurAce Covers": insurAceProducts,
    Note: "Insurance covers from both providers may not be for all chains (i.e. Arbitrum)",
  };

  return allProducts;
}

async function getNexusMutualProducts() {
  try {
    const url = "https://sdk.nexusmutual.io/data/products.json";
    const response = await axios.get(url);
    const products = response.data;
    return products;
  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
}

function getInsurAceProducts() {
  // Construct the path to the JSON file
  const jsonFilePath = path.join(__dirname, "dataAnalysis", "products.json");

  // Read the file synchronously (you can do this asynchronously as well)
  try {
    const fileContents = fs.readFileSync(jsonFilePath, "utf8");
    const data = JSON.parse(fileContents);
    return data;
  } catch (err) {
    console.error("Error reading file:", err);
    return null; // or handle the error as you see fit
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
});
