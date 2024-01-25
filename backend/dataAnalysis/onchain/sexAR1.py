import requests
import pandas as pd
from statsmodels.tsa.arima_model import ARIMA

# Fetch historical prices from DeFiLlama
def get_historical_prices(pair):
    url = f"https://api.llama.fi/protocol/{pair}/historical?date=2021-01-01"
    response = requests.get(url)
    data = response.json()
    df = pd.DataFrame(data['data'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    df.set_index('timestamp', inplace=True)
    df = df.resample('D').last().dropna()
    return df['priceUsd']

# Calculate daily returns
def calculate_returns(prices):
    returns = prices.pct_change()
    return returns

# Implement AR(1) model
def ar1_model(returns):
    model = ARIMA(returns, lags=1)
    model_fit = model.fit()
    return model_fit

# Main function
def main():
    pair = "ethereum-usd" # replace with your pair
    prices = get_historical_prices(pair)
    returns = calculate_returns(prices)
    model_fit = ar1_model(returns)

    print(model_fit)

if __name__ == "__main__":
    main()
