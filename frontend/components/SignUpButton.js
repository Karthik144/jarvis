import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const StyledSignUpButton = styled(Button)({
  backgroundColor: "#1640D6",
  color: "white",
  borderRadius: "20px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#1233A3",
  },
});

export default function SignUpButton({ children, ...props }) {
  return (
    <StyledSignUpButton variant="contained" {...props}>
      {children}
    </StyledSignUpButton>
  );
}
