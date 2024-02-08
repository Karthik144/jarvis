//REFS:
//  -https://deliverypdf.ssrn.com/delivery.php?ID=198103020022127072088108000070071122042048077048056085078022014029082017117122082105061019106057060060051027095099077067116026023021012013031101071121002118115000110030021049123010088097076017126079122070085099012103085082000077118119082005087070011126&EXT=pdf&INDEX=TRUE
//  -https://deliverypdf.ssrn.com/delivery.php?ID=285088095002029121083070064076101091033020039072045089028085122023101114077117086075049063097015112023016027078096012094089124111059011078059081088088006123117025015024093047094069089007010018111110109028088015086068088084118112120116116105126030097106&EXT=pdf&INDEX=TRUE#page15
//NOTE: Lower first hex value in addr is token0
//SUBGRAPH: https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-arbitrum

//TEMP VERSION
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import axios from "axios";
//import { ethers, providers } from 'ethers'
//import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { Response } from "express";
require('dotenv').config()

//0x912CE59144191C1204E64559FE8253a0e49E6548 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
export async function predict_LP(LP_dict: any) {
    console.log("predict_LP called")
    let result = {
        "lower_band": 0,
        "upper_band": 0,
        "token0_amt": 0,
        "token1_amt": 0
    }
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

    console.log(poolAddress)

    //GET 100D HISTORICAL PRICES
    const prices_endpoint = `https://api.geckoterminal.com/api/v2/networks/${LP_dict.chain}/pools/${poolAddress}/ohlcv/day`
    const response = await axios.get(prices_endpoint) 
    
    const ohlcv: number[][] = response.data.data.attributes.ohlcv_list

    const close_prices: number[] = ohlcv.map(entry => entry[1])
    const sortedClosePrices: number[] = close_prices.slice().sort((a, b) => a - b);

    const maxPrice: number = sortedClosePrices[sortedClosePrices.length - 1]
    const q1: number = calculatePercentile(sortedClosePrices, 25);

    // console.log(`Lower Band: ${q1}`);
    // console.log(`Upper Band: ${maxPrice}`);

    function calculatePercentile(data: number[], percentile: number): number {
        const index = Math.ceil((percentile / 100) * data.length) - 1;
        return data[index];
    }

    //Calculate deposit amounts
    const poolPrices_endpoint = `https://api.geckoterminal.com/api/v2/networks/${LP_dict.chain}/pools/${poolAddress}`
    const response2 = await axios.get(poolPrices_endpoint)

    const priceUSDX = Number(response2.data.data.attributes.base_token_price_usd)
    const priceUSDY = Number(response2.data.data.attributes.quote_token_price_usd)
    const P = Number(response2.data.data.attributes.base_token_price_quote_token * priceUSDY) // convert from quote-units to price

    const Pl = q1
    const Pu = maxPrice



    const deltaL = LP_dict.depositAmt / ((Math.sqrt(P) - Math.sqrt(Pl)) * priceUSDY + (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu)) * priceUSDX)
    const deltaY = deltaL * (Math.sqrt(P) - Math.sqrt(Pl))
    const deltaX = deltaL * (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu))

    // console.log(`USDC amt.: ${deltaY}`) // USDC - token0
    // console.log(`WETH amt.: ${deltaX}`) // ETH - token1

    //Estimate Fees
    const volume_24h_avg = ohlcv.slice(1, 8).map(entry => entry[5]).reduce((accumulator,  currentValue) => accumulator + currentValue, 0) / 7
    //const usd_fees = await predict_Fees(poolAddress, volume_24h_avg, deltaL, Pl, Pu);    
    result['lower_band'] = q1
    result['upper_band'] = maxPrice
    result['token0_amt'] = deltaX
    result['token1_amt'] = deltaY

    console.log(result)

    return result;
}

// async function predict_Fees(contract_addr, volume_24h_avg, deltaL, pl, pu) {
//     //deltaL: Our share of the liquidity
//     //estimated_fee = ((deltaL / (deltaL + L) * (volume_24h_avg * fee)

//     const provider = new ethers.providers.JsonRpcProvider(process.env.RPCURL);
//     const pool_contract = new ethers.Contract(contract_addr, IUniswapV3PoolABI.abi, provider)

   

//     return deltaL;
// }

// //ETH token0 is higher address, ARB token0 is lower address
// const example_object = {
//     chain: 'arbitrum',
//     chainId: 42161,
//     token0: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', //WETH
//     token1: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', //USDC
//     feeTier: 500,
//     depositAmt: 1000,
// }
// const result = predict_LP(example_object)
// console.log(result)