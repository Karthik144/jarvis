// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import {createClient} from 'npm:@supabase/supabase-js@2.39.3';

const supabaseUrl = "https://nibfafwhlabdjvkzpvuv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU";

const supabase = createClient(supabaseUrl, supabaseKey);

interface Token {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null; 
    ath: number;
    ath_change_percentage: number;
    ath_date: string; 
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    last_updated: string;
    price_change_percentage_30d_in_currency: number;
    ethereum_address?: string; 
    arbitrum_one_address?: string; 
}

interface CoinGeckoToken {
    id: string;
    platforms: {
        [key: string]: string | undefined; 
    };
}

// SOURCE: https://www.coingecko.com/en/categories/meme-token
const memeTokens = ['DOGE', 'SHIB', 'BONK', 'CORGIAI', 'PEPE', 'WIF', 'FLOKI', 'MEME', 'BABYDOGE', 'TRUMP', 'COQ', 'PORK', 'ELON', 'SNEK', '$WEN', '$MYRO', 'TOSHI', 'LADYS', 'MOG', 'SAMO', 'WELSH', 'DOG', 'SILLY', 'MOCHI', 'JESUS', 'AIDOGE', 'LEASH', 'KISHU', 'TSUKA', 'OPTI', 'VOLT', 'TURBO', 'WOJAK', 'KIZUNA', 'HUAHUA', 'OMNI', 'BOB', 'SHIA', 'WSM', 'QOM', 'BAD', 'PONKE', 'SNAIL', 'CATE', 'KITTY', 'NPC', 'VINU', 'ANALOS', 'KIMBO', 'BAN', 'HOGE', 'CATGIRL', 'SQUIDGROW', 'POPCAT', 'TAMA', 'POLYDOGE', 'DINO', 'HUSKY', 'PIKA', 'LOAF', 'NFD', 'HIPP', 'DOBO', 'CUMMIES', 'JOE', 'AI', 'DOGEGF', 'ZOOMER', 'SCB', 'MILK', 'EGG', 'KIBA', 'KIBSHI', 'PEPE', 'PSPS', 'CINU', 'TYRANT', 'NOCHILL', 'SMI', 'DACAT', 'PEPES', 'EDOGE', 'FOUR', 'KUMA', 'MONSTA', '4TOKEN', 'SHIBX', 'GOLDEN', 'OKY', '$CRAMER', 'GARBAGE', '$SHARBI', 'RISITA', 'ELMO', 'OGGY', 'DINGO', 'SHIH', 'CAT'];

async function main(){
    const filteredTokens = await filterTopTokens(); 
    // console.log('LIST:', filteredTokens); 
    await updateData(filteredTokens); 
}

async function updateData(tokens: Token[]) {
    try {

        for (const token of tokens){

            // Fetch the existing record from the 'growth-list' table
            let { data: existingData, error: fetchError } = await supabase
                .from('growth-list')
                .select('data')
                .eq('symbol', token.symbol)
                .single();

            if (fetchError) {
                console.error('Error fetching existing data:', fetchError);
                continue; // Skip this iteration if there's an error 
            }

            let sevenDayDataArray = existingData?.data?.seven_day_data || [];

            // If array has 7 days of data, then it's full so remove the first element 
            if (sevenDayDataArray.length === 7){
                sevenDayDataArray.shift(); // Removes the first element 
            }

            sevenDayDataArray.push(token);

            const updatedData = {
                seven_day_data: sevenDayDataArray
            };

            const record = {
                symbol: token.symbol, 
                data: updatedData 
            };

            // Upsert the record into the growth-list table
            const { data, error } = await supabase
                .from('growth-list')
                .upsert(record);

            if (error) {
                console.error('Error upserting token data:', error);
            } else {
                console.log('Upserted data:', data);
            }

        }

    } catch (error) {
        console.log("Error upserting data to db:", error); 
        throw error; 
    }
}

// Get top tokens by market cap
async function getTopTokens(){

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false&price_change_percentage=30d&locale=en&precision=full`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tokens = await response.json();
        return tokens; 
    } catch (error) {
        console.log("Error getting top tokens:", error); 
    }

}

// Filter top tokens based on % change in 30d price 
// async function filterTopTokens() {
//     try {
//         const topTokens = await getTopTokens();
        
//         // Filter out top scam tokens 
//         const filteredFromScamTokens = removeScamTokens(topTokens); 

//         // const sortedTokens = filteredFromScamTokens.sort((a: Token, b: Token) => a.price_change_percentage_30d_in_currency - b.price_change_percentage_30d_in_currency);

//         // (a.total_volume) / (a.market_cap)

//         // Sort tokens from lowest to highest 30 day price change while giving volume some weightage 
//         const sortedTokens = filteredFromScamTokens.sort((a, b) => {

//             // Calculate weighted metric for comparison
//             const metricA = 0.7 * a.price_change_percentage_30d_in_currency + 0.3 * ((a.total_volume) / (a.market_cap));
//             const metricB = 0.7 * b.price_change_percentage_30d_in_currency + 0.3 * (b.total_volume);

//             return metricA - metricB; 
//         });

//         const twentyFifthPercentileIndex = Math.floor(sortedTokens.length * 0.25);
//         const seventyFifthPercentileIndex = Math.floor(sortedTokens.length * 0.75);

//         // Filter out the top 25th and bottom 25th percentiles
//         const filteredTokens = sortedTokens.slice(twentyFifthPercentileIndex, seventyFifthPercentileIndex);
        
//         // Add in token addresses 
//         const finalListOfTokens = await addTokenAddresses(filteredFromScamTokens); 

//         return finalListOfTokens;

//     } catch (error) {
//         console.error("Error filtering top tokens:", error);
//         throw error; 
//     }
// }

// Filter top tokens based on % change in 30d price 
async function filterTopTokens() {
    try {

        // Get top tokens by market cap in decending order 
        const topTokens = await getTopTokens();
        
        // Filter out top scam tokens 
        const filteredFromScamTokens = removeScamTokens(topTokens);

        // Sort by the ratio of volume to market cap and return in decending order 
        const sortedByVolumeToMarketCap = filteredFromScamTokens.sort((a, b) => {
            const ratioA = a.total_volume / a.market_cap;
            const ratioB = b.total_volume / b.market_cap;
            return ratioA - ratioB; 
        });

        // Then sort by the 30-day price change percentage
        const sortedByPriceChange = sortedByVolumeToMarketCap.sort((a, b) => {
            return b.price_change_percentage_30d_in_currency - a.price_change_percentage_30d_in_currency;
        });

        const twentyFifthPercentileIndex = Math.floor(sortedByPriceChange.length * 0.25);
        const seventyFifthPercentileIndex = Math.floor(sortedByPriceChange.length * 0.75);

        // Filter out the top 25th and bottom 25th percentiles
        const filteredTokens = sortedByPriceChange.slice(twentyFifthPercentileIndex, seventyFifthPercentileIndex);
        
        // Add in token addresses
        const finalListOfTokens = await addTokenAddresses(filteredTokens); 

        return finalListOfTokens;

    } catch (error) {
        console.error("Error filtering top tokens:", error);
        throw error;
    }
}


function removeScamTokens(tokens: Token[]): Token[] {
    // Filter out tokens whose symbols are in the memeTokens list
    return tokens.filter(token => !memeTokens.includes(token.symbol.toUpperCase()));
}

async function addTokenAddresses(tokens: Token[]): Promise<Token[]> {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/list?include_platform=true`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tokensWithAddress: CoinGeckoToken[] = await response.json(); 

        // Map with token id as the key and token platforms as the value 
        const addressMap = new Map<string, CoinGeckoToken['platforms']>(tokensWithAddress.map(token => [token.id, token.platforms]));

        // Iterate over the tokens array, append addresses if found, and filter out tokens without Ethereum or Arbitrum-One addresses
        const updatedTokens = tokens.map(token => {
            const platforms = addressMap.get(token.id);
            if (platforms) {
                // Add Ethereum and Arbitrum-One addresses if they exist
                token.ethereum_address = platforms['ethereum'] || '';
                token.arbitrum_one_address = platforms['arbitrum-one'] || '';
            }
            return token;
        }).filter(token => token.ethereum_address || token.arbitrum_one_address); 
        
        return updatedTokens;

    } catch (error){
        console.log("Error while appending token addresses:", (error)); 
        throw error; 
    }
}

Deno.serve(async (req) => {
    const { time } = await req.json()
    const data = {
        message: `Ran at: ${time}!`,
    }

    await main();
    
    return new Response(
        JSON.stringify(data),
        { headers: { "Content-Type": "application/json" } },
    )
});