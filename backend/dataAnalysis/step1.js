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

// Get data from the /pools endpoint from Defillama
async function getPoolData(chain, project, prediction) {
  try {
    const requestURL = "https://yields.llama.fi/pools";
    const response = await axios.get(requestURL);

    if (response.data.status === "success") {
      const filteredPools = response.data.data.filter(
        (pool) => pool.chain && pool.chain.toLowerCase() === chain.toLowerCase() 
            && pool.project && pool.project.toLowerCase() === project.toLowerCase() 
      );

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

async function calcBeta(poolID) {
  try {
    // Get daily pool apy and eth price data concurrently
    const [dailyAPY, ethPrices] = await Promise.all([
      getDailyPoolAPY(poolID),
      getDailyEthPrices(),
    ]);

    if (!dailyAPY || !ethPrices) {
      console.error("Failed to retrieve data.");
      return;
    }

    // const startTimestamp = new Date(dailyAPY[0].timestamp).getTime();
    // const endTimestamp = new Date(dailyAPY[dailyAPY.length - 1].timestamp).getTime();
    // const ethPrices = await getDailyEthPrices(startTimestamp, endTimestamp);

    let dailyAPYReturns = [];
    let dailyETHReturns = [];

    console.log("Daily APY Length:", dailyAPY.length);
    console.log("Daily ETH Length:", ethPrices.length);
    // Calc daily returns
    for (let i = 1; i < dailyAPY.length; i++) {
      const dailyAPYReturn = (dailyAPY[i] - dailyAPY[i - 1]) / dailyAPY[i - 1];
      dailyAPYReturns.push(dailyAPYReturn);
    }

    for (let i = 1; i < ethPrices.length; i++) {
      const dailyETHReturn =
        (ethPrices[i] - ethPrices[i - 1]) / ethPrices[i - 1];
      dailyETHReturns.push(dailyETHReturn);
    }

    const apyMean = calculateMean(dailyAPYReturns);
    const ethMean = calculateMean(dailyETHReturns);
    
    console.log("APY Mean:", apyMean);
    console.log("ETH Mean:", ethMean);

    // Calc covariance
    const covariance = calculateCovariance(dailyAPYReturns, dailyETHReturns, apyMean, ethMean);
    const variance = calculateVariance(dailyETHReturns, ethMean);

    console.log("Covariance:", covariance);
    console.log("Variance:", variance);
    
    const beta = covariance / variance; 
    console.log("Beta:", beta);

    // Calc variance
  } catch (error) {
    console.error("An error occurred in calcBeta:", error);
  }
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
        const dailyAPYForOneYear = [];

        if (response.data.status === "success") {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Set to one year ago

            const dailyAPYForOneYear = response.data.data.filter(pool => {
                const poolDate = new Date(pool.timestamp);
                return poolDate >= oneYearAgo; // Include only data from the last year
            });

            // Prepare values to be returned 
            const startTimestamp = new Date(dailyAPYForOneYear[0].timestamp).getTime();
            const endTimestamp = new Date(dailyAPYForOneYear[dailyAPYForOneYear.length - 1].timestamp).getTime();
            const apyArray = dailyAPYForOneYear.map((pool) => pool.apy);

            // return {
            //     startTimestamp, 
            //     endTimestamp, 
            //     apyArray    
            // }; 
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

// Get data from defillama /chart/{coins} endpoint
// async function getDailyEthPrice(startTimestamp, endTimestamp){
//     try {
//         console.log("Start Timestamp:", startTimestamp);
//         console.log(typeof startTimestamp); 

//         console.log("End Timestamp:", endTimestamp);
//         console.log(typeof endTimestamp); 

//         const requestURL = `https://coins.llama.fi/chart/ethereum:0xdF574c24545E5FfEcb9a659c229253D4111d87e1?start=${startTimestamp}&end=${endTimestamp}`;
//         https://coins.llama.fi/chart/ethereum:0xdF574c24545E5FfEcb9a659c229253D4111d87e1?start=1674342120742&end=1705773688183

//         const response = await axios.get(requestURL);

//     } catch (error) {
//         console.error("An error occurred while fetching pool data:", error);
//         return null;
//     }
// }

// NOTE: IN DIFFERENT TIMELINE AS HISTORIC POOL APY
async function getDailyEthPrices() {
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
    return prices;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

main();
