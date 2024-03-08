import React, { useState, useEffect } from "react";
import WatchlistTable from "../components/watchlist/WatchlistTable.js";
import MomentumTable from "../components/watchlist/MomentumTable.js";
import AddButton from "../components/watchlist/AddButton.js"; 
import DeleteButton from "../components/watchlist/DeleteButton.js"; 
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
  const [selectedRows, setSelectedRows] = useState([]);
  const [watchlistRowsSelected, setWatchlistRowsSelected] = useState(false);
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

  async function getTopMomentumScores() {
    console.log("INSIDE GET TOP MOMENTUM SCORES"); 
    const { data, error } = await supabase
      .from("momentum-list")
      .select("symbol, momentum_scores_30D, momentum_score_current")
      .order("momentum_score_current", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    console.log("MOMENTUM SCORES:", data);

    const topMomentumScores = data;

    return topMomentumScores;
  }
  // Get users watchlist once
  useEffect(() => {
    if (user) {
      // User is logged in, fetch their profile
      console.log("INSIDE IF STATEMENT"); 

      fetchWatchlist();
      // await getTopMomentumScores();
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

      return result;
    } catch (error) {
      console.error("Error fetching coin data:", error);
      return null;
    }
  }

  const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
  async function getCachedMomentumList() {
      const cachedData = localStorage.getItem('momentumListData');
      if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (Date.now() - timestamp < cacheDuration) {
              return data;
          }
      }
      return null;
  }

  async function getCachedGrowthList() {
      const cachedData = localStorage.getItem('growthListData');
      if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          if (Date.now() - timestamp < cacheDuration) {
              return data;
          }
      }
      return null;
  }

  async function getMomentumListFromSupabase() {
    let { data: momentumList, error: momentumError } = await supabase
        .from("momentum-list")
        .select("symbol, momentum_score_current");

    if (!momentumList) {
        console.error("Error fetching momentum list:", momentumError);
        return null;
    }

    return momentumList;
  }

  async function getGrowthListFromSupabase() {
    let { data: growthList, error: growthError } = await supabase
        .from("growth-list")
        .select("symbol, data");

    if (!growthList) {
        console.error("Error fetching growth list:", growthError);
        return null;
    }

    return growthList;
  }
  
  async function getMomentumList() {
    const cachedMomentumList = await getCachedMomentumList();
    if (cachedMomentumList) {
        console.log('Returning cached momentum list');
        return cachedMomentumList;
    }

    console.log('Fetching new momentum list');
    const momentumList = await getMomentumListFromSupabase();
    if (momentumList) {
        localStorage.setItem('momentumListData', JSON.stringify({
            timestamp: Date.now(),
            data: momentumList
        }));
    }
    return momentumList;
  }

  async function getGrowthList() {
    const cachedGrowthList = await getCachedGrowthList();
    if (cachedGrowthList) {
        console.log('Returning cached growth list');
        return cachedGrowthList;
    }

    console.log('Fetching new growth list');
    const growthList = await getGrowthListFromSupabase();
    if (growthList) {
        localStorage.setItem('growthListData', JSON.stringify({
            timestamp: Date.now(),
            data: growthList
        }));
    }
    return growthList;
  }

  async function getMomentumList_complex() {

    // Get momentum list 
    let momentumList = await getMomentumList()
    let growthList = await getGrowthList()


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
          ethereum_address: mostRecentElement.ethereum_address, 
          arbitrum_one_address: mostRecentElement.arbitrum_one_address, 
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

  async function returnWatchlist(){
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("watchlist")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }
      const coinsInWatchlist = data.watchlist.coins; // Returns just the array 
      return coinsInWatchlist; 
    } catch (error) {
      console.error("Error fetching investor profile:", error.message);
    }
  }

  async function updateWatchlist(newUserWatchlist) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ watchlist: newUserWatchlist }) 
      .eq("id", user.id);

    if (error) {
      console.error("Error updating watchlist:", error);
      return;
    }

    console.log("Watchlist updated successfully:", data);
  }

  async function deleteWatchlistItem(coinIds) {

    console.log("COIND IDS:", coinIds); 
    const userWatchlist = await returnWatchlist();
    console.log("USER WATCHLISTTTT:", userWatchlist); 

    // Iterate through each coin ID to be removed
    coinIds.forEach((coinId) => {
      // Iterate backward through the user watchlist
      for (let i = userWatchlist.length - 1; i >= 0; i--) {
        if (coinId === userWatchlist[i].coin_id) {
          userWatchlist.splice(i, 1); // Remove the matching element
        }
      }
    });

    const newList = {
      coins: userWatchlist,
    };

    await updateWatchlist(newList);
  }

  const handleMomentumList = async (watchlist) => {

    if (watchlist){
      setViewMomentumList(false); 
    } else {
      await getMomentumList_complex();
      setViewMomentumList(true); 
    }

  }

  const handleSelectionChange = (selectedItems) => {
    if (selectedItems){
      setWatchlistRowsSelected(true); 
      setSelectedRows(selectedItems); 
      console.log("Selected items in parent:", selectedItems);
    }

  };

  const handleDelete = async () => {
    let coinIds = [];
    const newWatchlist = watchlist.filter((item, index) => {
      const isSelected = selectedRows.includes(item.id);
      if (isSelected) {
        coinIds.push(item.coinID);
        return false; // Exclude this item from the new array
      }
      return true; // Include this item in the new array
    });

    // Update the watchlist state with the new array
    setWatchlist(newWatchlist);

    // Remove them from db in profiles table
    await deleteWatchlistItem(coinIds);
  };

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

  const handleWorkflowThreeButtonClick = async () => {
    console.log("Workflow button three was pressed!");
    const topTokens = await getTopMomentumScores();
    console.log("Top tokens in three:", topTokens);

    const messages = [
      {
        role: "system",
        content:
          "You are a crypto researcher that provides detailed reports about tokens. In the report, for each token, provide a summary, potential applications, and new non-price related updates.",
      },
    ];

    console.log("TOP TOKENS:", topTokens); 
    // Extract the 'symbol' from each object in the topTokens array and join them into a comma-separated string
    const symbols = topTokens.map((token) => token.symbol).join(", ");
    console.log("SYMBOLS:", symbols); 
    // Create the object with the symbols string
    const tokenReportRequest = {
      role: "user",
      content: `Can you give me a report on the following tokens: ${symbols}.`,
    };

    // Append the new object to the messages array
    messages.push(tokenReportRequest);

    console.log("Updated messages:", messages);
    localStorage.setItem("reportQuery", JSON.stringify(messages));
    router.push("/report");
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

        {watchlistRowsSelected ? (
          <Stack direction="row" spacing={2}>
            <DeleteButton onClick={() => handleDelete()}>Delete</DeleteButton>
            <AddButton onClick={() => handleOpenModal("signin")}>Add</AddButton>
          </Stack>
        ) : (
          <AddButton onClick={() => handleOpenModal("signin")}>Add</AddButton>
        )}
      </Box>

      {viewMomentumList ? (
        <MomentumTable momentumList={momentumList} />
      ) : (
        <WatchlistTable
          watchlistData={watchlist}
          rawList={rawList}
          onSelectionChange={handleSelectionChange}
        />
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
        <Box sx={{ width: "100%" }}>
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
            <QuickAction
              onButtonClick={handleWorkflowThreeButtonClick}
              title={"Create Momentum Report"}
              type={"Momentum List"}
            />
          </Stack>
        </Box>
      </Box>

      <NewTokenModal
        handleClose={handleCloseModal}
        open={modalOpen}
        rawList={rawList}
        handleTokenAdded={handleTokenAdded}
        maxCapacity={watchlist.length === 30 ? true : false}
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
