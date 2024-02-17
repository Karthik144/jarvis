import axios from "axios"

const SUBGRAPH_API = 'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-arbitrum'

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

const GET_TOKEN_PRICE_QUERY = (blockNumber: number) => `
{
  liquidityPoolAmount(
    id: "0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443",
    block: {number: ${blockNumber}}
  ) {
    tokenPrices
  }
}`;


async function main(days_of_data: number, pool_addr: string[]) {
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
          const priceResponse = await axios.post(SUBGRAPH_API, { query: GET_TOKEN_PRICE_QUERY(blockNumber) });
          
          //simplifies to price quoted in second-token/token2
          return Number(priceResponse.data.data.liquidityPoolAmount.tokenPrices[1]);
      });
      
      const tokenPrices = await Promise.all(tokenPricePromises);
      pool_data[pool_addr[i]] = tokenPrices
    } catch (error) {
        console.error("An error occurred:", error);
    }
  }

  console.log(pool_data)
}

main(30, ["0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443", "0xdbaeB7f0DFe3a0AAFD798CCECB5b22E708f7852c"])

//types
interface Snapshot {
  blockNumber: number;
  timestamp: number;
}

interface PoolData {
  [key: string]: number[]
}
