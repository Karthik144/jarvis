//REFS:
//  -https://deliverypdf.ssrn.com/delivery.php?ID=198103020022127072088108000070071122042048077048056085078022014029082017117122082105061019106057060060051027095099077067116026023021012013031101071121002118115000110030021049123010088097076017126079122070085099012103085082000077118119082005087070011126&EXT=pdf&INDEX=TRUE
//  -https://deliverypdf.ssrn.com/delivery.php?ID=285088095002029121083070064076101091033020039072045089028085122023101114077117086075049063097015112023016027078096012094089124111059011078059081088088006123117025015024093047094069089007010018111110109028088015086068088084118112120116116105126030097106&EXT=pdf&INDEX=TRUE#page15


//TEMP VERSION
import { ChainId, Token } from "@uniswap/sdk-core";
import { Pool, FeeAmount } from "@uniswap/v3-sdk";
import axios from "axios";
import { response } from "express";

//0x912CE59144191C1204E64559FE8253a0e49E6548 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
async function predict_LP(LP_dict: any) {
    const endpoint = `https://api.geckoterminal.com/api/v2/networks/${LP_dict.chain}/tokens/`

    const token0_addr = LP_dict.token0
    const token1_addr = LP_dict.token1
   
    const response0 = await axios.get(endpoint + token0_addr)
    const response1 = await axios.get(endpoint + token1_addr)

    const token0_decimals = response0.data.data.attributes.decimals
    const token1_decimals = response1.data.data.attributes.decimals
   
    const token0 = new Token(LP_dict.chainId, token0_addr, token0_decimals)
    const token1 = new Token(LP_dict.chainId, token1_addr, token1_decimals)
    const poolAddress = Pool.getAddress(
        token0, token1, LP_dict.feeTier
    )

    console.log(poolAddress);

    //GET 100D HISTORICAL PRICES
    const prices_endpoint = `https://api.geckoterminal.com/api/v2/networks/${LP_dict.chain}/pools/${poolAddress}/ohlcv/day`
    const response = await axios.get(prices_endpoint) 
    
    const ohlcv: number[][] = response.data.data.attributes.ohlcv_list

    const close_prices: number[] = ohlcv.map(entry => entry[1])
    const sortedClosePrices: number[] = close_prices.slice().sort((a, b) => a - b);

    const minPrice: number = sortedClosePrices[0];
    const maxPrice: number = sortedClosePrices[sortedClosePrices.length - 1]
    const q1: number = calculatePercentile(sortedClosePrices, 25);
    const q3: number = calculatePercentile(sortedClosePrices, 75);

    console.log(`Minimum Price: ${minPrice}`);
    console.log(`Maximum Price: ${maxPrice}`);
    console.log(`25th Quartile (Q1): ${q1}`);
    console.log(`75th Quartile (Q3): ${q3}`);

    function calculatePercentile(data: number[], percentile: number): number {
        const index = Math.ceil((percentile / 100) * data.length) - 1;
        return data[index];
    }

    //Calculate deposit amounts
    const poolPrices_endpoint = `https://api.geckoterminal.com/api/v2/networks/${LP_dict.chain}/pools/${poolAddress}`
    const response2 = await axios.get(poolPrices_endpoint)

    const P = Number(response2.data.data.attributes.base_token_price_quote_token)
    const Pl = q1
    const Pu = maxPrice
    const priceUSDX = Number(response2.data.data.attributes.base_token_price_usd)
    const priceUSDY = Number(response2.data.data.attributes.quote_token_price_usd)


    const deltaL = LP_dict.depositAmt / ((Math.sqrt(P) - Math.sqrt(Pl)) * priceUSDY + (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu)) * priceUSDX)
    const deltaY = deltaL * (Math.sqrt(P) - Math.sqrt(Pl))
    const deltaX = deltaL * (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu))

    console.log(deltaY) // WETH - token0
    console.log(deltaX) // USDC - token1

    //Estimate Fees
    
}
const example_object = {
    chain: 'eth',
    chainId: 1,
    token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    feeTier: 500,
    depositAmt: 1000,
}
predict_LP(example_object)