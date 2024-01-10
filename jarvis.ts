import axios, { AxiosResponse, AxiosError, Axios } from 'axios';
import readline from 'readline';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Prompt the user for input
// rl.question("Hi! I'm Jarvis. I'm your AI crypto research assistant. How can I help you today?\n", (task) => {

//     if (task.includes('market cap')){
//         console.log("Here's a list of tokens with market caps of <10M: ")
//         sortCoins();
//     }
//     rl.close(); 
// });

getCoinMetaData("bitcoin"); 

interface Coin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number | null;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    roi: null; 
    last_updated: string;
}

interface CoinMetaData {
    block_time_in_minutes: number; 
    hashing_algorithm: string; 
    categories: string[];
    description: { en: string };
    links: {
        homepage: string[]; 
        official_forum_url: string[]; 
        chat_url: string[]; 
        announcement_url: string[];
        twitter_screen_name: string; 
        subreddit_url: string; 
        repos_url: {
            github: string[]; 
        }
    }

}


// Query initial list of tokens based on: 
// 1. Market Cap 
// 2. Category 
// 3. Trending 
  
async function fetchAllCoins(){

    try {
        const requestURL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=15&sparkline=false&locale=en';
        const response: AxiosResponse<Coin[]> = await axios.get(requestURL);
        const coins: Coin[] = response.data;

        return coins; 

    } catch (error){
        console.error('Error:', error);
        return []; 
    }
}

async function sortCoins(){

    const coins: Coin[] = await fetchAllCoins();
    if (!coins) return []; // Return an empty array if coins is undefined or null
    var sortedCoins: Coin[] = []; 

    for (var i = 0; i < coins.length; i++){

        // Check market_cap
        var marketCap = coins[i].market_cap; 

        // If it meets specified condition, add all of its data to the sorted array
        if (marketCap <= 10000000){
            sortedCoins.push(coins[i]); 
        }
    }

    console.log(sortedCoins); 
}

async function getCoinMetaData(coinId: string){
    try {
        const requestURL = `https://api.coingecko.com/api/v3/coins/${coinId}?tickers=false&market_data=false&community_data=true&developer_data=false&sparkline=false`;
        const response: AxiosResponse<any> = await axios.get(requestURL);
        const data = response.data;

        const coinMetaData: CoinMetaData = {
            block_time_in_minutes: data.block_time_in_minutes,
            hashing_algorithm: data.hashing_algorithm,
            categories: data.categories,
            description: { en: data.description.en },
            links: {
                homepage: data.links.homepage, 
                official_forum_url: data.links.official_forum_url, 
                chat_url: data.links.chat_url, 
                announcement_url: data.links.announcement_url,
                twitter_screen_name: data.links.twitter_screen_name, 
                subreddit_url: data.links.subreddit_url, 
                repos_url: {
                    // Check if repos_url and repos_url.github exist before accessing them
                    github: data.links.repos_url && data.links.repos_url.github ? data.links.repos_url.github : []
                }
            },

        };

        console.log(coinMetaData); 
        return coinMetaData; 

    } catch (error){
        console.error('Error:', error);
        return []; 
    }
}

// sortCoins();
