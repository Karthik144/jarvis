import React from "react";
import Button from "@mui/material/Button";
import { styled, keyframes } from "@mui/material/styles";

const StyledSignUpButton = styled(Button)({
  backgroundColor: "#000000",
  color: "white",
  borderRadius: "20px",
  textTransform: "none",
  transition: 'box-shadow 0.3s ease',
  "&:hover": {
    backgroundColor: "#808080",
  },
});


export default function SignUpButton({ children, ...props }) {
  return (
    <StyledSignUpButton variant="contained" {...props}>
      {children}
    </StyledSignUpButton>
  );
}