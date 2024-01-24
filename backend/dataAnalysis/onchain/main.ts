import {
  getTickIndicesInWordRange,
  getPoolData,
  getAllTicks,
} from './poolfish++'
import { getProvider } from './providers'
import { Pool } from '@uniswap/v3-sdk'

async function main() {
  // Get current blocknumber and Pooldata
    const blockNum = await getProvider().getBlockNumber()
    console.log(`Current Block Number: ${blockNum}`)
    const poolData = await getPoolData(blockNum)

    // Get Bitmap Range
    const tickLower = -887272
    const tickUpper = 887272
    const lowerWord = tickToWordCompressed(tickLower, poolData.tickSpacing)
    const upperWord = tickToWordCompressed(tickUpper, poolData.tickSpacing)

    // Fetch all initialized tickIndices in word range
    const tickIndices = await getTickIndicesInWordRange(
        poolData.address,
        poolData.tickSpacing,
        lowerWord,
        upperWord
    )

    // Fetch all initialized ticks from tickIndices
    const ticks = await getAllTicks(poolData.address, tickIndices)

    // Initialize Pool with full tick data
    const fullPool = new Pool(
        poolData.tokenA,
        poolData.tokenB,
        poolData.fee,
        poolData.sqrtPriceX96,
        poolData.liquidity,
        poolData.tick,
        ticks
    )
    
    console.log(fullPool.token0Price)
    
}

//UTILITY
function tickToWordCompressed(tick: number,tickSpacing: number): number {
  let compressed = Math.floor(tick / tickSpacing)
  if (tick < 0 && tick % tickSpacing !== 0) {
    compressed -= 1
  }
  return tickToWord(compressed)
}

function tickToWord(tick: number): number {
  return tick >> 8
}

main()