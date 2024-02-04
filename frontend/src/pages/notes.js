import React, { useState, useEffect } from "react";
import { Box, Paper } from "@mui/material";
import { supabase } from "../../supabaseClient";
import Typography from "@mui/material/Typography";

export default function Notes() {
  const [notes, setNotes] = useState("");
  const [rawList, setRawList] = useState([]);
  const [coinID, setCoinID] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("coinID");
    const list = JSON.parse(localStorage.getItem("rawList"));

    setCoinID(id);
    setRawList(list);

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

  // Get token notes 
  useEffect(() => {
    if (user) {
      // User is logged in, fetch their profile
      const fetchNotes = () => {
        const coinData = rawList.coins

        for (let i = 0; i < coinData.length; i++){
            if (coinData[i].coin_id === coinID && coinData[i].notes) {
                setNotes(coinData[i].notes);
            }
        }

      };

      fetchNotes();
    }
  }, [user]);

  return (
    <Box sx={{ padding: "90px" }}>
      <Typography
        variant="h2"
        sx={{
          fontWeight: "500",
          fontSize: "1.75rem",
        }}
      >
        Notes
      </Typography>

      <Typography
        sx={{
          paddingTop: "20px",
        }}
      >
        {notes}
      </Typography>
    </Box>
  );
}
