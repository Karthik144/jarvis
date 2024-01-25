import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const CustomButton = styled(Button)(({ theme, selected }) => ({
  // Common style...
  boxShadow: "none",
  textTransform: "none",
  fontSize: 16,
  padding: "6px 12px",
  lineHeight: 1.5,
  borderRadius: 10,
  fontFamily: "sans-serif",
  border: `1px solid ${theme.palette.grey[300]}`,
  color: selected ? theme.palette.common.white : theme.palette.common.black,
  backgroundColor: selected
    ? theme.palette.common.black
    : theme.palette.common.white,
  "&:hover": {
    backgroundColor: selected
      ? theme.palette.common.black
      : theme.palette.grey[200],
    borderColor: theme.palette.grey[300],
  },
  "&:active": {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  "&:focus": {
    boxShadow: `0 0 0 0.2rem ${theme.palette.primary.main}`,
  },
}));

export default function FeeButton({ feeAmount, selected }) {
  return (
    <CustomButton variant="outlined" selected={selected}>
      {feeAmount}
    </CustomButton>
  );
}
