import React from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";

const StyledSignUpButton = styled(Button)({
  backgroundColor: "transparent",
  color: "#000000",
  borderRadius: "12px",
  textTransform: "none",
  transition: "box-shadow 0.3s ease",
  padding: "0px 6px",
  border: "1px solid #000000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "0.75rem", // Reduced font size for smaller text
  "&:hover": {
    backgroundColor: "transparent",
    color: "#000000",
    border: "1px solid #000000",
    boxShadow: "none",
  },
  boxShadow: "none",
});

const SwitchButton = ({ children, ...props }) => {
  return (
    <StyledSignUpButton variant="contained" {...props}>
      {children}
    </StyledSignUpButton>
  );
};

export default SwitchButton;
