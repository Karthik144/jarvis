import React from "react";
import { Typography, Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

const CustomTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "black", 
    },
    backgroundColor: "#FCFCF9",
    "& .MuiOutlinedInput-input": {
      padding: "14px 14px",
      fontSize: "0.875rem",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
    },
  },
  "& .MuiInputLabel-outlined": {
    transform: "translate(14px, 14px) scale(1)",
  },
  "& .MuiInputBase-input": {
    height: "auto",
  },
});

export default function AmountTextField({ depositAmount, setDepositAmount }) {

  const handleChange = (event) => {
    setDepositAmount(event.target.value);
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography
        component="label"
        sx={{
          fontSize: "1rem",
          pb: "5px",
        }}
      >
        Position Amount
      </Typography>
      <CustomTextField
        variant="outlined"
        placeholder="1000"
        value={depositAmount}
        onChange={handleChange}
      />
    </Box>
  );
}
