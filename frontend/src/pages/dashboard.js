import React, { useState, useEffect } from "react";
import WatchlistTable from "../components/watchlist/WatchlistTable.js";
import MomentumTable from "../components/watchlist/MomentumTable.js";
import AddButton from "../components/watchlist/AddButton.js"; 
import SwitchButton from "../components/watchlist/SwitchButton.js";
import NewTokenModal from "../components/watchlist/NewTokenModal.js"; 
import Typography from "@mui/material/Typography";
import Workflow from "../components/workflows/Workflow"; 
import QuickAction from "../components/workflows/QuickAction"; 
import Stack from "@mui/material/Stack";
import { Box, Paper } from "@mui/material";
import { supabase } from "../../supabaseClient.js";
import Snackbar from "@mui/material/Snackbar";
import { useRouter } from "next/router.js";
const axios = require("axios");

// export const fetchWatchlist = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("watchlist")
//         .eq("id", user.id)
//         .single();

//       if (error) {
//         throw error;
//       }

//       setRawList(data.watchlist || { coins: [] });

//       const coinsInWatchlist = data.watchlist.coins.length;
//       console.log("WATCHLIST LENGTH:", coinsInWatchlist);

//       const newWatchlist = [];

//       for (let i = 0; i < coinsInWatchlist; i++) {
//         // const coinData = await getCoinData(data.watchlist.coins[i].coin_id, i);
//         const coinData = await getCachedCoinData(
//           data.watchlist.coins[i].coin_id,
//           i
//         );
//         console.log("COIN DATA:", coinData);
//         newWatchlist.push(coinData);
//       }
//       console.log("NEW WATCHLIST:", newWatchlist);
//       setWatchlist(newWatchlist);
//     } catch (error) {
//       console.error("Error fetching investor profile:", error.message);
//     }
//   };

export default function Watchlist() {
  const [user, setUser] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [momentumList, setMomentumList] = useState([]); 
  const [rawList, setRawList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tokenAdded, setTokenAdded] = useState(false);
  const [viewMomentumList, setViewMomentumList] = useState(false); 
  // const quickActionFilter = ['Base APY', "30D APY"]; 

  const router = useRouter()

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
      console.log("RESPONSE:", response.data)
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
      
      if (coinData.market_data.price_change_percentage_200d_in_currency.usd !== undefined) {
        result["priceChange200"] = `${coinData.market_data.price_change_percentage_200d_in_currency.usd.toFixed(2)}%`;
      }
      else {
        result["priceChange200"] = 'N/A'
      }
      
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

  async function getMomentumList() {

    // Get momentum list 
    let { data: momentumList, error: momentumError } = await supabase
      .from("momentum-list")
      .select("symbol, momentum_score_current");

    // Get growth list 
    let { data: growthList, error: growthError } = await supabase
      .from("growth-list")
      .select("symbol, data");

    if (momentumError) {
      console.error("Error fetching momentum list:", momentumError);
      return;
    }

    if (growthError) {
      console.error("Error fetching growth list:", growthError);
      return;
    }

    // Create a list of objects to pass over to table
    let mergedData = momentumList.map((momentumItem, index) => {
      // Find the corresponding growth item based on the symbol
      let growthItem = growthList.find(
        (item) => item.symbol === momentumItem.symbol
      );

      let extractedGrowthData = {};

      if (growthItem && growthItem.data && growthItem.data.seven_day_data) {
        
        const sevenDayData = growthItem.data.seven_day_data;
        // Get data for most recent element 
        const mostRecentElement = sevenDayData[sevenDayData.length - 1];

        // Extract only the data that's useful to display 
        extractedGrowthData = {
          name: mostRecentElement.name,
          market_cap: mostRecentElement.market_cap,
          max_supply: mostRecentElement.max_supply,
          total_supply: mostRecentElement.total_supply,
          total_volume: mostRecentElement.total_volume,
          current_price: mostRecentElement.current_price,
          price_change_percentage_24h: mostRecentElement.price_change_percentage_24h,
          market_cap_change_percentage_24h: mostRecentElement.market_cap_change_percentage_24h,
          price_change_percentage_30d_in_currency: mostRecentElement.price_change_percentage_30d_in_currency,
        };
      }

      return {
        id: index + 1, 
        symbol: momentumItem.symbol,
        momentum_score_current: momentumItem.momentum_score_current,
        ...extractedGrowthData,
      };
    });

    mergedData.sort(
      (a, b) => b.momentum_score_current - a.momentum_score_current
    );
    
    setMomentumList(mergedData); 
    console.log('MERGED DATA:', mergedData); 
    // return mergedData;
  }


  const handleMomentumList = async (watchlist) => {

    if (watchlist){
      setViewMomentumList(false); 
    } else {
      await getMomentumList();
      setViewMomentumList(true); 
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
      query: `Filter pools with base APY > 15% and 30D APY mean >10%?`,
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
        query: "Perform correlation analysis on watchlist tokens.",
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
        <Stack direction="row" spacing={2}>
          {viewMomentumList ? (
            <Typography
              variant="h2"
              sx={{
                fontWeight: "500",
                fontSize: "1.75rem",
              }}
            >
              Momentum List
            </Typography>
          ) : (
            <Typography
              variant="h2"
              sx={{
                fontWeight: "500",
                fontSize: "1.75rem",
              }}
            >
              Watchlist
            </Typography>
          )}

          {viewMomentumList ? (
            <SwitchButton onClick={() => handleMomentumList(true)}>
              View Watchlist
            </SwitchButton>
          ) : (
            <SwitchButton onClick={() => handleMomentumList(false)}>
              View Momentum List
            </SwitchButton>
          )}
        </Stack>

        <AddButton onClick={() => handleOpenModal("signin")}>Add</AddButton>
      </Box>

      {viewMomentumList ? (
        <MomentumTable momentumList={momentumList} />
      ) : (
        <WatchlistTable watchlistData={watchlist} rawList={rawList} />
      )}

      {/* Main container for the two sections */}
      <Box
        sx={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          marginTop: "50px",
        }}
      >
        {/* <Box sx={{ width: "50%" }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "500",
              fontSize: "1.75rem",
              paddingBottom: "15px",
            }}
          >
            Automated Workflows
          </Typography>

          <Stack direction="row" spacing={2}>
            <Workflow
              user={user}
              title={"Identify Top LP Pairs"}
              prompts={[
                "Identify low beta, high growth tokens",
                "Research token use cases, vision, and tokenomics",
                "Analyze Twitter & community sentiment",
                "Analyze contract security and previous hacks",
                "Estimate best ranges for LP ranges",
              ]}
              type={"Token Discovery"}
            />
          </Stack>
        </Box> */}

        {/* Box for Quick Tasks */}
        <Box sx={{ width: "50%" }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "500",
              fontSize: "1.75rem",
            }}
          >
            Quick Tasks
          </Typography>
          <Stack direction="row" spacing={2} sx={{ paddingTop: "15px" }}>
            <QuickAction
              onButtonClick={handleWorkflowOneButtonClick}
              title={"Find Pools by APY"}
              type={"Base APY > 15%, 30D Mean > 10%"}
            />
            <QuickAction
              onButtonClick={handleWorkflowTwoButtonClick}
              title={"Compare Watchlist Tokens"}
              type={"Watchlist"}
            />
          </Stack>
        </Box>
      </Box>

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
