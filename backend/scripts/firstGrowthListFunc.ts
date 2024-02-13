import axios from "axios";


const supabaseUrl = "https://nibfafwhlabdjvkzpvuv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU";

// const supabase = createClient(supabaseUrl, supabaseKey);

// TO-DO: 

// 1. Check if there are other endpoints where we can query data based on network 
// 2. Remove scam tokens Nick gave us in the X post and just general list from somewhere (but might not be scam tokens cus we're doing top market cap)
// 3. Store result in supabase 
// 4. Schedule the edge function 

interface Token {
    id: string;
    symbol: string;
    name: string;
    price_change_percentage_30d_in_currency: number;
}

async function main(){
    const filteredTokens = await filterTopTokens(); 
    console.log(filteredTokens); 
}

// Get top tokens by market cap
async function getTopTokens(){

    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false&price_change_percentage=30d&locale=en&precision=full`);
        const tokens = response.data;
        console.log("Tokens:", tokens); 
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

        return filteredTokens;
    } catch (error) {
        console.error("Error filtering top tokens:", error);
        throw error; 
    }
}

main(); 

