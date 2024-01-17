import * as React from "react";
import Typography from "@mui/material/Typography";

export default function Response(){

    return (
      <div className="flex min-h-screen flex-col items-center justify-between p-24">
        <Typography
          variant="h4"
          sx={{ textAlign: "left", pt: "100px", marginLeft: "50px" }}
        >
          RSI Analysis on Bitcoin
        </Typography>

        <div className="pt-12">
          <Typography
            variant="h5"
            sx={{ textAlign: "left", marginLeft: "50px", fontWeight: "300" }}
          >
            Answer
          </Typography>

          <Typography
            variant="body1"
            sx={{ textAlign: "left", marginLeft: "50px" }}
          >
            The Relative Strength Index (RSI) is a popular technical analysis
            tool used in crypto trading to assess whether a market is overbought
            or oversold. It measures the momentum of price changes and
            oscillates between 0 and 100. A value above 70 indicates overbought
            conditions, while a value below 30 indicates oversold conditions.
            Traders use the RSI to identify potential entry and exit points for
            their trades. While the RSI can be a reliable tool for crypto
            investors and traders, it's important to use it in conjunction with
            other indicators and not rely solely on it for trading decisions
          </Typography>
        </div>
      </div>
    );
}