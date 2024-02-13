import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nibfafwhlabdjvkzpvuv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU";

const supabase = createClient(supabaseUrl, supabaseKey);

// TO-DO: 

// 1. Check if there are other endpoints where we can query data based on network 
// 4. Schedule the edge function 


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
}

// SOURCE: https://www.coingecko.com/en/categories/meme-token
const memeTokens = ['DOGE', 'SHIB', 'BONK', 'CORGIAI', 'PEPE', 'WIF', 'FLOKI', 'MEME', 'BABYDOGE', 'TRUMP', 'COQ', 'PORK', 'ELON', 'SNEK', '$WEN', '$MYRO', 'TOSHI', 'LADYS', 'MOG', 'SAMO', 'WELSH', 'DOG', 'SILLY', 'MOCHI', 'JESUS', 'AIDOGE', 'LEASH', 'KISHU', 'TSUKA', 'OPTI', 'VOLT', 'TURBO', 'WOJAK', 'KIZUNA', 'HUAHUA', 'OMNI', 'BOB', 'SHIA', 'WSM', 'QOM', 'BAD', 'PONKE', 'SNAIL', 'CATE', 'KITTY', 'NPC', 'VINU', 'ANALOS', 'KIMBO', 'BAN', 'HOGE', 'CATGIRL', 'SQUIDGROW', 'POPCAT', 'TAMA', 'POLYDOGE', 'DINO', 'HUSKY', 'PIKA', 'LOAF', 'NFD', 'HIPP', 'DOBO', 'CUMMIES', 'JOE', 'AI', 'DOGEGF', 'ZOOMER', 'SCB', 'MILK', 'EGG', 'KIBA', 'KIBSHI', 'PEPE', 'PSPS', 'CINU', 'TYRANT', 'NOCHILL', 'SMI', 'DACAT', 'PEPES', 'EDOGE', 'FOUR', 'KUMA', 'MONSTA', '4TOKEN', 'SHIBX', 'GOLDEN', 'OKY', '$CRAMER', 'GARBAGE', '$SHARBI', 'RISITA', 'ELMO', 'OGGY', 'DINGO', 'SHIH', 'CAT'];

async function main(){
    const filteredTokens = await filterTopTokens(); 
    
    await updateData(filteredTokens); 
}

async function updateData(tokens: Token[]) {
    try {

        for (const token of tokens){

            const record = {
                symbol: token.symbol, 
                data: token 
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
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false&price_change_percentage=30d&locale=en&precision=full`);
        const tokens = response.data;
        return tokens; 
    } catch (error) {
        console.log("Error getting top tokens:", error); 
    }

}

// Filter top tokens based on % change in 30d price 
// Note: Need to get volume data for tokens as well 
async function filterTopTokens() {
    try {
        const topTokens = await getTopTokens();
        
        // Sort tokens from lowest to highest 30 day price change 
        const sortedTokens = topTokens.sort((a: Token, b: Token) => a.price_change_percentage_30d_in_currency - b.price_change_percentage_30d_in_currency);

        const twentyFifthPercentileIndex = Math.floor(sortedTokens.length * 0.25);
        const seventyFifthPercentileIndex = Math.floor(sortedTokens.length * 0.75);

        // Filter out the top 25th and bottom 25th percentiles
        const filteredTokens = sortedTokens.slice(twentyFifthPercentileIndex, seventyFifthPercentileIndex);
        
        // Filter out top scam tokens 
        const filteredFromScamTokens = removeScamTokens(filteredTokens); 

        return filteredFromScamTokens;

    } catch (error) {
        console.error("Error filtering top tokens:", error);
        throw error; 
    }
}

function removeScamTokens(tokens: Token[]): Token[] {
    // Filter out tokens whose symbols are in the memeTokens list
    return tokens.filter(token => !memeTokens.includes(token.symbol.toUpperCase()));
}

main(); 

