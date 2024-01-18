import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";

export default function PromptBar({ onSubmit }) {

    const [inputValue, setInputValue] = React.useState("");

    const handleInputChange = (event) => {
      console.log("HANDLE INPUT CHANGED CALL IN BAR"); 
      setInputValue(event.target.value);
    };

    const handleFormSubmit = (event) => {
      event.preventDefault(); // Prevent the default form submission behavior
      console.log("HANDLE FORM SUBMIT CALLED");
      onSubmit(inputValue);
    };

    return (
      <Box
        component="form"
        onSubmit={handleFormSubmit}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pt: 5,
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          fullWidth
          id="outlined-helperText"
          placeholder="How can I help with your research?"
          value={inputValue}
          onChange={handleInputChange} 
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  aria-label="send"
                  sx={{ position: "absolute", bottom: 8, right: 8 }}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
            style: { height: "8rem", position: "relative" }, // Added position relative for absolute positioning of the button
          }}
          sx={{
            maxWidth: "930px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              height: "100%",
              alignItems: "flex-start", // Aligns the input contents to the top
              border: "1px solid #CECECE", // Adds the outline
              backgroundColor: "#FCFCF9", // Set the background color here
            },
            "& .MuiOutlinedInput-input": {
              fontSize: "1.2rem", // Change the font size here
              paddingTop: "20px", // Adjust top padding to position the placeholder
              paddingLeft: "20px", // Adjust left padding as needed
              paddingRight: "48px", // Make room for the button
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none", // Ensures there is no notched outline
            },
            "& .MuiOutlinedInput-root.Mui-focused": {
              borderColor: "#CECECE", // Maintains the border color when focused
            },
            "& .MuiSvgIcon-root": {
              color: "#a0a0a0",
            },
          }}
        />
      </Box>
    );
}
