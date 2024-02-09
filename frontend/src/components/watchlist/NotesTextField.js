import React, { useState } from "react";
import { Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";

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
      padding: "8px 14px",
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

const CustomMultilineTextField = styled(CustomTextField)({
  "& .MuiInputBase-inputMultiline": {
    height: "auto",
  },
});

export default function NotesTextField({ title, defaultValue, onChange }) {
  const [value, setValue] = useState(`• ${defaultValue || ""}`);

  const handleChange = (event) => {
    setValue(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const newValue = value + "\n• ";
      setValue(newValue);

      if (onChange) {
        onChange(newValue);
      }
    }
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
        {title}
      </Typography>
      <CustomMultilineTextField
        multiline
        rows={4}
        value={value}
        variant="outlined"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </Box>
  );
}
