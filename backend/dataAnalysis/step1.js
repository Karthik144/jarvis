const axios = require("axios");
const path = require("path");
const fs = require("fs");

async function main() {
  // Get data for all pools
  // const pools = await getPoolData("arbitrum", "uniswap-v3");
  // console.log(pools[0]);

  getLowBetaHighGrowthPairs();
  // getDailyPoolAPY("9917f09e-414f-4440-947c-bc06d0c50833");
  // await getInsuranceProducts();
  // await getInsurAceProducts();
  // Filter based on APY and TVL
  //   const highestAPY = sortPoolData(pools);
  // Beta analysis
  //   const data = await getDailyPoolAPY('747c1d2a-c668-4682-b9f9-296708a3dd90');
  // await calcBeta('747c1d2a-c668-4682-b9f9-296708a3dd90');
  // const relevantProducts = await searchProducts("uniswap");
  // console.log(relevantProducts);
}

// Cache for getting sorted pool data from the following three methods
let cache1 = {
  timestamp: null,
  data: null,
  expiration: 60 * 60 * 1000, // Cache expiration time - 1 hour
};

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

async function addBetaCalcToExistingData() {
  const pools = await getPoolData("arbitrum", "uniswap-v3");

  // Get first 10 elements from pool data
  const firstTenPools = pools.slice(0, 10); // Note: Makes a shallow copy - might need to change later for efficiency

  // // Create an array of promises
  // const betaPromises = firstTenPools.map((pool) => calcBeta(pool.pool));

  // // Wait for all the promises to resolve
  // const betas = await Promise.all(betaPromises);

  // // Assign each beta value to the corresponding pool
  // for (let i = 0; i < firstTenPools.length; i++) {
  //   firstTenPools[i].beta = betas[i];
  //   await sleep(1000); // Waits for 1 second
  // }
  for (let i = 0; i < firstTenPools.length; i++) {
    const poolID = firstTenPools[i].pool;
    const beta = await calcBeta(poolID);

    // Append the beta value to the current pool object
    firstTenPools[i].beta = beta;
    await sleep(1000); // Waits for 1 second
  }
  console.log("FIRST 10:", firstTenPools);
  return firstTenPools;
}
// Get data from the /pools endpoint from Defillama
async function getPoolData(chain, project) {
  const currentTime = new Date().getTime();

  // Check if cache is valid and return value if possible
  if (cache1.timestamp && currentTime - cache1.timestamp < cache1.expiration) {
    console.log("Returning data from cache");
    return cache1.data;
  }

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

      // Update cache with retrieved data before return final values
      cache1 = {
        timestamp: currentTime,
        data: sortedPools,
        expiration: cache1.expiration,
      };

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

// Sort pool data based on APY and TVL

// Main values:
// 1. APY
// 2. APY Base
// 3. TVL USD
// 4. APY PCT 1D, 7D, 30D (each is it's own variable)
// 5. apyBase7d
// 6. apyMean30d

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
    console.log("DAILY APY Length:", apyArray.length);
    // console.log("Daily APY Length:", dailyAPYData.length);
    console.log("Daily ETH Length:", filteredEthPrices.length);

    // const sanitizedDailyAPY = sanitizeArray(dailyAPY);
    // const sanitizedEthPrices = sanitizeArray(ethPrices);

    // Calc daily returns
    const dailyAPYReturns = calculateDailyReturns(apyArray, apyArray.length);
    const dailyETHReturns = calculateDailyReturns(
      filteredEthPrices,
      apyArray.length
    );

    console.log("Daily APY Returns:", dailyAPYReturns.length);
    console.log("Daily ETH Returns:", dailyETHReturns.length);

    const apyMean = calculateMean(dailyAPYReturns);
    const ethMean = calculateMean(dailyETHReturns);

    console.log("APY Mean:", apyMean);
    console.log("ETH Mean:", ethMean);

    // Calc covariance and variance
    const covariance = calculateCovariance(
      dailyAPYReturns,
      dailyETHReturns,
      apyMean,
      ethMean
    );
    const variance = calculateVariance(dailyETHReturns, ethMean);

    console.log("Covariance:", covariance);
    console.log("Variance:", variance);

    const beta = covariance / variance;
    console.log("Beta:", beta);
    return beta;
  } catch (error) {
    console.error("An error occurred in calcBeta:", error);
  }
}

function filterData(dailyAPY, ethPrices, startTimestamp, endTimestamp) {
  // Use reduce to filter and map in a single iteration
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

  // Calculate returns as before, but using the sliced data
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
  // logArrayStats(array);

  const sum = array.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  return sum / array.length;
}

function sanitizeArray(array) {
  return array.filter((value) => isFinite(value));
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

      console.log("UNIX START TIME:", startTimestamp);
      console.log("UNIX END TIME:", endTimestamp);

      console.log("APY Start Timestamp:", dailyAPYData[0].timestamp);
      console.log(
        "APY End Timestamp:",
        dailyAPYData[dailyAPYData.length - 3].timestamp
      ); // Need to change this to be less recent

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
    // const requestURL = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=365&interval=daily`;
    const requestURL = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=max`;
    const response = await axios.get(requestURL);
    // Note: Struct is an array of arrays (each sub array has unix timestamp and price)
    const queriedPrices = response.data.prices;
    // let prices = [];
    // for (let i = 0; i < queriedPrices.length; i++) {
    //   const price = queriedPrices[i][1];
    //   prices.push(price);
    // }

    // Update cache with newly retrieved data before returning
    cache2.dailyEthPrices = {
      timestamp: currentTime,
      data: queriedPrices,
      expiration: cacheEntry.expiration,
    };

    // return prices;
    return queriedPrices;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
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
  const jsonFilePath = path.join(__dirname, "products.json");

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

main();
