import React from "react";
import Button from "@mui/material/Button";
import { styled, keyframes } from "@mui/material/styles";

const StyledSignUpButton = styled(Button)(({ theme, cancel }) => ({
  backgroundColor: cancel ? "#FCFCF9" : "#000000",
  color: cancel ? "black" : "white",
  borderRadius: "20px",
  textTransform: "none",
  border: cancel ? "1px solid rgba(0, 0, 0, 0.25)" : "none",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    backgroundColor: cancel ? "#FCFCF9" : "#808080",
  },
}));


export default function ActionButton({ cancel, onClick, children }) {
  return (
    <StyledSignUpButton
      variant="contained"
      cancel={cancel}
      onClick={onClick} 
    >
      {children} 
    </StyledSignUpButton>
  );
}