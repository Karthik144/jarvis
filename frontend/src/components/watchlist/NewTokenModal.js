import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import CustomTextField from "./CustomTextField"; 
import NotesTextField from "./NotesTextField";
import AddTokenButton from "./AddTokenButton";
const axios = require("axios");

// STYLING
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  borderRadius: "10px",
  bgcolor: "#fff",
  boxShadow: 24,
  p: 4,
  textAlign: "left",
};

const buttonStyle = {
  marginTop: "1rem",
  backgroundColor: "black",
  color: "white",
};

const closeButtonStyle = {
  position: "absolute",
  top: "1rem",
  left: "1rem",
};

// VIEW
export default function NewTokenModal({ handleClose, handleTokenAdded, open, rawList, maxCapacity }) {
  const [notes, setNotes] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [user, setUser] = useState(null);

  const handleNotesChange = (value) => {
    setNotes(value);
  };

  const handleAddressChange = (value) => {
    setTokenAddress(value);
  };

  const handleSymbolChange = (value) => {
    setTokenSymbol(value);
  };

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

  async function getCoinID(symbol) {

    console.log("COINGECKO GET ID METHOD CALLED"); 
    try {
      const url = `https://api.coingecko.com/api/v3/search?query=${symbol}&x_cg_demo_api_key=CG-LEPn4oEPjTDCk2b4N4hNpeYG`;
      const response = await axios.get(url);
      const coinData = response.data;
      const firstCoinId = coinData.coins[0].id;
      return firstCoinId;
    } catch (error) {
      console.log("Error retrieving coin id:", error);
      return null;
    }
  }

  const addToWatchlist = async () => {
    if (!user) {
      console.error("No user found");
      return;
    }

    const coinID = await getCoinID(tokenSymbol);

    const watchlistToken = {
      coin_id: coinID,
      notes: notes,
      address: tokenAddress, 
    };

    rawList.coins.push(watchlistToken);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ watchlist: rawList })
        .eq("id", user.id);

      if (error) {
        throw error;
      }
      handleTokenAdded(); 
      handleClose(); 
      console.log("Watchlist updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {maxCapacity ? (
          <Box sx={style}>
            <Stack spacing={2}>
              <Typography
                id="modal-modal-title"
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                Watchlist Full
              </Typography>

              <Typography> 
                You've exceeded your watchlist capacity of 15 tokens. 
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              sx={{
                fontSize: "1.75rem",
                fontWeight: "bold",
                color: "black",
              }}
            >
              Add to Watchlist
            </Typography>

            <Stack>
              <Grid
                container
                spacing={2}
                sx={{ paddingTop: "15px", paddingBottom: "15px" }}
              >
                <Grid item md={6}>
                  <CustomTextField
                    title={"Token Address"}
                    placeholder={"0x0000"}
                    onChange={handleAddressChange}
                  />
                </Grid>
                <Grid item md={6}>
                  <CustomTextField
                    title={"Symbol"}
                    placeholder={"ETH"}
                    onChange={handleSymbolChange}
                  />
                </Grid>
              </Grid>

              <NotesTextField title={"Notes"} onChange={handleNotesChange} />

              <AddTokenButton onClick={addToWatchlist}>
                Add Token
              </AddTokenButton>
            </Stack>
          </Box>
        )}
      </Modal>
    </div>
  );
}
