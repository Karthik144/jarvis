import React from "react";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete"; 
import { styled } from "@mui/material/styles";

const StyledDeleteButton = styled(Button)({
  backgroundColor: "#FF0000", 
  color: "white",
  borderRadius: "8px",
  textTransform: "none",
  transition: "box-shadow 0.3s ease",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "#B22222", 
  },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
});

const DeleteButton = ({ children, ...props }) => {
  return (
    <StyledDeleteButton variant="contained" {...props}>
      {children}
    </StyledDeleteButton>
  );
};

export default DeleteButton;
