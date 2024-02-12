import React, { useState, useEffect } from "react";
import WatchlistTable from "../components/watchlist/WatchlistTable.js";
import AddButton from "../components/watchlist/AddButton.js"; 
import NewTokenModal from "../components/watchlist/NewTokenModal.js"; 
import Typography from "@mui/material/Typography";
import Workflow from "../components/workflows/Workflow"; 
import Stack from "@mui/material/Stack";
import { Box, Paper } from "@mui/material";
import { supabase } from "../../supabaseClient.js";
import { useRouter } from "next/router.js";
import Snackbar from "@mui/material/Snackbar";
const axios = require("axios");

export default function Watchlist() {
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [rawList, setRawList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tokenAdded, setTokenAdded] = useState(false);
  const workflowOneFilters = ['Base APY > 10%', "30D APY > 15%"]; 
  const workflowTwoFilters = ['Quantitative']; 

  const router = useRouter();

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
      console.log("INSIDE IF STATEMENT"); 

      fetchWatchlist();
    } 
  }, [user]);

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

      setRawList(data.watchlist || { coins: [] });

      const coinsInWatchlist = data.watchlist.coins.length;
      console.log("WATCHLIST LENGTH:", coinsInWatchlist);

      const newWatchlist = [];

      for (let i = 0; i < coinsInWatchlist; i++) {
        // const coinData = await getCoinData(data.watchlist.coins[i].coin_id, i);
        const coinData = await getCachedCoinData(
          data.watchlist.coins[i].coin_id,
          i
        );
        console.log("COIN DATA:", coinData);
        newWatchlist.push(coinData);
      }
      console.log("NEW WATCHLIST:", newWatchlist);
      setWatchlist(newWatchlist);
    } catch (error) {
      console.error("Error fetching investor profile:", error.message);
    }
  };

  async function getCachedCoinData(coinID, id) {
    const cacheKey = `coinData_${coinID}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);

      // Check if the cache is still valid - 5 hours
      if (Date.now() - timestamp < 3600000 * 5) {
        console.log('RETURNING CACHED DATA'); 

        // Check if ids are same; if not, update 
        if (data.id !== id) {
          data.id = id; 

          localStorage.setItem(
            cacheKey,
            JSON.stringify({ timestamp, data })
          );
        }
        return data; 
      }
    }

    console.log("FETCHING NEW DATA"); 
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
    console.log("GET COINGECKO DATA CALLED"); 
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
      const url = `https://api.coingecko.com/api/v3/coins/${coinID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false&x_cg_demo_api_key=CG-LEPn4oEPjTDCk2b4N4hNpeYG`;
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

  const handleTokenAdded = async () => {
    setTokenAdded(true);
    await fetchWatchlist(); 
  }

  const handleTokenNotAdded = (event, reason) => {
    if (reason === 'clickaway'){
      return; 
    }

    setTokenAdded(false);
  }

  const handleWorkflowOneButtonClick = () => {
    console.log("Workflow button was pressed!");
    const userQuery = {
      query:
        'Filter pools with base APY > 10% and 30D APY mean >15%?',
      watchlist: false,
    };
    localStorage.setItem("userQuery", JSON.stringify(userQuery));
    router.push("/response");
  };

const handleWorkflowTwoButtonClick = async () => {
  console.log("Workflow button two was pressed!");
  // Provide a detailed quantitative analysis comparing my watchlist tokens.
  if (user) {
    await fetchWatchlist();
    const userQuery = {
      query: "Identify the correlation between my watchlist tokens and analyze their volatility.",
      watchlist: true,
    };
    localStorage.setItem("userQuery", JSON.stringify(userQuery));
    router.push("/response");
  }
};


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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          marginTop:"40px"
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: "500",
            fontSize: "1.75rem",
          }}
        >
          Tasks
        </Typography>
      </Box>

      <Stack direction="row" spacing={2}>
        <Workflow
            onButtonClick={handleWorkflowOneButtonClick}
            title={"Filter Pools on APY"}
            filterText={workflowOneFilters}
            type={"Token Discovery"}
        />
        <Workflow
          onButtonClick={handleWorkflowTwoButtonClick}
          title={"Compare Watchlist Tokens"}
          filterText={workflowTwoFilters}
          type={"Watchlist"}
        />
      </Stack>

      <NewTokenModal
        handleClose={handleCloseModal}
        open={modalOpen}
        rawList={rawList}
        handleTokenAdded={handleTokenAdded}
        maxCapacity={watchlist.length === 15 ? true : false}
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
