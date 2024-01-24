import { Token, ChainId, Ether} from "@uniswap/sdk-core"

export const ETH = Ether.onChain(ChainId.ARBITRUM_ONE)

export const Token0 = new Token(
    ChainId.ARBITRUM_ONE,
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    18,
    'WETH', //optional 
    'Wrapped Ether', //optional
)

export const Token1 = new Token(
    ChainId.ARBITRUM_ONE,
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    6,
    'USDC', //optional 
    'USD//C', //optional
)