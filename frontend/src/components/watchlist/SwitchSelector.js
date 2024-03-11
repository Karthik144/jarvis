import React from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: "transparent",
  color: "#000000",
  borderRadius: "12px",
  textTransform: "none",
  transition: "box-shadow 0.3s ease",
  border: "1px solid #000000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "1rem",
  "& .MuiSelect-select": {
    paddingLeft: "12px",
    paddingRight: "40px",
    paddingTop: "8px",
    paddingBottom: "8px",
    display: "flex",
    alignItems: "center",
  },
  "&:before, &:after": {
    border: "none",
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: "#000000",
    border: "1px solid #000000",
    boxShadow: "none",
  },
  boxShadow: "none",
  "& .MuiSvgIcon-root": {
    color: "#000000",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "none",
    boxShadow: "none",
  },
  "& .MuiInputLabel-root": {
    position: "absolute",
    top: "-6px", 
  },
}));


const SwitchSelector = ({ label, onChange, value, ...props }) => {
    
  return (
    <FormControl variant="standard">
      <InputLabel>{label}</InputLabel>
      <StyledSelect value={value} onChange={onChange}>
        <MenuItem value="momentum">Momentum List</MenuItem>
        <MenuItem value="yield">Yield List</MenuItem>
        <MenuItem value="watchlist">Watchlist</MenuItem>
      </StyledSelect>
    </FormControl>
  );
};

export default SwitchSelector;
