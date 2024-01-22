const axios = require("axios");

async function main() {
  // Get data for all pools
//   const pools = await getPoolData("arbitrum", "uniswap-v3");
  // Filter based on APY and TVL
//   const highestAPY = sortPoolData(pools); 
  // Beta analysis
//   const data = await getDailyPoolAPY('747c1d2a-c668-4682-b9f9-296708a3dd90');
    await calcBeta('747c1d2a-c668-4682-b9f9-296708a3dd90');
}

// Cache for getting sorted pool data from the following three methods 
let cache1 = {
    timestamp: null,
    data: null,
    expiration: 60 * 60 * 1000 // Cache expiration time - 1 hour
};

// Get data from the /pools endpoint from Defillama
async function getPoolData(chain, project, prediction) {

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
                (pool) => pool.chain && pool.chain.toLowerCase() === chain.toLowerCase() 
                    && pool.project && pool.project.toLowerCase() === project.toLowerCase() 
            );

            // Update cache with retrieved data before return final values 
            cache1 = {
                timestamp: currentTime, 
                data: filteredPools, 
                expiration: cache1.expiration
            };

            return filteredPools;

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
    const [dailyAPY, ethPrices] = await fetchAPYAndEthPrices(poolID);

    if (!dailyAPY || !ethPrices) {
      console.error("Failed to retrieve data.");
      return;
    }

    // const startTimestamp = new Date(dailyAPY[0].timestamp).getTime();
    // const endTimestamp = new Date(dailyAPY[dailyAPY.length - 1].timestamp).getTime();
    // const ethPrices = await getDailyEthPrices(startTimestamp, endTimestamp);

    console.log("Daily APY Length:", dailyAPY.length);
    console.log("Daily ETH Length:", ethPrices.length);

    // Calc daily returns
    const dailyAPYReturns = calculateDailyReturns(dailyAPY);
    const dailyETHReturns = calculateDailyReturns(ethPrices);


    const apyMean = calculateMean(dailyAPYReturns);
    const ethMean = calculateMean(dailyETHReturns);
    
    console.log("APY Mean:", apyMean);
    console.log("ETH Mean:", ethMean);

    // Calc covariance and variance
    const covariance = calculateCovariance(dailyAPYReturns, dailyETHReturns, apyMean, ethMean);
    const variance = calculateVariance(dailyETHReturns, ethMean);

    console.log("Covariance:", covariance);
    console.log("Variance:", variance);

    const beta = covariance / variance; 
    console.log("Beta:", beta);

  } catch (error) {
    console.error("An error occurred in calcBeta:", error);
  }
}

async function fetchAPYAndEthPrices(poolID) {
  return Promise.all([getDailyPoolAPY(poolID), getDailyEthPrices()]);
}

function calculateDailyReturns(data) {
  return data
    .slice(1)
    .map((value, index) => (value - data[index]) / data[index]);
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
  const currentTime = new Date().getTime();
  const cacheEntry = cache2.dailyPoolAPY;

  // Check if cache is valid and return data if possible 
  if (cacheEntry.timestamp && currentTime - cacheEntry.timestamp < cacheEntry.expiration) {
    console.log("Returning Daily Pool APY from cache");
    return cacheEntry.data;
  }

  try {
    const requestURL = `https://yields.llama.fi/chart/${poolID}`;
    const response = await axios.get(requestURL);
    const dailyAPYForOneYear = [];

    if (response.data.status === "success") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Set to one year ago

      const dailyAPYForOneYear = response.data.data.filter((pool) => {
        const poolDate = new Date(pool.timestamp);
        return poolDate >= oneYearAgo; // Include only data from the last year
      });

      // Prepare values to be returned
      const startTimestamp = new Date(
        dailyAPYForOneYear[0].timestamp
      ).getTime();
      const endTimestamp = new Date(
        dailyAPYForOneYear[dailyAPYForOneYear.length - 1].timestamp
      ).getTime();
      const apyArray = dailyAPYForOneYear.map((pool) => pool.apy);

      // Update cache before returning retrieved data 
      cache.dailyPoolAPY = {
        timestamp: currentTime, 
        data: apyArray, 
        expiration: cacheEntry.expiration

      };

      return apyArray;

    } else {
      console.log("API call was not successful.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while fetching pool data:", error);
    return null;
  }
}

// NOTE: IN DIFFERENT TIMELINE AS HISTORIC POOL APY
async function getDailyEthPrices() {
    const currentTime = new Date().getTime(); 
    const cacheEntry = cache2.dailyEthPrices; 

    // Check if cache is valid and return data if possible 
    if (cacheEntry.timestamp && (currentTime - cacheEntry.timestamp < cacheEntry.expiration)) {
        console.log("Returning Daily ETH Prices from cache");
        return cacheEntry.data;
    }

    try {
        const requestURL = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=365&interval=daily`;
        const response = await axios.get(requestURL);
        // Note: Struct is an array of arrays (each sub array has unix timestamp and price)
        const queriedPrices = response.data.prices;
        let prices = [];
        for (let i = 0; i < queriedPrices.length; i++) {
            const price = queriedPrices[i][1];
            prices.push(price);
        }

        // Update cache with newly retrieved data before returning 
        cache2.dailyEthPrices = {
            timestamp: currentTime, 
            data: prices, 
            expiration: cacheEntry.expiration
        };

        return prices;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

main();
