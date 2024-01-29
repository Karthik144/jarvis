import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const CustomButton = styled(Button)(({ theme, selected }) => ({
  boxShadow: "none",
  textTransform: "none",
  fontSize: 16,
  padding: "6px 12px",
  lineHeight: 1.5,
  borderRadius: 10,
  fontFamily: "sans-serif",
  border: `1px solid ${theme.palette.grey[300]}`,
  color: selected ? theme.palette.common.white : theme.palette.grey[800], 
  backgroundColor: selected
    ? theme.palette.common.black
    : theme.palette.common.white,
  "&:hover": {
    backgroundColor: selected
      ? theme.palette.common.black
      : theme.palette.grey[200],
    borderColor: selected
      ? theme.palette.common.black
      : theme.palette.grey[300],
    color: selected ? theme.palette.common.white : theme.palette.grey[800],
  },
  "&:active": {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  // Remove focus styles or adjust as needed
  "&:focus": {
    boxShadow: selected ? "none" : `0 0 0 0.2rem ${theme.palette.primary.main}`,
  },
}));

export default function FeeButton({ feeAmount, selected }) {
  return (
    <CustomButton variant="outlined" selected={selected}>
      {feeAmount}
    </CustomButton>
  );
}
