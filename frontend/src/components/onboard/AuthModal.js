import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ClearIcon from "@mui/icons-material/Clear"; 
import SignUpButton from "./SignUpButton";
import IconButton from "@mui/material/IconButton"; 
import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";

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
  textAlign: "center",
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
export default function WelcomeModal({ handleClose, open, email, setEmail, password, setPassword, mode }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [needToConfirmEmail, setNeedToConfirmEmail] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  function checkValidInputs() {
    if (!email || !password) {
      setErrorMessage("Please make sure both fields are filled.");
      return false;
    }
    return true;
  }


  // USER-FLOW LOGIC
  async function handleSignIn() {
    console.log("HANDLE SIGN IN CALLED"); 
    const validInputs = checkValidInputs();

    if (validInputs) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else{
        // const {
        //   data: { user },
        // } = await supabase.auth.getUser();
        //  console.log("Logged in user's email: ", user.email);
        //  console.log("Logged in user's ID: ", user.id);
         handleClose(); 
      }
    }
  }
  async function handleSignUp() {

    console.log("HANDLE SIGN UP CALLED"); 
    const validInputs = checkValidInputs();

    if (validInputs) {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: "http://localhost:3000/",
        },
      });

      if (error) {
        console.error(error);
      } else {
        setNeedToConfirmEmail(true);
      }
    }
  }

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {needToConfirmEmail ? (
          <Box sx={style}>
            <IconButton sx={closeButtonStyle} onClick={handleClose}>
              <ClearIcon />
            </IconButton>
            <MailOutlineIcon fontSize="large" />
            <Typography
              id="modal-modal-title"
              sx={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "black",
              }}
            >
              Confirm Your Email
            </Typography>
            <Typography
              id="modal-modal-description"
              sx={{
                fontSize: "1.25rem",
                color: "#666",
              }}
              variant="subtitle1"
            >
              Check your inbox
            </Typography>
          </Box>
        ) : (
          <Box sx={style}>
            <IconButton sx={closeButtonStyle} onClick={handleClose}>
              <ClearIcon />
            </IconButton>
            <Typography
              id="modal-modal-title"
              sx={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "black",
              }}
            >
              {mode === "signin" ? "Welcome Back" : "Welcome"}
            </Typography>

            <Typography
              id="modal-modal-description"
              sx={{
                fontSize: "1.25rem",
                color: "#666",
                marginTop: "0.5rem",
              }}
              variant="subtitle1"
            >
              {mode === "signin"
                ? "Sign in to continue"
                : "Sign up to create an account"}
            </Typography>

            <Stack
              spacing={2}
              direction="column"
              sx={{
                display: "flex",
                alignItems: "center",
                marginTop: "1rem",
              }}
            >
              <TextField
                id="outlined-email"
                label="Email"
                placeholder="satoshi@aol.com"
                variant="outlined"
                fullWidth
                value={email}
                onChange={handleEmailChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "15px",
                  },
                }}
              />
              <TextField
                id="outlined-password"
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={handlePasswordChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "15px",
                  },
                }}
              />
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              <SignUpButton
                variant="contained"
                style={buttonStyle}
                onClick={mode == "signin" ? handleSignIn : handleSignUp}
              >
                {mode === "signin" ? "Sign In" : "Sign Up"}
              </SignUpButton>
            </Stack>
          </Box>
        )}
      </Modal>
    </div>
  );
}
