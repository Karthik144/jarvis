// Page.js
"use client"
import React, { useState, useEffect } from 'react';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PromptBar from "../components/home/PromptBar";
import QuickPrompt from "../components/home/QuickPrompt";
import SignUpButton from "../components/onboard/SignUpButton";
import WelcomeModal from "../components/onboard/AuthModal";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";
export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("");
  const [user, setUser] = useState(null); 
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response");
  };

  const handleQuickPrompt = async (query) => {
    localStorage.setItem("userQuery", JSON.stringify(query));
    router.push("/response");
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
        {/* <Grid item>
          <QuickPrompt
            text="📱 What's the Twitter buzz on Injective?"
            onPress={handleQuickPrompt}
          />
        </Grid> */}
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
    </div>
  );
}
