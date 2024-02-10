import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { Box, Paper } from "@mui/material";
import { supabase } from "../../supabaseClient";
import Calculator from "@/components/LP_Forecast.js/Calculator";
const axios = require("axios");

export default function Watchlist() {
  const [user, setUser] = useState(null);

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
          Manage Liquidity Pools
        </Typography>
      </Box>
      
    </Box>
  );
}
