import axios from "axios";
import { mean, std, sum } from 'mathjs';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nibfafwhlabdjvkzpvuv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU";

const supabase = createClient(supabaseUrl, supabaseKey);

type PriceData = {
    timestamp: number;
    price: number;
};

async function main() {
    // const address = "0xf97f4df75117a78c1a5a0dbb814af92458539fb4"; // LINK addy on arbitrum for testing 
    const addresses = await fetchWatchlistAddresses(); 

    if (!addresses) {
        console.error('Failed to fetch addresses from watchlist.');
        return; 
    }   

    for (let i = 0; i < addresses.length; i++){
        const rsi = await calcRSI(addresses[i]); 
        const correlation = await calcCorrelation(addresses[i]); 
        await updateValues(addresses[i], rsi, correlation); 
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

// Calculate token correlation with Ethereum 
async function calcCorrelation(address: string): Promise<number> {
    try {
        // Get eth and token data 
        const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; 
        const wethPriceData = await fetch100DayPrices(wethAddress); 
        const tokenPriceData = await fetch100DayPrices(address); 
        
        const wethReturns = calculateDailyReturns(wethPriceData);
        const tokenReturns = calculateDailyReturns(tokenPriceData);
        
        const correlation = calculateCorrelation(tokenReturns, wethReturns);
        return correlation; 
    } catch (error) {
        console.log("Error while calculating correlation:", error); 
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

        return addresses

    } catch (error) {
        console.error('Error fetching addresses from watchlist:', error)
    }
}

async function updateValues(address: string, rsi: number, correlation: number) {
    try {
        const { data, error } = await supabase
            .from('watchlist') 
            .update({ rsi: rsi, correlation: correlation })
            .match({ address: address }); 

        if (error) {
            throw error;
        }

    } catch (error) {
        console.error('Error updating RSI:', error);
        throw error; 
    }
}

async function fetch100DayPrices(address: string): Promise<PriceData[]> {

    // Current Unix timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Calc Unix timestamp for 1 week from today
    const oneWeekInSeconds = 7 * 24 * 60 * 60; 
    const oneWeekFromToday = currentTimestamp - oneWeekInSeconds;

    // Calc Unix timestamp for 100 days from the 1-week timestamp
    const hundredDaysInSeconds = 100 * 24 * 60 * 60; 
    const hundredDaysFromOneWeek = oneWeekFromToday - hundredDaysInSeconds;

    try {
        const response = await axios.get(`https://coins.llama.fi/chart/arbitrum:${address}?start=${hundredDaysFromOneWeek}&span=100&searchWidth=600`);

        const prices = response.data.coins[`arbitrum:${address}`].prices;
        const priceDataArray: PriceData[] = prices.map((item: any) => ({
            timestamp: item.timestamp,
            price: item.price,
        }));

        return priceDataArray;

    } catch (error){
        console.log("Error fetch 100 day price data:", error); 
        throw error; 
    }
}

function calculateDailyReturns(prices: PriceData[]): number[] {
    return prices.slice(1).map((value, index) => (value.price - prices[index].price) / prices[index].price);
}

function calculateCorrelation(x: number[], y: number[]): number {
    const xMean = mean(x);
    const yMean = mean(y);
    const xStd = std(x) as unknown as number;
    const yStd = std(y) as unknown as number;
    const covariance = sum(x.map((val, idx) => (val - xMean) * (y[idx] - yMean))) / x.length;
    return covariance / (xStd * yStd);
}

main(); 

