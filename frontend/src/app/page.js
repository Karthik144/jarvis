// Page.js
"use client"
import React, { useState, useEffect } from 'react';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PromptBar from "../components/home/PromptBar";
import QuickPrompt from "../components/home/QuickPrompt";
import SignUpButton from "../components/onboard/SignUpButton";
import WelcomeModal from "../components/onboard/AuthModal";
import Workflow from "../components/workflows/Workflow"; 
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";
import Box from "@mui/material/Box";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("");
  const [user, setUser] = useState(null); 
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [watchlist, setWatchlist] = useState([]);
  const workflowOneFilters = ['Base APY > 10%', "30D APY > 15%"]; 
  const workflowTwoFilters = ['Quantitative']; 
  const handleClick = (event) => {
    if (document.contains(event.currentTarget)) {
      console.log("Anchor element is in document.")
      setAnchorEl(event.currentTarget);
    } else {
      console.error("The anchor element is not in the document.");
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const router = useRouter();

  // Fetch the authentication state when the component mounts
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
      localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
      // setWatchlist(newWatchlist);
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
        console.log("RETURNING CACHED DATA");

        // Check if ids are same; if not, update
        if (data.id !== id) {
          data.id = id;

          localStorage.setItem(cacheKey, JSON.stringify({ timestamp, data }));
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
      console.log("ROW ID:", rowID);
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


  const handleOpenModal = (mode) => {
    setMode(mode);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleInvestorProfile = async () => {
    router.push("/profile");
  }; 

  const handleSubmit = (query) => {
    const userQuery = {
      query: query,
      watchlist: false,
    };
    localStorage.setItem("userQuery", JSON.stringify(userQuery));
    router.push("/response");
  };

  const handleQuickPrompt = async (query) => {
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response");
  };

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
  if (user) {
    await fetchWatchlist();
    const userQuery = {
      query:
        "Provide a detailed quantitative analysis comparing my watchlist tokens.",
      watchlist: true,
    };
    localStorage.setItem("userQuery", JSON.stringify(userQuery));
    router.push("/response");
  }
};

  function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  function stringAvatar(email) {
    let firstLetter = email ? email[0].toUpperCase() : ""; 
    return {
      sx: {
        bgcolor: stringToColor(email), 
      },
      children: firstLetter, 
    };
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack spacing={2} direction="row" sx={{ p: "10px" }}>
          {user ? (
            // If user is authenticated, show the user's email and a logout button
            <>
              <Avatar {...stringAvatar(user.email)} onClick={handleClick} />
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem
                  onClick={handleInvestorProfile}
                  sx={{
                    "&.MuiMenuItem-root": {
                      "&:hover, &:focus": {
                        backgroundColor: "transparent",
                      },
                    },
                  }}
                >
                  Investor Profile
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    "&.MuiMenuItem-root": {
                      "&:hover, &:focus": {
                        backgroundColor: "transparent",
                      },
                    },
                  }}
                >
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            // If user is not authenticated, show Sign In and Sign Up buttons
            <>
              <Button
                onClick={() => handleOpenModal("signin")}
                variant="text"
                sx={{ textTransform: "none", color: "black" }}
                disableElevation
              >
                Sign In
              </Button>
              <SignUpButton
                onClick={() => handleOpenModal("signup")}
                disableElevation
              >
                Sign Up
              </SignUpButton>
            </>
          )}
        </Stack>

        <Button
          onClick={() => router.push("/watchlist")}
          sx={{
            textTransform: "none",
            color: "black",
            fontSize: "1rem",
            paddingRight: "20px",
            marginRight: "20px",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "transparent",
              color: "#555",
            },
          }}
        >
          Watchlist
        </Button>
      </Box>
      <Typography variant="h3" sx={{ textAlign: "center", pt: "165px" }}>
        Speed up your crypto research
      </Typography>
      <PromptBar onSubmit={handleSubmit} />
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ pt: 4, maxWidth: 1200, margin: "0 auto" }}
      >
        <Grid item>
          <Typography variant="body1" sx={{ fontWeight: "lighter" }}>
            Try asking...
          </Typography>
        </Grid>
        <Grid item>
          <QuickPrompt
            text="🚀 Low beta, high growth tokens"
            onPress={handleQuickPrompt}
          />
        </Grid>
        <Grid item>
          <QuickPrompt
            text="📈 What is Injective?"
            onPress={handleQuickPrompt}
          />
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ maxWidth: 1200, margin: "0 auto" }}
      >
        <Grid item>
          <QuickPrompt
            text="📑 Does Pendle have insurance?"
            onPress={handleQuickPrompt}
          />
        </Grid>
        <Grid item>
          <QuickPrompt
            text="💸 Forecast LP range for ARB and USDC"
            onPress={handleQuickPrompt}
          />
        </Grid>
      </Grid>

      <WelcomeModal
        handleOpen={handleOpenModal}
        handleClose={handleCloseModal}
        open={modalOpen}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        mode={mode}
      />
      <Box
        sx={{ maxWidth: "930px", margin: "0 auto", width: "100%", pt: "30px" }}
      >
        <Stack spacing={2} sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h5" sx={{ textAlign: "left" }}>
            Automated Workflows
          </Typography>
          <Stack direction="row" spacing={2}>
            <Workflow
              onButtonClick={handleWorkflowOneButtonClick}
              title={"Filter Pools on APY"}
              filterText={workflowOneFilters}
            />
            <Workflow
              onButtonClick={handleWorkflowTwoButtonClick}
              title={"Compare Watchlist Tokens"}
              filterText={workflowTwoFilters}
            />
          </Stack>
        </Stack>
      </Box>
    </div>
  );
}
