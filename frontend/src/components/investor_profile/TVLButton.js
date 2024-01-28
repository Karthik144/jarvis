import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  backgroundColor: theme.palette.background.paper,
  color: "#000000", 
  fontSize: "1rem",
  padding: "10px 25x",
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
    color: "#000000", // Ensure label text is also black
  },
}));

const formatNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num;
};

export default function TVLButton({ onClick, minValue, maxValue }) {

  const displayValue = `${formatNumber(minValue)} - ${formatNumber(
    maxValue
  )}`;

  return (
    <StyledButton variant="contained" onClick={onClick}>
      {displayValue}
    </StyledButton>
  );
}
