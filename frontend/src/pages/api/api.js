// IMPORTS
const { OpenAI } = require("openai");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

//GLOBAL STATE
let poolOffset = 0;
let page = 1; 

// GLOBAL VARS
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
  baseURL: "https://oai.hconeai.com/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer sk-iqcbg7a-2diev6a-xrelkyq-5vfnb5a`,
  },
});

const supabaseUrl = "https://nibfafwhlabdjvkzpvuv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU";

const supabase = createClient(supabaseUrl, supabaseKey);

// MAIN FUNCS - USED FOR FUNC CALLING
async function tavilyAdvancedSearch(query) {
  console.log("QUERY IN TAVILY:", query);
  const endpoint = "https://api.tavily.com/search";

  try {
    const response = await axios.post(endpoint, {
      api_key: "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",
      query: query,
      search_depth: "advanced",
      include_images: false,
      include_answer: false,
      include_raw_content: false,
      max_results: 5,
      include_domains: [],
      exclude_domains: [],
    });
    return response.data;
  } catch (error) {
    console.error("Error in tavilySearch:", error);
  }
}

async function checkForInsurance(searchTerm) {
  const allProducts = await getInsuranceProducts();

  const results = {
    "Nexus Mutual Covers": [],
    "InsurAce Covers": {},
  };

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  const searchInNexusProducts = (product) =>
    product.name.toLowerCase().includes(lowerCaseSearchTerm);

  const searchInInsuraceProducts = (cover) =>
    cover.Protocol.toLowerCase().includes(lowerCaseSearchTerm);

  if (allProducts["Nexus Mutual Covers"]) {
    results["Nexus Mutual Covers"] = allProducts["Nexus Mutual Covers"].filter(
      searchInNexusProducts
    );
  }

  if (allProducts["InsurAce Covers"]) {
    const insurAceCovers = {};

    const smartContractVulnerabilityCover = allProducts[
      "InsurAce Covers"
    ].SmartContractVulnerabilityCover.filter(searchInInsuraceProducts);

    if (smartContractVulnerabilityCover.length > 0) {
      insurAceCovers.SmartContractVulnerabilityCover =
        smartContractVulnerabilityCover;
    }

    const custodianRiskCover = allProducts[
      "InsurAce Covers"
    ].CustodianRiskCover.filter(searchInInsuraceProducts);

    if (custodianRiskCover.length > 0) {
      insurAceCovers.CustodianRiskCover = custodianRiskCover;
    }

    const stablecoinDePegRiskCover = allProducts[
      "InsurAce Covers"
    ].StablecoinDePegRiskCover.filter(searchInInsuraceProducts);

    if (stablecoinDePegRiskCover.length > 0) {
      insurAceCovers.StablecoinDePegRiskCover = stablecoinDePegRiskCover;
    }

    if (Object.keys(insurAceCovers).length > 0) {
      results["InsurAce Covers"] = insurAceCovers;
    }
  }

  return results;
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

async function predict_LP({ tokenOne, tokenTwo }) {
  const result = await getLPTokenAddresses(tokenOne, tokenTwo);
  console.log("RESULT IN PREDICT:", result);
  return result; 
}

async function filterPoolsByAPY(baseAPY, thirtyDayAPY) {
  const chain = "ethereum";
  const project = "uniswap-v3";
  const pageSize = 10;
  console.log("BASE APY:", baseAPY);
  console.log("30 Day APY:", thirtyDayAPY);

  try {
    const requestURL = "https://yields.llama.fi/pools";
    const response = await axios.get(requestURL);

    if (response.data.status === "success") {
      const filteredPools = response.data.data.filter(
        (pool) =>
          pool.chain &&
          pool.chain.toLowerCase() === chain.toLowerCase() &&
          pool.project &&
          pool.project.toLowerCase() === project.toLowerCase() &&
          !pool.stablecoin &&
          pool.tvlUsd &&
          pool.tvlUsd >= 1500000 &&
          pool.apyBase &&
          pool.apyBase >= baseAPY &&
          pool.apyMean30d &&
          pool.apyMean30d >= thirtyDayAPY
      );

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPools = filteredPools.slice(startIndex, endIndex);
      page += 1;
      return paginatedPools;
    } else {
      console.error("API call was not successful.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while fetching pool data:", error);
    return null;
  }
}

async function getTopMomentumScores() {
  const { data, error } = await supabase
    .from("momentum-list")
    .select("symbol, momentum_scores_30D, momentum_score_current")
    .order("momentum_score_current", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  console.log("MOMENTUM SCORES:", data);

  // Transform the data into the desired hashmap structure
  const momentumScoresMap = data.reduce((acc, item) => {
    acc[item.symbol] = [
      item.momentum_scores_30D, // Array of momentum scores for the past 30 days
      item.momentum_score_current, // Current momentum score
      // Add more placeholders or actual data as needed
    ];
    return acc;
  }, {});

  const searchPromises = Object.keys(momentumScoresMap).map(async (symbol) => {
    const summaryResult = await tavilyAdvancedSearch(`Summary of ${symbol} crypto`);

    // Retrieve the latest updates on the token
    // const updatesResult = await tavilyAdvancedSearch(
    //   `Updates on ${symbol} crypto`
    // );
    
    console.log("SUMMARY RESULT:", summaryResult); 
    // console.log("UPDATE RESULTS:", updatesResult); 

    momentumScoresMap[symbol].push(summaryResult);
  });

  await Promise.all(searchPromises);

  console.log("Transformed Momentum Scores:", momentumScoresMap);

  return momentumScoresMap;
}


// OPEN-AI START
async function runConversation(query, messages) {
  console.log("INSIDE RUN CONVO");
  console.log("RUN CONVERSATION CALLED"); 
  console.log("Messages:", messages); 

  const tools = [
    {
      type: "function",
      function: {
        name: "tavilyAdvancedSearch",
        description:
          "Get basic crypto/blockchain info from the internet. Use this only when you need more detailed info.",
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
    {
      type: "function",
      function: {
        name: "checkForInsurance",
        description:
          "Get a list of insurance covers for the specified blockchain protocol from NexusMutual and Insurace.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "The protocol name the user is trying to find an available insurance for.",
            },
          },
          required: ["query"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "getLowBetaHighGrowthPairs",
        description:
          "Get a list of low beta, high growth tokens along with some details for each pool (i.e. APY)",
      },
    },
    {
      type: "function",
      function: {
        name: "getTopMomentumScores",
        description:
          "Get a list top 10 tokens with the highest momentum scores along with their token symbol, current momentum score, historical momentum scores, token summary, and token updates.",
      },
    },
    {
      type: "function",
      function: {
        name: "predict_LP",
        description:
          "Estimate best liquidity pool range for two tokens 100 day positions. Function will return a JSON object with tokenOneAddress and tokenTwoAddress. Return this JSON object directly without any additions.",
        parameters: {
          type: "object",
          properties: {
            tokenOne: {
              type: "string",
              description:
                "The token ticker name for the first token used in the liquidity pool calculation (i.e. BTC for Bitcoin)",
            },
            tokenTwo: {
              type: "string",
              description:
                "The token ticker name for the second token used in the liquidity pool calculation (i.e. BTC for Bitcoin)",
            },
          },
          required: ["tokenOne", "tokenTwo"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "filterPoolsByAPY",
        description:
          "Filter pools by base APY and 30d mean APY based on user inputs.",
        parameters: {
          type: "object",
          properties: {
            baseAPY: {
              type: "number",
              description: "The base APY to filter by (e.g. 10.0)",
            },
            thirtyDayAPY: {
              type: "number",
              description: "The 30D APY to filter by (e.g. 15.0)",
            },
          },
          required: ["baseAPY", "thirtyDayAPY"],
        },
      },
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });

  const responseMessage = response.choices[0].message;
  const toolCalls = responseMessage.tool_calls;
  console.log("QUERY INSIDE RUN CONVERSATION:", query); 
  console.log("TOOLS CALLS LENGTH:", toolCalls.length); 
  if (
    toolCalls &&
    !query
      .toLowerCase()
      .includes("perform correlation analysis on watchlist tokens")
  ) {
    console.log("INSIDE TOOL CALLS");
    const availableFunctions = {
      tavilyAdvancedSearch,
      checkForInsurance,
      filterPoolsByAPY,
      getLowBetaHighGrowthPairs,
      getTopMomentumScores,
      predict_LP,
    };

    messages.push(responseMessage);
    let predictLPCalled = false;
    let functionResponse;

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log("FUNCTION NAME:", functionName);
      console.log("FUNCTION ARGS:", functionArgs);

      if (functionName === "predict_LP") {
        functionResponse = await functionToCall(functionArgs);
        predictLPCalled = true;
        console.log("PREDICT LP CALLED:", predictLPCalled);
        console.log("FUNCTION RESPONSE IN AI:", functionResponse);
      } else if (functionName === "filterPoolsByAPY") {
        console.log("FILTER BY APY CALLED");
        functionResponse = await functionToCall(
          functionArgs.baseAPY,
          functionArgs.thirtyDayAPY
        );
      } else {
        functionResponse = await functionToCall(functionArgs.query);
      }
      if (functionName !== "getLowBetaHighGrowthPairs") {
        poolOffset = 0;
      }

      if (functionName !== "filterPoolsByAPY") {
        page = 0;
      }

      const contentString = JSON.stringify(functionResponse);
      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: contentString,
      }); // extend conversation with function response
    }

    if (predictLPCalled) {
      return functionResponse;
    } else {
      //   const stream = await openai.chat.completions.create({
      //     model: "gpt-3.5-turbo-1106",
      //     messages: messages,
      //     stream: true,
      //   }); // get a new response from the model where it can see the function response
      //   for await (const chunk of stream) {
      //     process.stdout.write(chunk.choices[0]?.delta?.content || "");
      //   }
      //   return stream.choices;
      const secondResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: messages,
      }); // get a new response from the model where it can see the function response

      const conversationResult = secondResponse.choices;

      if (!Array.isArray(conversationResult)) {
        console.log(
          "Returning direct predict_LP response:",
          conversationResult
        );
        return conversationResult;
      } else {
        const lastMessageContent =
          conversationResult[conversationResult.length - 1].message.content;
        return lastMessageContent;
      }
    }
  } else {
    console.log("INSIDE ELSE");
    const secondResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messages,
    }); // get a new response from the model where it can see the function response

    const conversationResult = secondResponse.choices;
    const lastMessageContent =
      conversationResult[conversationResult.length - 1].message.content;
    console.log("LAST MESSAGE:", lastMessageContent);
    return lastMessageContent;
  }
}

async function getLPTokenAddresses(tokenOne, tokenTwo) {
  console.log("TOKEN ONE INSIDE FUNC:", tokenOne);
  console.log("TOKEN ONE INSIDE FUNC:", tokenTwo);

  if (tokenOne === "ETH"){
    console.log("INISDE WETH CONVERSION"); 
    tokenOne = 'WETH'; 
  }

  if (tokenTwo === 'ETH'){
    console.log("INISDE SECOND WETH CONVERSION");
    tokenTwo = "WETH"; 
  }

  try {
    const url = `https://api.geckoterminal.com/api/v2/search/pools?query=${tokenOne}&network=arbitrum&include=base_token%2C%20quote_token&page=1`;
    // const url = `https://api.geckoterminal.com/api/v2/search/pools?query=${tokenOne}&network=eth&include=base_token%2C%20quote_token&page=1`;
    const response = await axios.get(url);
    const pools = response.data;

    console.log("POOLS:", pools);
    let tokenOneAddress = "";
    let tokenTwoAddress = "";
    let tokenPair = "";

    let formattedString1 = `${tokenOne} / ${tokenTwo}`;
    let formattedString2 = `${tokenTwo} / ${tokenOne}`;

    console.log("FORMATTED STRING 1:", formattedString1);
    console.log("FORMATTED STRING 2:", formattedString2);

    for (let i = 0; i < pools.data.length; i++) {
      let str = pools.data[i].attributes.name;
      let parts = str.split(" "); // Split the string into parts
      parts.pop(); // Remove the last element (which is "0.05%")
      str = parts.join(" "); // Join the remaining elements back into a string
      console.log("STR:", str);
      if (str === formattedString1 || str === formattedString2) {
        console.log("INSIDE TEST IF STATEMENT");
        const addressOneStr = pools.data[i].relationships.base_token.data.id;
        console.log("ADDRESS ONE STR:", addressOneStr);
        let addressOneParts = addressOneStr.split("_"); // Split the string into parts
        tokenOneAddress = addressOneParts[1];

        const addressTwoStr = pools.data[i].relationships.quote_token.data.id;
        console.log("ADDRESS TWO STR:", addressTwoStr);
        let addressTwoParts = addressTwoStr.split("_"); // Split the string into parts
        tokenTwoAddress = addressTwoParts[1];

        if (str === formattedString1) {
          console.log("INSIDE FORMAT STRING 1 IF"); 
          tokenPair = formattedString1;
        } else {
          console.log("INSIDE FORMAT STRING 2 IF"); 
          tokenPair = formattedString2;
        }

        console.log('PAIR:', tokenPair); 
        console.log("TOKEN ONE ADDRESS:", tokenOneAddress);
        console.log("TOKEN TWO ADDRESS:", tokenTwoAddress);

        if (
          tokenOneAddress !== "" &&
          tokenTwoAddress !== "" &&
          tokenPair !== ""
        ) {
          return {
            tokenOneAddress,
            tokenTwoAddress,
            tokenPair,
          };
        } 

      }
    }


  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
}

// HELPER FUNCS
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

async function getInsurAceProducts() {
  try {
    const response = await fetch("/products.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching products.json:", err);
    return null;
  }
}

// HELPER FUNCS FOR BETA CALCS

async function addBetaCalcToExistingData() {
  // const pools = await getPoolData("arbitrum", "uniswap-v3");
    const pools = await getPoolData("ethereum", "uniswap-v3");
    console.log("INSIDE ADD BETA CALC TO EXISTING DATA"); 
    console.log("POOL OFFSET:", poolOffset); 
  const endIndex = Math.min(poolOffset + 10, pools.length);

  // Get next 10 pools
  const nextTenPools = pools.slice(poolOffset, endIndex);

  // Get first 10 elements from pool data
  // const firstTenPools = pools.slice(0, 10); // Note: Makes a shallow copy - might need to change later for efficiency

  for (let i = 0; i < nextTenPools.length; i++) {
    const poolID = nextTenPools[i].pool;
    const beta = await calcBeta(poolID);

    // Append the beta value to the current pool object
    nextTenPools[i].beta = beta;
  }

  poolOffset += 10;

  // Reset to start from the beginning on the next call
  if (poolOffset >= pools.length) {
    poolOffset = 0;
  }

  return nextTenPools;
}

// Get data from the /pools endpoint from Defillama
async function getPoolData(chain, project) {
  const currentTime = new Date().getTime();

  // If not stored in cache, then get data from api and then store back into cache
  try {
    const requestURL = "https://yields.llama.fi/pools";
    const response = await axios.get(requestURL);
    // Note: Need to allow this to be customized (tvl value + stable coin) based on investor profile from db)
    if (response.data.status === "success") {
      const filteredPools = response.data.data.filter(
        (pool) =>
          pool.chain &&
          pool.chain.toLowerCase() === chain.toLowerCase() &&
          pool.project &&
          pool.project.toLowerCase() === project.toLowerCase() &&
          !pool.stablecoin &&
          pool.tvlUsd &&
          pool.tvlUsd >= 1500000
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
    .slice(1) // Start from the second element
    .map((value, index) => {
      const previousValue = slicedData[index]; // Reference to the previous element in the sliced data
      if (previousValue === 0) {
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

module.exports = { runConversation };
// export default async function handler(req, res) {
//   switch (req.method) {
//     case 'POST':
//       const { query, allMessages } = JSON.parse(req.body);
//       const response = await runConversation(query, allMessages);

//       res.status(200).json({message: response});

//     default:
//       res.status(200).json({message: "Hello!" })
//   }
// }