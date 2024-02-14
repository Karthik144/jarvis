import React from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";

const StyledSignUpButton = styled(Button)({
  backgroundColor: "transparent",
  color: "#000000", 
  borderRadius: "20px",
  textTransform: "none",
  transition: "box-shadow 0.3s ease",
  padding: "4px 16px",
  border: "1px solid #000000", 
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: "transparent", 
    color: "#000000", 
    border: "1px solid #000000", 
    boxShadow: "none", 
  },
});

const SwitchButton = ({ children, ...props }) => {
  return (
    <StyledSignUpButton variant="contained" {...props}>
      {children}
    </StyledSignUpButton>
  );
};

export default SwitchButton;
