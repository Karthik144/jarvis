import React, { useState, useEffect } from "react";
import WatchlistTable from "../components/watchlist/WatchlistTable.js";
import AddButton from "../components/watchlist/AddButton.js"; 
import NewTokenModal from "../components/watchlist/NewTokenModal.js"; 
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Box, Paper } from "@mui/material";
import { supabase } from "../../supabaseClient";
import Snackbar from "@mui/material/Snackbar";
const axios = require("axios");

export default function Watchlist() {
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [rawList, setRawList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tokenAdded, setTokenAdded] = useState(false);

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
    if (user && watchlist.length===0) {
      // User is logged in, fetch their profile
      const fetchWatchlist = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("watchlist")
            .eq("id", user.id)
            .single();

          if (error) {
            throw error;
          }

          setRawList(data.watchlist || { coins: []}); 

          const coinsInWatchlist = data.watchlist.coins.length; 
          console.log("WATCHLIST LENGTH:", coinsInWatchlist);

          const newWatchlist = [];

          for (let i = 0; i < coinsInWatchlist; i++) {
            // const coinData = await getCoinData(data.watchlist.coins[i].coin_id, i);
            const coinData = await getCachedCoinData(data.watchlist.coins[i].coin_id, i);
            console.log("COIN DATA:", coinData);
            newWatchlist.push(coinData);
          }

          setWatchlist(newWatchlist);

        } catch (error) {
          console.error("Error fetching investor profile:", error.message);
        }
      };

      fetchWatchlist();
    } 
  }, [user]);

  async function getCachedCoinData(coinID, id) {
    const cacheKey = `coinData_${coinID}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);

      // Check if the cache is still valid - 1 hour
      if (Date.now() - timestamp < 3600000) {
        return data; // Return cached data
      }
    }

    // If no valid cache, fetch new data
    const newData = await getCoinData(coinID, id);
    if (newData) {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data: newData })
      );
    }
    return newData;
  }

  async function getCoinData(coinID, rowID) {
    try {
      console.log('ROW ID:', rowID);
      const result = {
        id: rowID,
        name: "",
        coinID: coinID,
        currentPrice: "",
        priceChange30: "", 
        priceChange60: "", 
        priceChange200: "",
        volume: "",
        category: "",
        marketCap: "",
      };
      const url = `https://api.coingecko.com/api/v3/coins/${coinID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      const response = await axios.get(url);
      const coinData = response.data;

      // Stores values in the result object
      result["name"] = coinData.name;
      result[
        "currentPrice"
      ] = `$${coinData.market_data.current_price.usd.toLocaleString()}`;
      result[
        "priceChange30"
      ] = `${coinData.market_data.price_change_percentage_30d_in_currency.usd.toFixed(
        2
      )}%`;
      result[
        "priceChange60"
      ] = `${coinData.market_data.price_change_percentage_60d_in_currency.usd.toFixed(
        2
      )}%`;
      result[
        "priceChange200"
      ] = `${coinData.market_data.price_change_percentage_200d_in_currency.usd.toFixed(
        2
      )}%`;
      result[
        "volume"
      ] = `$${coinData.market_data.total_volume.usd.toLocaleString()}`;
      result["category"] = coinData.categories.join(", ");
      result[
        "marketCap"
      ] = `$${coinData.market_data.market_cap.usd.toLocaleString()}`;

      console.log("RESULT:", result); 
      return result;
    } catch (error) {
      console.error("Error fetching coin data:", error);
      return null;
    }
  }


  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleTokenAdded = () => {
    setTokenAdded(true);
  }

  const handleTokenNotAdded = (event, reason) => {
    if (reason === 'clickaway'){
      return; 
    }

    setTokenAdded(false);
  }


  return (
    <Box sx={{ padding: "90px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: "500",
            fontSize: "1.75rem",
          }}
        >
          Watchlist
        </Typography>
        <AddButton onClick={() => handleOpenModal("signin")}>Add</AddButton>
      </Box>
      <WatchlistTable watchlistData={watchlist} rawList={rawList} />

      <NewTokenModal
        handleClose={handleCloseModal}
        open={modalOpen}
        rawList={rawList}
        handleTokenAdded={handleTokenAdded}
      />

      <Snackbar
        open={tokenAdded}
        autoHideDuration={5000}
        onClose={handleTokenNotAdded}
        message="✅ Token successfully added!"
        sx={{
          ".MuiSnackbarContent-root": {
            backgroundColor: "white",
            color: "black",
          }, 
        }}
      />
    </Box>
  );
}
