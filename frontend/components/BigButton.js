import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const StyledBigButton = styled(Button)({
  backgroundColor: "#9F9F9C",
  color: "white",
  width: "345px",
  height: "40px",
  borderRadius: "20px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#1233A3",
  },
});

export default function BigButton({ children, ...props }) {
  return (
    <StyledBigButton variant="contained" {...props}>
      {children}
    </StyledBigButton>
  );
}
