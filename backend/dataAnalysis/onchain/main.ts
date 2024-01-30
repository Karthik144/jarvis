//REFS: 
//  https://github.com/Uniswap/examples/blob/main/v3-sdk/pool-data/src/libs/pool-data.ts
//  https://docs.uniswap.org/sdk/v3/guides/advanced/price-oracle
import JSBI from 'jsbi'
import { ethers, providers } from 'ethers'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { Contract, Provider } from 'ethers-multicall'
import { Pool, Tick, FeeAmount } from '@uniswap/v3-sdk'
import { Token, ChainId, Ether } from "@uniswap/sdk-core"

let args = process.argv.slice(2); // FORMAT Token0_address, Token0_decimals, Token1_address, Token1_decimals
//"0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" 18 "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8" 6
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
  
    console.log(fullPool)
    const totalDepositAmountInUSD = JSBI.BigInt(1000); // 1000 USD


  // Convert sqrtPriceX96 to price
  // Calculate the price
  const price = JSBI.multiply(fullPool.sqrtRatioX96, fullPool.sqrtRatioX96);

  // Define price range
  const priceLow = JSBI.multiply(price, JSBI.BigInt(9)); // 10% below the price
  const priceHigh = JSBI.multiply(price, JSBI.BigInt(11)); // 10% above the price

  // Calculate liquidity
  const liq0 = liquidity0(totalDepositAmountInUSD, price, priceHigh);
  const liq1 = liquidity1(totalDepositAmountInUSD, priceLow, price);
  const liq = JSBI.greaterThanOrEqual(liq0, liq1) ? liq0 : liq1;


  // Calculate deposit amounts
  const amount0 = calc_amount0(liq, priceHigh, price);
  const amount1 = calc_amount1(liq, priceLow, price);

  console.log(`Deposit Amount for Token0: ${amount0}`);
  console.log(`Deposit Amount for Token1: ${amount1}`);

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


async function getPoolData(blockNum: number): Promise<PoolData> {
  const poolAddress = Pool.getAddress(
    CurrentConfig.pool.Token0,
    CurrentConfig.pool.Token1,
    CurrentConfig.pool.fee
  )
  const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI.abi,
    getProvider()
  )

  const [slot0, liquidity, tickSpacing] = await Promise.all([
    poolContract.slot0({
      blockTag: blockNum,
    }),
    poolContract.liquidity({
      blockTag: blockNum,
    }),
    poolContract.tickSpacing({
      blockTag: blockNum,
    }),
  ])
  return {
    address: poolAddress,
    tokenA: CurrentConfig.pool.Token0,
    tokenB: CurrentConfig.pool.Token1,
    fee: CurrentConfig.pool.fee,
    sqrtPriceX96: JSBI.BigInt(slot0.sqrtPriceX96.toString()),
    liquidity: JSBI.BigInt(liquidity.toString()),
    tick: parseInt(slot0.tick),
    tickSpacing: tickSpacing,
  }
}

async function getTickIndicesInWordRange(
  poolAddress: string,
  tickSpacing: number,
  startWord: number,
  endWord: number
): Promise<number[]> {
  const multicallProvider = new Provider(getProvider())
  await multicallProvider.init()
  const poolContract = new Contract(poolAddress, IUniswapV3PoolABI.abi)

  const calls: any[] = []
  const wordPosIndices: number[] = []

  for (let i = startWord; i <= endWord; i++) {
    wordPosIndices.push(i)
    calls.push(poolContract.tickBitmap(i))
  }

  const results: bigint[] = (await multicallProvider.all(calls)).map(
    (ethersResponse) => {
      return BigInt(ethersResponse.toString())
    }
  )

  const tickIndices: number[] = []

  for (let j = 0; j < wordPosIndices.length; j++) {
    const ind = wordPosIndices[j]
    const bitmap = results[j]

    if (bitmap !== 0n) {
      for (let i = 0; i < 256; i++) {
        const bit = 1n
        const initialized = (bitmap & (bit << BigInt(i))) !== 0n
        if (initialized) {
          const tickIndex = (ind * 256 + i) * tickSpacing
          tickIndices.push(tickIndex)
        }
      }
    }
  }

  return tickIndices
}

async function getAllTicks(
  poolAddress: string,
  tickIndices: number[]
): Promise<Tick[]> {
  const multicallProvider = new Provider(getProvider())
  await multicallProvider.init()
  const poolContract = new Contract(poolAddress, IUniswapV3PoolABI.abi)

  const calls: any[] = []

  for (const index of tickIndices) {
    calls.push(poolContract.ticks(index))
  }

  const results = await multicallProvider.all(calls)
  const allTicks: Tick[] = []

  for (let i = 0; i < tickIndices.length; i++) {
    const index = tickIndices[i]
    const ethersResponse = results[i]
    const tick = new Tick({
      index,
      liquidityGross: JSBI.BigInt(ethersResponse.liquidityGross.toString()),
      liquidityNet: JSBI.BigInt(ethersResponse.liquidityNet.toString()),
    })
    allTicks.push(tick)
  }
  return allTicks
}

//CONFIG
enum Environment {
    LOCAL, MAINNET
}

const Token0 = new Token(
  ChainId.ARBITRUM_ONE,
  args[0],
  parseInt(args[1]),
)

const Token1 = new Token(
  ChainId.ARBITRUM_ONE,
  args[2],
  parseInt(args[3]),
)

const CurrentConfig: ExampleConfig = {
    env: Environment.MAINNET,
    rpc: {
        local: 'http://localhost:8545',
        mainnet: 'https://arb-mainnet.g.alchemy.com/v2/3WhueUwa7bL_DVIq2P7vsGS-bmu5VeqC',
    },
    pool: {
        Token0: Token0,
        Token1: Token1,
        fee: FeeAmount.LOW
    }
}

//PROVIDER
const mainnetProvider = new ethers.providers.JsonRpcProvider(
  CurrentConfig.rpc.mainnet
)

const localProvider = new ethers.providers.JsonRpcProvider(
  CurrentConfig.rpc.local
)

function getProvider(): providers.Provider {
  return CurrentConfig.env === Environment.LOCAL
    ? localProvider
    : mainnetProvider
}

//INTERFACES
interface ExampleConfig {
    env: Environment,
    rpc: {
        local: string,
        mainnet: string
    },
    pool: {
        Token0: Token,
        Token1: Token,
        fee: FeeAmount
    }
}
interface PoolData {
  address: string
  tokenA: Token
  tokenB: Token
  fee: FeeAmount
  sqrtPriceX96: JSBI
  liquidity: JSBI
  tick: number
  tickSpacing: number
}

//SEX
function priceToSqrtp(price: number): number {
    return Math.sqrt(price);
}

function liquidity0(amount: JSBI, pa: JSBI, pb: JSBI): JSBI {
    if (JSBI.greaterThan(pa, pb)) {
        [pa, pb] = [pb, pa];
    }
    const q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
    return JSBI.divide(JSBI.multiply(amount, JSBI.multiply(pa, pb)), q96);
}


function liquidity1(amount: JSBI, pa: JSBI, pb: JSBI): JSBI {
    if (JSBI.greaterThan(pa, pb)) {
        [pa, pb] = [pb, pa];
    }
    const q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
    return JSBI.divide(JSBI.multiply(amount, q96), JSBI.subtract(pb, pa));
}


function calc_amount0(liq: JSBI, pa: JSBI, pb: JSBI): JSBI {
    if (JSBI.equal(pa, pb)) {
        throw new Error("Pa and pb are equal, cannot calculate amount");
    }
    const q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
    return JSBI.divide(JSBI.multiply(liq, q96), JSBI.multiply(JSBI.subtract(pb, pa), JSBI.divide(pa, pb)));
}

function calc_amount1(liq: JSBI, pa: JSBI, pb: JSBI): JSBI {
    if (JSBI.equal(pa, pb)) {
        throw new Error("Pa and pb are equal, cannot calculate amount");
    }
    const q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
    return JSBI.divide(JSBI.multiply(liq, JSBI.subtract(pb, pa)), q96);
}



main()