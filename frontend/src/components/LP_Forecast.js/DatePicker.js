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
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)", 
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

const customDatePickerTheme = createTheme({
  palette: {
    primary: {
      main: "#000000", 
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#FCFCF9",
            "& .MuiOutlinedInput-input": {
              padding: "14px 14px",
              fontSize: "0.875rem",
            },
            "& .MuiSvgIcon-root": {
              fontSize: "1rem",
            },
          },
        },
      },
    },
  },
});

const CustomDatePicker = ({ selectedDate, setSelectedDate }) => {
  return (
    <ThemeProvider theme={customDatePickerTheme}>
      <Typography
        variant="subtitle1"
        sx={{
          textAlign: "left",
          fontSize: "1rem",
          color: "text.primary",
          paddingBottom: "1px"
        }}
      >
        Position Deadline(Optional)
      </Typography>
      <DatePicker
        value={selectedDate}
        onChange={setSelectedDate}
        textField={(params) => <CustomTextField {...params} />}
      />
    </ThemeProvider>
  );
};

export default CustomDatePicker;
