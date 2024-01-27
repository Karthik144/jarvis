// Page.js
"use client"
import React, { useState, useEffect } from 'react';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PromptBar from "../components/home/PromptBar";
import QuickPrompt from "../components/home/QuickPrompt";
import SignUpButton from "../components/onboard/SignUpButton";
import WelcomeModal from "../components/onboard/WelcomeModal";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://nibfafwhlabdjvkzpvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("");
  const [user, setUser] = useState(null); // Track user authentication state

  const router = useRouter();

  // Fetch the authentication state when the component mounts
  useEffect(() => {
    // Listen for changes in the authentication state
    const unsubscribe = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Update the user state whenever the authentication state changes
        setUser(session?.user || null);
      }
    );

    // Call the cleanup function returned by supabase.auth.onAuthStateChange()
    // when the component unmounts
    return unsubscribe;
 }, []);
  // Function to handle user authentication
  const handleAuth = async () => {
    const { user, session, error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (error) {
      console.error(error);
    } else {
      setUser(user);
      setModalOpen(false);
    }
  };

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

  const handleSubmit = (query) => {
    console.log("handle submit called in page.js");
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response");
  };

  const handleQuickPrompt = async (query) => {
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <Stack spacing={2} direction="row" sx={{ p: "10px" }}>
        {user ? (
          // If user is authenticated, show the user's email and a logout button
          <>
            <Typography variant="body1" sx={{ fontWeight: "lighter" }}>
              {user.email}
            </Typography>
            <Button onClick={handleLogout} variant="text" sx={{ textTransform: "none", color: "black" }}>
              Logout
            </Button>
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
            <SignUpButton onClick={() => handleOpenModal("signup")} disableElevation>
              Sign Up
            </SignUpButton>
          </>
        )}
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
          <QuickPrompt text="Bitcoin" onPress={handleQuickPrompt} />
        </Grid>
        <Grid item>
          <QuickPrompt text="Cosmos" onPress={handleQuickPrompt} />
        </Grid>
        <Grid item>
          <QuickPrompt text="Chainlink" onPress={handleQuickPrompt} />
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
    </div>
  );
}
