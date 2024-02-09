import React, { useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { supabase } from "../../supabaseClient";

export default function Notes() {
  const [notes, setNotes] = useState("");
  const [rawList, setRawList] = useState([]);
  const [coinID, setCoinID] = useState("");
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
    if (user && rawList.coins) {
      // User is logged in, fetch their profile
      const fetchNotes = () => {
        const coinData = rawList.coins;

        for (let i = 0; i < coinData.length; i++) {
          if (coinData[i].coin_id === coinID && coinData[i].notes) {
            setNotes(coinData[i].notes);
          }
        }
      };

      fetchNotes();
    }
  }, [user, rawList, coinID]);

  const renderNotes = () => {
    return notes.split("\n").map((line, index) => (
      <Typography
        key={index}
        sx={{
          display: "block",
          marginLeft: line.startsWith("•") ? 2 : 0,
          textIndent: line.startsWith("•") ? "-5px" : "0",
          marginBottom: "5px",
        }}
      >
        {line}
      </Typography>
    ));
  };

  return (
    <Box sx={{ padding: "90px" }}>
      <Typography variant="h2" sx={{ fontWeight: "500", fontSize: "1.75rem" }}>
        Notes
      </Typography>

      <Box sx={{ paddingTop: "20px" }}>{renderNotes()}</Box>
    </Box>
  );
}
