import React from "react";
import Button from "@mui/material/Button";
import { styled, keyframes } from "@mui/material/styles";

const StyledSignUpButton = styled(Button)({
  backgroundColor: "#000000",
  color: "white",
  borderRadius: "10px",
  textTransform: "none",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    backgroundColor: "#808080",
  },
  marginTop: "1rem",
  backgroundColor: "black",
  color: "white",
  height: "55px", 
  fontSize: '1rem'
});

export default function AddTokenButton({ children, ...props }) {
  return (
    <StyledSignUpButton variant="contained" {...props}>
      {children}
    </StyledSignUpButton>
  );
}
