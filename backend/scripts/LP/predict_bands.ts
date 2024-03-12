//NEED TO MAKE NEW MODEL
//MODEL: 
// 1. Sort prices ascending
// 2. S0 = 60D Price Avg; T = 60; sigma = defillama volatility
// 3. band width from curr price = S0 * sigma
// 4. add band width from S0
// 5. subtract 1/5th a std dev. of band width from S0

// determining bands as a function of historical prices, volatility, and time of position(60D)

//Data we have from defillama:
//  Mu(amt of liquidity in pool being used), ild7 - ilrisk, sigma, outlier(overperformer?), difference(between this pool and average pool), 
export async function predict_bands(historical_prices: number[], sigma: number) {
    const T = historical_prices.length
    const S0 = historical_prices.reduce((acc, val) => acc + val, 0) / T
    const band_deviation = S0 * sigma 
    const upper_band = S0 + band_deviation
    const lower_band = S0 - (band_deviation * .2)
    return { upper_band, lower_band }
}


// const test_prices = [
//     2345.24152, 2584.80454, 2619.57851, 2521.92813,
//     2577.53263,  2471.8254,  2510.2312, 2587.15248,
//     2528.69353,  2467.3385, 2489.20889, 2468.98109,
//     2454.61222, 2310.51408, 2240.75691, 2232.63133,
//     2217.27303,  2267.2633, 2267.35461, 2257.27229,
//     2316.65044, 2344.24198, 2282.94911, 2303.09782,
//     2307.20404,  2294.5682, 2289.50636, 2297.96863,
//     2372.11923, 2424.08115, 2420.97998, 2487.92163,
//     2500.89515, 2507.02834, 2658.59508, 2641.70333,
//     2777.71271, 2824.05202, 2804.58399, 2786.75397,
//     2879.90563, 2943.84106, 3014.25698, 2968.91041,
//     2969.72725, 2922.42259, 2991.88389, 3111.29478,
//     3178.84003, 3243.80436, 3386.00141, 3343.02476,
//     3436.28892, 3422.52666, 3490.35964, 3631.44492,
//     3557.88476, 3820.12599, 3874.54654, 3894.03266
// ]

// const {upper_band, lower_band} = predict_bands(test_prices)
// console.log(upper_band, lower_band)