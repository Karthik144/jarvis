import axios from "axios";


async function getAllFilteredPools() {
    const response = await axios.get(`https://yields.llama.fi/pools`); 

    const pools = response.data; 

    // Filter only pools with chain 'Ethereum', project 'uniswap-v3', stablecoin false
    let filteredPools = pools.filter(pool => pool.chain.toLowerCase() === 'ethereum' && pool.project.toLowerCase() === 'uniswap-v3' && pool.stablecoin === false);

    // Sort in decending order (highest volume 7d to lowest volume 7d)
    filteredPools.sort((a, b) => {
        // If both values are not null, sort normally
        if (a.volumeUsd7d !== null && b.volumeUsd7d !== null) {
            return b.volumeUsd7d - a.volumeUsd7d;
        }

        // If a's volumeUsd7d is null, it should come after b
        if (a.volumeUsd7d === null) {
            return 1; 
        }

        // If b's volumeUsd7d is null, it should come after a
        if (b.volumeUsd7d === null) {
            return -1; 
        }

        // If both are null, keep their order unchanged (stable sort)
        return 0;
    });    

    // Find correlation between the two assets over a period of time 

}

async function calcCorrelation(tokenOne, tokenTwo){

    const formattedTokenOne = `ethereum:${tokenOne}`;
    const formattedTokenTwo = `ethereum:${tokenTwo}`;
    const combinedFormattedTokens = `${formattedTokenOne},${formattedTokenTwo}`;

    const currentDate = new Date();
    const oneWeekAgoTimestamp = currentDate.getTime() - (7 * 24 * 60 * 60 * 1000); // End period

    const response = await axios.get(`https://coins.llama.fi/percentage/${combinedFormattedTokens}?timestamp=${oneWeekAgoTimestamp}&lookForward=false&period=3w`);
    const percentageChanges = response.data.coins; 

    if (percentageChanges.length > 0){
        const tokenOnePercentChange = percentageChanges.formattedTokenOne; 
        const tokenTwoPercentChange = percentageChanges.formattedTokenTwo;
        
        if (tokenOnePercentChange && tokenTwoPercentChange) {
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

            for (let i = 0; i < tokenOnePercentChange.length; i++) {
                const x = tokenOnePercentChange[i];
                const y = tokenTwoPercentChange[i];

                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumX2 += x * x;
                sumY2 += y * y;
            }

            const n = tokenOnePercentChange.length;
            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

            const correlationCoefficient = numerator / denominator;
            return correlationCoefficient;
        }
    }
}