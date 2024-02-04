import React from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";

const StyledSignUpButton = styled(Button)({
  backgroundColor: "#000000",
  color: "white",
  borderRadius: "8px",
  textTransform: "none",
  transition: "box-shadow 0.3s ease",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "#808080",
  },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
});

const AddButton = ({ children, ...props }) => {
  return (
    <StyledSignUpButton variant="contained" {...props}>
      {children}
      <AddIcon />
    </StyledSignUpButton>
  );
};

export default AddButton;
