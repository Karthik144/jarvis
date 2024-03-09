import axios from "axios"

const SUBGRAPH_API = 'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-ethereum'

const GET_BLOCK_NUMBERS_QUERY = (pool_addr: string, start_timestamp: number, end_timestamp: number) => `
{
  liquidityPool(id: "${pool_addr}") {
    dailySnapshots(where: {timestamp_gte: "${start_timestamp}", timestamp_lte: "${end_timestamp}"}) {
      blockNumber
      timestamp
    }
  }
}
`

const GET_TOKEN_PRICE_QUERY = (pool_addr: string, blockNumber: number) => `
{
  liquidityPoolAmount(
    id: "${pool_addr}",
    block: {number: ${blockNumber}}
  ) {
    tokenPrices
  }
}`;


export async function getPoolPrices(days_of_data: number, pool_addr: string[]) {
  const pool_data: PoolData = {};
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0) //current day

  const end_timestamp = Math.floor(currentDate.getTime() / 1000);
  currentDate.setDate(currentDate.getDate() - days_of_data);
  currentDate.setHours(0, 0, 0, 0)
  const start_timestamp = Math.floor(currentDate.getTime() / 1000)

  for (let i = 0; i < pool_addr.length; i++) {
    try {
      const response = await axios.post(SUBGRAPH_API, { query: GET_BLOCK_NUMBERS_QUERY(pool_addr[i], start_timestamp, end_timestamp) });
      const blockNumbers = response.data.data.liquidityPool.dailySnapshots.map((snapshot: Snapshot) => snapshot.blockNumber);
      const tokenPricePromises = blockNumbers.map(async (blockNumber: number) => {
          const priceResponse = await axios.post(SUBGRAPH_API, { query: GET_TOKEN_PRICE_QUERY(pool_addr[i],blockNumber) });
          
          //simplifies to price quoted in second-token/token2
          return Number(priceResponse.data.data.liquidityPoolAmount.tokenPrices[1]);
      });
      
      const tokenPrices = await Promise.all(tokenPricePromises);
      pool_data[pool_addr[i]] = tokenPrices
    } catch (error) {
        console.error("An error occurred:", error);
    }
  }
  return pool_data
}

// getPoolPrices(60, ["0x948b54A93f5aD1df6B8bFF6Dc249D99CA2EcA052"])

//types
interface Snapshot {
  blockNumber: number;
  timestamp: number;
}

interface PoolData {
  [key: string]: number[]
}
