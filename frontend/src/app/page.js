'use client';
import React, { useState } from 'react'; 
import Typography from "@mui/material/Typography";
import PromptBar from "../../../frontend/components/PromptBar";
import QuickAction from "../../../frontend/components/QuickAction";
import Button from "@mui/material/Button";
import SignUpButton from "../../../frontend/components/SignUpButton";
import WelcomeModal from "../../../frontend/components/WelcomeModal";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";


export default function Home() {
  const [userInput, setUserInput] = useState("");
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState(""); 

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = (query) => {
    console.log("handle submit called in page.js");
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response");
  };

  const handleSelectFee = (fee) => {
    setSelectedFee(fee);
  };

  const handleQuickAction = async (query) => {
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <Stack spacing={2} direction="row" sx={{ p: "10px" }}>
        <Button
          onClick={handleOpenModal}
          variant="text"
          sx={{ textTransform: "none", color: "black" }}
          disableElevation
        >
          Sign In
        </Button>

        <SignUpButton onClick={handleOpenModal} disableElevation>
          Sign Up
        </SignUpButton>
      </Stack>

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
          <QuickAction text="Bitcoin" onPress={handleQuickAction} />
        </Grid>
        <Grid item>
          <QuickAction text="Cosmos" onPress={handleQuickAction} />
        </Grid>
        <Grid item>
          <QuickAction text="Chainlink" onPress={handleQuickAction} />
        </Grid>
      </Grid>

      <WelcomeModal
        handleOpen={handleOpenModal}
        handleClose={handleCloseModal}
        open={modalOpen}
        email={email} 
        setEmail={setEmail} 
      />
    </div>
  );
}
