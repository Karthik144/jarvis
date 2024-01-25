import { Token} from "@uniswap/sdk-core"
import { FeeAmount } from "@uniswap/v3-sdk"
import { Token0, Token1 } from "./entry"

//CONFIG
export enum Environment {
    LOCAL, MAINNET
}

export const CurrentConfig: ExampleConfig = {
    env: Environment.MAINNET,
    rpc: {
        local: 'http://localhost:8545',
        mainnet: 'https://arb-mainnet.g.alchemy.com/v2/3WhueUwa7bL_DVIq2P7vsGS-bmu5VeqC',
    },
    pool: {
        Token0: Token0,
        Token1: Token1,
        fee: FeeAmount.LOW
    }
}

//INTERFACES
export interface ExampleConfig {
    env: Environment,
    rpc: {
        local: string,
        mainnet: string
    },
    pool: {
        Token0: Token,
        Token1: Token,
        fee: FeeAmount
    }
}