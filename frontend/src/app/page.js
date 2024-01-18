'use client';
import React, { useState } from 'react'; 
import Typography from "@mui/material/Typography";
import PromptBar from "../../../frontend/components/PromptBar";
import QuickAction from "../../../frontend/components/QuickAction";
import { main as callAssistant } from "../backend/Assistant"; 
import Grid from "@mui/material/Grid";
import { useRouter } from "next/navigation";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const router = useRouter();

  const handleSubmit = async (query) => {
    console.log("handle submit called in page.js");
    // setUserInput(query);
    // console.log("userInput in page.js", userInput);
    // Call the main function from Assistant.js and wait for the response
    // const ids = await callAssistant(query);
    // console.log("THREAD ID IN PAGE.JS", ids[0]);
    // console.log("RUN ID IN PAGE.JS", ids[1]);
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response"); 
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <Typography variant="h3" sx={{ textAlign: "center", pt: "165px" }}>
        Speed up your crypto research
      </Typography>
      <PromptBar onSubmit={handleSubmit} />

      <Grid
        container
        spacing={2} // Adjust the spacing to increase or decrease the space between items
        justifyContent="center"
        alignItems="center"
        sx={{ pt: 4, maxWidth: 1200, margin: "0 auto" }} // Set a maxWidth to control the overall width
      >
        <Grid item>
          <Typography variant="body1" sx={{fontWeight: 'lighter'}}>
            Try asking...
          </Typography>
        </Grid>
        <Grid item>
          <QuickAction text="RSI Analysis on Bitcoin" />
        </Grid>
        <Grid item>
          <QuickAction text="Latest updates to Ethereum" />
        </Grid>
        <Grid item>
          <QuickAction text="Most trending tokens" />
        </Grid>
      </Grid>
    </div>
  );
}
