const axios = require("axios");

async function main() {
  // Get data for all pools
  const pools = await getPoolData("arbitrum");
  // Filter based on APY and TVL
  const highestAPY = sortPoolData(pools); 
  console.log(highestAPY);
  // Beta analysis
}

// Get data from the /pools endpoint from Defillama
async function getPoolData(chain) {
  try {
    const requestURL = "https://yields.llama.fi/pools";
    const response = await axios.get(requestURL);

    if (response.data.status === "success") {
      const filteredPools = response.data.data.filter(
        (pool) => pool.chain && pool.chain.toLowerCase() === chain.toLowerCase()
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
// 4. APY PCT 1D, 7D, 30D (Each is it's own variable)
// 5. apyBase7d
// 6. apyMeand30d

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

main();
