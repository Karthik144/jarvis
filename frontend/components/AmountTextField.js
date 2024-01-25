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
      borderColor: "primary.main",
    },
    backgroundColor: "#FCFCF9",
  },
});

export default function AmountTextField() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" component="label" sx={{ mb: 1 }}>
        Position Amount
      </Typography>
      <CustomTextField variant="outlined" placeholder="1000" />
    </Box>
  );
}
