import axios from "axios"
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nibfafwhlabdjvkzpvuv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    // const address = "0xf97f4df75117a78c1a5a0dbb814af92458539fb4"; 
    const addresses = await fetchWatchlistAddresses(); 

    if (!addresses) {
        console.error('Failed to fetch addresses from watchlist.');
        return; 
    }   
    
    for (let i = 0; i < addresses.length; i++){
        const rsi = await calcRSI(addresses[i]); 
        await updateRSI(addresses[i], rsi); 
    }
}

// Calculate RSI 
async function calcRSI(address: string): Promise<number> { 
    try {
        // Get daily data for previous 15 days (since today)
        const currentDate = Math.floor(Date.now() / 1000); // UNIX timestamp in seconds
        const oneDayInSeconds = 24 * 60 * 60;
        const oneDayAgoTimestamp = currentDate - oneDayInSeconds;
        const fourteenDaysAgoTimestamp = oneDayAgoTimestamp - (15 * oneDayInSeconds);

        console.log("Fifteen days ago Unix timestamp: ", fourteenDaysAgoTimestamp);

        const response = await axios.get(`https://coins.llama.fi/chart/arbitrum:${address}?start=${fourteenDaysAgoTimestamp}&span=15&searchWidth=600`);
        const prices = response.data.coins[`arbitrum:${address}`].prices;

        let priceArray = []; 
        let gains = []; 
        let losses = []; 
        let totalGain = 0; 
        let totalLoss = 0; 

        // Extract just prices from price array 
        for (let i = 0; i < prices.length; i++){
            priceArray.push(prices[i].price); 
        }

        // Calculate daily changes (f-i/i)
        for (let i = 0; i < priceArray.length - 1; i++){
            const dailyChange = priceArray[i+1] - priceArray[i];

            if (dailyChange > 0){
                gains.push(dailyChange); 
            } else {
                losses.push(Math.abs(dailyChange));
            }
        }

        // Calculate average gain and average loss 
        totalGain = gains.reduce((acc, gain) => acc + gain, 0);
        totalLoss = losses.reduce((acc, loss) => acc + loss, 0);

        const averageGain = totalGain / (priceArray.length - 1); 
        const averageLoss = totalLoss / (priceArray.length - 1); 
        const RS = averageGain / averageLoss;
        const RSI = 100 - (100 / (1 + RS));

        return RSI; 
    } catch (error) {
        console.error("Error retrieving data to calculate RSI:", error);
        throw error;
    }
}


// HELPER FUNCS
async function fetchWatchlistAddresses() {
    try {
        // Get all addresses from watchlist table 
        const { data, error } = await supabase
            .from('watchlist') 
            .select('address')

        if (error) {
            throw error
        }

        const addresses = data.map(item => item.address)

        console.log(addresses)
        return addresses

    } catch (error) {
        console.error('Error fetching addresses from watchlist:', error)
    }
}

async function updateRSI(address: string, rsi: number) {
    try {
        const { data, error } = await supabase
            .from('watchlist') 
            .update({ rsi: rsi })
            .match({ address: address }); 

        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('Error updating RSI:', error);
        throw error; 
    }
}


main(); 
// Calculate token correlation with Ethereum 

