import React from "react";
import {
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { styled } from "@mui/material/styles";

const CustomTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)", // light stroke
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.5)", // darker on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main", // color when the textfield is focused
    },
    backgroundColor: "#FCFCF9", // fill color
  },
});

const customDatePickerTheme = createTheme({
  palette: {
    primary: {
      main: "#03C988", 
      contrastText: "#000000", 
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
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
        },
      },
    },
  },
});

const CustomDatePicker = ({ selectedDate, setSelectedDate, limitOrder, title }) => {
  return (
    <ThemeProvider theme={customDatePickerTheme}>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{
          mb: 1,
          textAlign: "left",
          fontSize: "1rem",
          color: "text.primary",
        }}
      >
        Date
      </Typography>
      <DatePicker/>
    </ThemeProvider>
  );
};

export default CustomDatePicker;
