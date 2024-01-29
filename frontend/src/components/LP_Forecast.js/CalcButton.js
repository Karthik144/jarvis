import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)({
  backgroundColor: "#000000",
  color: "white",
  borderRadius: "20px",
  textTransform: "none",
  width: "100%",
  height: "50px",
  fontSize: "1.25rem",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    backgroundColor: "#808080",
  },
});

export default function CalcButton({ type, onClick }) {
  return (
    <StyledButton variant="contained" onClick={onClick}>
      {type === 'calculate' ? 'Calculate' : 'Recalculate'}
    </StyledButton>
  );
}
