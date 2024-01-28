import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

// Use the same styling attributes for consistency
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  backgroundColor: theme.palette.background.paper,
  color: "#9F9F9C",
  fontSize: "0.875rem", 
  padding: "10px 26px",
  textTransform: "none",
  boxShadow: "none",
  border: "1px solid #CECECE",
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
  },
  "&:active": {
    boxShadow: "none",
  },
  "& .MuiButton-label": {
    color: "#9F9F9C",
  },
}));

export default function TVLButton({ onClick, text }) {
  return (
    <StyledButton variant="contained" onClick={onClick}>
      {text}
    </StyledButton>
  );
}
