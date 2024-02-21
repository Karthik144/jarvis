import axios from "axios";


interface Pool {
    chain: string;
    project: string;
    stablecoin: boolean;
    underlyingTokens?: string[];
    volumeUsd7d: number | null;
    ratio?: number | string | null;  
    difference?: number | null;      
}

async function getAllFilteredPools() {
    const response = await axios.get(`https://yields.llama.fi/pools`);
    const pools: Pool[] = response.data.data;

    let filteredPools = pools.filter(pool => pool.chain.toLowerCase() === 'ethereum' && pool.project.toLowerCase() === 'uniswap-v3' && !pool.stablecoin);

    filteredPools.sort((a: Pool, b: Pool) => {
        if (a.volumeUsd7d !== null && b.volumeUsd7d !== null) return b.volumeUsd7d - a.volumeUsd7d;
        if (a.volumeUsd7d === null) return 1;
        if (b.volumeUsd7d === null) return -1;
        return 0;
    });

    const cutoffIndex = Math.ceil(filteredPools.length * 0.75);
    const top75PercentPools = filteredPools.slice(0, cutoffIndex);

    const chunkSize = 10; 
    const updatedPools: Pool[] = [];

    for (let i = 0; i < top75PercentPools.length; i += chunkSize) {
        const chunk = top75PercentPools.slice(i, i + chunkSize);
        const processedChunk = await processChunk(chunk);
        updatedPools.push(...processedChunk);
    }

    // Sort updatedPools based on how close their ratio is to 1
    // Note: Ratio of close to 1 indicates that percent changes in price over three weeks is relatively same 
    updatedPools.sort((a, b) => {
        // Calculate the absolute difference from 1 for both ratios
        const diffA = typeof a.ratio === 'number' ? Math.abs(1 - a.ratio) : Number.MAX_VALUE;
        const diffB = typeof b.ratio === 'number' ? Math.abs(1 - b.ratio) : Number.MAX_VALUE;

        return diffA - diffB;
    });

    const newCutoffIndex = Math.ceil(updatedPools.length * 0.75);
    const top75PercentUpdatedPools = updatedPools.slice(0, newCutoffIndex);
    console.log(top75PercentUpdatedPools);
    return top75PercentUpdatedPools;
}

async function processChunk(chunk: Pool[]): Promise<Pool[]> {
    const comparisonPromises = chunk.map(async (pool) => {
        if (pool.underlyingTokens && pool.underlyingTokens.length === 2) {
            const { ratio, difference } = await calcComparison(pool.underlyingTokens[0], pool.underlyingTokens[1]);
            return { ...pool, difference, ratio };
        } else {
            return { ...pool, difference: null, ratio: null };
        }
    });

    return Promise.all(comparisonPromises);
}

// Returns ratio of tokenOne over tokenTwo percent change 
async function calcComparison(tokenOne: string, tokenTwo: string): Promise<{ ratio: number | null, difference: number | null }> {
    console.log("CALC COMPARISON CALLED"); 
    const formattedTokenOne = `ethereum:${tokenOne}`;
    const formattedTokenTwo = `ethereum:${tokenTwo}`;
    const combinedFormattedTokens = `${formattedTokenOne},${formattedTokenTwo}`;

    const defaultResult = { difference: null, ratio: null };

    const currentDate = new Date();
    const oneWeekAgoTimestamp = currentDate.getTime() - (7 * 24 * 60 * 60 * 1000); // End period

    const response = await axios.get(`https://coins.llama.fi/percentage/${combinedFormattedTokens}?&lookForward=false&period=3w`);
    const percentageChanges = response.data.coins; 
    console.log("result:", percentageChanges); 

    if (percentageChanges) {
        console.log("FORMATTED TOKEN ONE:", formattedTokenOne);
        console.log("FORMATTED TOKEN TWO:", formattedTokenTwo); 
        const tokenOnePercentChange: number = percentageChanges[formattedTokenOne]; // Use bracket notation
        console.log("PERCENT CHANGE ONE:", tokenOnePercentChange); 
        const tokenTwoPercentChange: number = percentageChanges[formattedTokenTwo]; // Use bracket notation
        console.log("PERCENT CHANGE TWO:", tokenTwoPercentChange);

        if (typeof tokenOnePercentChange === 'number' && typeof tokenTwoPercentChange === 'number') {
            
            // Calculate the difference in performance
            const difference = tokenOnePercentChange - tokenTwoPercentChange;

            // Calculate the ratio of changes
            const ratio = tokenTwoPercentChange !== 0 ? tokenOnePercentChange / tokenTwoPercentChange : null;

            console.log("Difference:", difference); 
            console.log("Ratio:", ratio); 

            return { difference, ratio };
        }
    }

    return defaultResult;
}

getAllFilteredPools(); 

// calcComparison('0xae78736cd615f374d3085123a210448e74fc6393', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
// 0xae78736cd615f374d3085123a210448e74fc6393
// 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2