import React, { useState, useEffect } from "react";
import WatchlistTable from "../components/watchlist/WatchlistTable.js";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { supabase } from "../../supabaseClient";

export default function Watchlist() {
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState(null);

  // Set current user
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Cleanup function
    return () => {
      if (authListener && typeof authListener.unsubscribe === "function") {
        authListener.unsubscribe();
      }
    };
  }, []);

  // Get users watchlist once
  useEffect(() => {
    if (user) {
      // User is logged in, fetch their profile
      const fetchInvestorProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("watchlist")
            .eq("id", user.id)
            .single();

          if (error) {
            throw error;
          }
          console.log(data.watchlist);
          setWatchlist(data.watchlist);
        } catch (error) {
          console.error("Error fetching investor profile:", error.message);
        }
      };

      fetchInvestorProfile();
    } else {
      setInvestorProfile(null);
    }
  }, [user]);

  async function getCoinData(coinID) {
    try {
      const result = {
        Name: "",
        "Current Price": "",
        "%∆ Price 30d": "",
        "%∆ Price 60d": "",
        "%∆ Price 200d": "",
        Volume: "",
        Category: "",
        "Market Cap": "",
      };
      const url = `https://api.coingecko.com/api/v3/coins/${coinID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      const response = await axios.get(url);
      const coinData = response.data;

      // Stores values in the result object
      result["Name"] = coinData.name;
      result[
        "Current Price"
      ] = `$${coinData.market_data.current_price.usd.toLocaleString()}`;
      result[
        "%∆ Price 30d"
      ] = `${coinData.market_data.price_change_percentage_30d_in_currency.usd.toFixed(
        2
      )}%`;
      result[
        "%∆ Price 60d"
      ] = `${coinData.market_data.price_change_percentage_60d_in_currency.usd.toFixed(
        2
      )}%`;
      result[
        "%∆ Price 200d"
      ] = `${coinData.market_data.price_change_percentage_200d_in_currency.usd.toFixed(
        2
      )}%`;
      result[
        "Volume"
      ] = `$${coinData.market_data.total_volume.usd.toLocaleString()}`;
      result["Category"] = coinData.categories.join(", ");
      result[
        "Market Cap"
      ] = `$${coinData.market_data.market_cap.usd.toLocaleString()}`;

      return result;
    } catch (error) {
      console.error("Error fetching coin data:", error);
      return null;
    }
  }

  async function getCoinID(symbol) {
    try {
      const url = `https://api.coingecko.com/api/v3/search?query=${gmx}`;
      const response = await axios.get(url);
      const coinData = response.data;
      const firstCoinId = coinData.coins[0].id;
      return firstCoinId;
    } catch (error) {
      console.log("Error retrieving coin id:", error);
      return null;
    }
  }

  async function fetchUserWatchlist(userID) {}

  return (
    <div style={{ paddingLeft: "90px" }}>
      <Stack direction="column" spacing={5}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "500",
            textAlign: "left",
            fontSize: "1.75rem",
            paddingTop: "90px",
          }}
        >
          Watchlist
        </Typography>
        <WatchlistTable />
      </Stack>
    </div>
  );
}
