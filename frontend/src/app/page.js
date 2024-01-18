'use client';
import React, { useState } from 'react'; 
import Typography from "@mui/material/Typography";
import PromptBar from "../../../frontend/components/PromptBar";
import QuickAction from "../../../frontend/components/QuickAction";
// import { main as callAssistant } from "../backend/Assistant"; 
import Grid from "@mui/material/Grid";
import { useRouter } from "next/navigation";


export default function Home() {
  const [userInput, setUserInput] = useState("");
  const router = useRouter();


  const handleSubmit = (query) => {
    console.log("handle submit called in page.js");
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response");
  };

  const handleQuickAction = async (query) => {
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
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
          <QuickAction
            text="Bitcoin"
            onPress={handleQuickAction}
          />
        </Grid>
        <Grid item>
          <QuickAction
            text="Cosmos"
            onPress={handleQuickAction}
          />
        </Grid>
        <Grid item>
          <QuickAction
            text="Chainlink"
            onPress={handleQuickAction}
          />
        </Grid>
      </Grid>
    </div>
  );
}
