import axios from "axios";
import { Pool as UniswapPool, FeeAmount as UniswapFeeAmount, FeeAmount } from '@uniswap/v3-sdk'
import {Token as UniswapToken, ChainId} from '@uniswap/sdk-core'
import { filter, number } from "mathjs";
import { predict_bands } from "./predict_bands";
import { getPoolPrices } from "./get_pool_prices";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nibfafwhlabdjvkzpvuv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU";

const supabase = createClient(supabaseUrl, supabaseKey);

//GOAL: have a 3-column database of pools -> pool_address, pool_data, pool_prices
//Given pool_data. Need to construct pool_address.

//Gets pool-data + liquidity_bands on ETHEREUM ONLY
async function main() {
    const yield_list = await getAllFilteredPools();
    const filtered_yield_list = yield_list.filter(item => item.ratio !== null && !item.symbol?.includes('USDC') && !item.symbol?.includes('USDT') && !memeTokens.some(token => item.symbol?.includes(token)))
    for (let i = 0; i < filtered_yield_list.length; i++){
        const pool_address = filtered_yield_list[i].pool_address
        const pool_prices = await getPoolPrices(60, [pool_address])//60Days
        const { upper_band, lower_band } = await predict_bands(pool_prices[pool_address], filtered_yield_list[i].sigma)
        filtered_yield_list[i]['liquidity_band'] = {upper_band, lower_band};
    }
    // console.log(filtered_yield_list);
    await update_supabase(filtered_yield_list)
}


//Global Constants
const memeTokens = ['DOGE', 'SHIB', 'BONK', 'CORGIAI', 'PEPE', 'WIF', 'FLOKI', 'MEME', 'BABYDOGE', 'TRUMP', 'COQ', 'PORK', 'ELON', 'SNEK', '$WEN', '$MYRO', 'TOSHI', 'LADYS', 'MOG', 'SAMO', 'WELSH', 'DOG', 'SILLY', 'MOCHI', 'JESUS', 'AIDOGE', 'LEASH', 'KISHU', 'TSUKA', 'OPTI', 'VOLT', 'TURBO', 'WOJAK', 'KIZUNA', 'HUAHUA', 'OMNI', 'BOB', 'SHIA', 'WSM', 'QOM', 'BAD', 'PONKE', 'SNAIL', 'CATE', 'KITTY', 'NPC', 'VINU', 'ANALOS', 'KIMBO', 'BAN', 'HOGE', 'CATGIRL', 'SQUIDGROW', 'POPCAT', 'TAMA', 'POLYDOGE', 'DINO', 'HUSKY', 'PIKA', 'LOAF', 'NFD', 'HIPP', 'DOBO', 'CUMMIES', 'JOE', 'AI', 'DOGEGF', 'ZOOMER', 'SCB', 'MILK', 'EGG', 'KIBA', 'KIBSHI', 'PEPE', 'PSPS', 'CINU', 'TYRANT', 'NOCHILL', 'SMI', 'DACAT', 'PEPES', 'EDOGE', 'FOUR', 'KUMA', 'MONSTA', '4TOKEN', 'SHIBX', 'GOLDEN', 'OKY', '$CRAMER', 'GARBAGE', '$SHARBI', 'RISITA', 'ELMO', 'OGGY', 'DINGO', 'SHIH', 'CAT'];

const uniswap_fee_map = {
    '1%': FeeAmount.HIGH,
    '0.3%': FeeAmount.MEDIUM,
    '0.05%': FeeAmount.LOW,
    '0.01%': FeeAmount.LOWEST
}

interface Liquidity_Band {
    upper_band: number,
    lower_band: number
}

interface Pool {
    chain: string;
    project: string;
    stablecoin: boolean;
    underlyingTokens?: string[];
    volumeUsd7d: number | null;
    ratio?: number | string | null;  
    difference?: number | null;      
    poolMeta: string;
    symbol?: string;
    pool_address: string;
    liquidity_band: Liquidity_Band
    sigma: number
}

interface CoinData{
    decimals: number
}



async function getAllFilteredPools() {
    const response = await axios.get(`https://yields.llama.fi/pools`);
    const pools: Pool[] = response.data.data;

    let filteredPools = pools.filter(pool => pool.chain.toLowerCase() === 'ethereum' && pool.project.toLowerCase() === 'uniswap-v3' && !pool.stablecoin && pool.poolMeta !== null);

    // Sort the pools by their 7-day USD volume in descending order
    filteredPools.sort((a: Pool, b: Pool) => {
        if (a.volumeUsd7d !== null && b.volumeUsd7d !== null) return b.volumeUsd7d - a.volumeUsd7d;
        if (a.volumeUsd7d === null) return 1;
        if (b.volumeUsd7d === null) return -1;
        return 0;
    });

    // Take the top 50 pools based on their volume, or all pools if there are fewer than 50
    const topPools = filteredPools.slice(0, Math.min(50, filteredPools.length));

    const chunkSize = 10;
    const updatedPools: Pool[] = [];

    // Process the top pools in chunks
    for (let i = 0; i < topPools.length; i += chunkSize) {
        const chunk = topPools.slice(i, i + chunkSize);
        const processedChunk = await processChunk(chunk);
        updatedPools.push(...processedChunk);
    }

    // Sort the updated pools based on how close their ratio is to 1
    updatedPools.sort((a, b) => {
        const diffA = typeof a.ratio === 'number' ? Math.abs(1 - a.ratio) : Number.MAX_VALUE;
        const diffB = typeof b.ratio === 'number' ? Math.abs(1 - b.ratio) : Number.MAX_VALUE;
        return diffA - diffB;
    });



    // console.log(updatedPools);
    return updatedPools;
}


async function processChunk(chunk: Pool[]): Promise<Pool[]> {
    const comparisonPromises = chunk.map(async (pool) => {
        if (pool.underlyingTokens && pool.underlyingTokens.length === 2) {
            const { ratio, difference } = await calcComparison(pool.underlyingTokens[0], pool.underlyingTokens[1]);
            //inject pool-address into Pool
            const decimals = await axios.get(`https://coins.llama.fi/prices/current/ethereum:${pool.underlyingTokens[0]},ethereum:${pool.underlyingTokens[1]}`)
            const { coins } = decimals.data;
            let pool_address: string;
            if (Object.keys(coins).length == 2) {
                const { decimals: decimals1 } = coins[`ethereum:${pool.underlyingTokens[0]}`] as CoinData;
                const { decimals: decimals2 } = coins[`ethereum:${pool.underlyingTokens[1]}`] as CoinData;
                const Token0 = new UniswapToken(ChainId.MAINNET, pool.underlyingTokens[0], decimals1)
                const Token1 = new UniswapToken(ChainId.MAINNET, pool.underlyingTokens[1], decimals2)
                pool_address = UniswapPool.getAddress(Token0, Token1, uniswap_fee_map[pool.poolMeta as keyof typeof uniswap_fee_map])
            }
            else {
                pool_address = ""
            }
            
            return { ...pool, difference, ratio, pool_address};
        } else {
            return { ...pool, difference: null, ratio: null };
        }
    });

    return Promise.all(comparisonPromises);
}

// Returns ratio of tokenOne over tokenTwo percent change 
async function calcComparison(tokenOne: string, tokenTwo: string): Promise<{ ratio: number | null, difference: number | null }> {
    // console.log("CALC COMPARISON CALLED"); 
    const formattedTokenOne = `ethereum:${tokenOne}`;
    const formattedTokenTwo = `ethereum:${tokenTwo}`;
    const combinedFormattedTokens = `${formattedTokenOne},${formattedTokenTwo}`;

    const defaultResult = { difference: null, ratio: null };

    const currentDate = new Date();
    const oneWeekAgoTimestamp = currentDate.getTime() - (7 * 24 * 60 * 60 * 1000); // End period

    const response = await axios.get(`https://coins.llama.fi/percentage/${combinedFormattedTokens}?&lookForward=false&period=3w`);
    const percentageChanges = response.data.coins; 
    // console.log("result:", percentageChanges); 

    if (percentageChanges) {
        // console.log("FORMATTED TOKEN ONE:", formattedTokenOne);
        // console.log("FORMATTED TOKEN TWO:", formattedTokenTwo); 
        const tokenOnePercentChange: number = percentageChanges[formattedTokenOne]; // Use bracket notation
        // console.log("PERCENT CHANGE ONE:", tokenOnePercentChange); 
        const tokenTwoPercentChange: number = percentageChanges[formattedTokenTwo]; // Use bracket notation
        // console.log("PERCENT CHANGE TWO:", tokenTwoPercentChange);

        if (typeof tokenOnePercentChange === 'number' && typeof tokenTwoPercentChange === 'number') {
            
            // Calculate the difference in performance
            const difference = tokenOnePercentChange - tokenTwoPercentChange;

            // Calculate the ratio of changes
            const ratio = tokenTwoPercentChange !== 0 ? tokenOnePercentChange / tokenTwoPercentChange : null;

            // console.log("Difference:", difference); 
            // console.log("Ratio:", ratio); 

            return { difference, ratio };
        }
    }

    return defaultResult;
}

async function update_supabase(processed_pools: Pool[]) {
    for (const pool of processed_pools) {
        const { pool_address, liquidity_band, ...poolData } = pool;
        const poolBands = { upper_band: liquidity_band.upper_band, lower_band: liquidity_band.lower_band };
        const { data, error } = await supabase
            .from('yield-list')
            .upsert({
                pool_address,
                pool_bands: poolBands,
                pool_data: poolData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'pool_address' });

        if (error) {
            console.error('Error upserting pool:', error.message);
        } else {
            console.log('Pool upserted successfully:', data);
        }
    }
}


main()


// calcComparison('0xae78736cd615f374d3085123a210448e74fc6393', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
// 0xae78736cd615f374d3085123a210448e74fc6393
// 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
