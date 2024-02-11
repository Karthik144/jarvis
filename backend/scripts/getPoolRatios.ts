import axios from "axios"

const SUBGRAPH_API = 'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-arbitrum'

const GET_BLOCK_NUMBERS_QUERY = (start_timestamp: number, end_timestamp: number) => `
{
  liquidityPool(id: "0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443") {
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


async function main() {
    try {
        const response = await axios.post(SUBGRAPH_API, { query: GET_BLOCK_NUMBERS_QUERY(1704085200, 1707606399) });
        const blockNumbers = response.data.data.liquidityPool.dailySnapshots.map((snapshot: Snapshot) => snapshot.blockNumber);
        console.log(response.data.data.liquidityPool.dailySnapshots.length)
        const tokenPricePromises = blockNumbers.map(async (blockNumber: number) => {
            const priceResponse = await axios.post(SUBGRAPH_API, { query: GET_TOKEN_PRICE_QUERY(blockNumber) });
            
            //simplifies to price quoted in second-token/token2
            return Number(priceResponse.data.data.liquidityPoolAmount.tokenPrices[1]);
        });
        
        const tokenPrices = await Promise.all(tokenPricePromises);
        console.log(tokenPrices)
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main()

//types
interface Snapshot {
  blockNumber: number;
  timestamp: number;
}
