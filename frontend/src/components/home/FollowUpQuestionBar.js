import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";

export default function FollowUpQuestionBar({ onSubmit }) {
  
  const [inputValue, setInputValue] = React.useState("");
  
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

  const handleFormSubmit = (event) => {
    event.preventDefault();
    onSubmit(inputValue);
  }

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        fullWidth
        id="outlined-helperText"
        placeholder="Ask a follow-up..."
        value={inputValue}
        onChange={handleInputChange}
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="submit" aria-label="send">
                <SendIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          maxWidth: "800px",
          "& .MuiOutlinedInput-root": {
            borderRadius: "30px",
            backgroundColor: "#FCFCF9", // Fill color
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)", // Drop shadow 
            "& fieldset": {
              borderColor: "#CECECE", // Default border color
            },
            "&:hover fieldset": {
              borderColor: "#CECECE", // Border color on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#CECECE", // Border color on focus
            },
          },
          "& .MuiInputLabel-root": {
            color: "#a0a0a0", 
          },
          "& .MuiSvgIcon-root": {
            color: "#a0a0a0", 
          },
        }}
      />
    </Box>
  );
}
