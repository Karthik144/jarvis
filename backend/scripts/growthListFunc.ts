import axios from "axios";
import { createClient } from "@supabase/supabase-js";

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
    seven_day_data?: TokenPriceData[]; 
}

interface TokenPriceData {
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
    atl: number;
    atl_change_percentage: number;
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
    const updatedTokens = await updateData(filteredTokens); 
    await clearOldData(); 
    await addNewTokens(updatedTokens);
}

async function updateData(tokens: Token[]): Promise<Token[]> {
    try {
        const symbols = tokens.map(token => token.symbol);

        let { data: existingRecords, error: fetchError } = await supabase
            .from('growth-list')
            .select('symbol, data')  
            .in('symbol', symbols);

        if (fetchError) {
            console.error('Error fetching existing data:', fetchError);
            throw fetchError; 
        }

        tokens.forEach(token => {
            if (!existingRecords) {
                console.error('No existing records found');
                return;
            }
            const existingRecord = existingRecords.find(record => record.symbol === token.symbol);

            if (!existingRecord) {
                console.error(`No existing record found for symbol: ${token.symbol}`);
                const sevenDayDataArray = [];

                const tokenPriceData: TokenPriceData = {
                    current_price: token.current_price, 
                    market_cap: token.market_cap, 
                    market_cap_rank: token.market_cap_rank, 
                    fully_diluted_valuation: token.fully_diluted_valuation, 
                    total_volume: token.total_volume, 
                    high_24h: token.high_24h, 
                    low_24h: token.low_24h, 
                    price_change_24h: token.price_change_24h, 
                    price_change_percentage_24h: token.price_change_percentage_24h, 
                    market_cap_change_24h: token.market_cap_change_24h, 
                    market_cap_change_percentage_24h: token.market_cap_change_percentage_24h, 
                    circulating_supply: token.circulating_supply, 
                    total_supply: token.total_supply, 
                    max_supply: token.max_supply, 
                    ath: token.ath, 
                    ath_change_percentage: token.ath_change_percentage,
                    atl: token.atl, 
                    atl_change_percentage: token.atl_change_percentage, 
                }

                sevenDayDataArray.push(tokenPriceData);
                token.seven_day_data = sevenDayDataArray;
                return; 
            }

            let sevenDayDataArray = existingRecord.data.seven_day_data || [];
            if (sevenDayDataArray.length === 7) {
                sevenDayDataArray.shift();
            }

            const tokenPriceData: TokenPriceData = {
                current_price: token.current_price, 
                market_cap: token.market_cap, 
                market_cap_rank: token.market_cap_rank, 
                fully_diluted_valuation: token.fully_diluted_valuation, 
                total_volume: token.total_volume, 
                high_24h: token.high_24h, 
                low_24h: token.low_24h, 
                price_change_24h: token.price_change_24h, 
                price_change_percentage_24h: token.price_change_percentage_24h, 
                market_cap_change_24h: token.market_cap_change_24h, 
                market_cap_change_percentage_24h: token.market_cap_change_percentage_24h, 
                circulating_supply: token.circulating_supply, 
                total_supply: token.total_supply, 
                max_supply: token.max_supply, 
                ath: token.ath, 
                ath_change_percentage: token.ath_change_percentage,
                atl: token.atl, 
                atl_change_percentage: token.atl_change_percentage, 
            }

            sevenDayDataArray.push(tokenPriceData);
            token.seven_day_data = sevenDayDataArray;
        });

        return tokens;

    } catch (error) {
        console.error("Error updating data:", error);
        throw error;
    }
}

async function addNewTokens(tokens: Token[]) {
   
    try {
        // Transform the tokens array to match the table structure 
        const transformedTokens = tokens.map(token => ({
            symbol: token.symbol,
            data: {  
                // Assuming seven_day_data contains Token objects, create a new array with limited properties
                seven_day_data: token.seven_day_data
            }
        }));

        const { data, error } = await supabase
            .from('growth-list')
            .insert(transformedTokens);

        if (error) {
            console.error("Error adding new tokens to growth list:", error);
            throw error;
        }

    } catch (error) {
        console.error("Error in the addNewTokens function:", error);
    }
}

async function clearOldData() {
    const { error } = await supabase
        .from('growth-list')
        .delete()
        .not('symbol', 'is', null);

    if (error) {
        console.error('Error clearing old data:', error);
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
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/list?include_platform=true`);
        const tokensWithAddress: CoinGeckoToken[] = response.data; 

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


main(); 

