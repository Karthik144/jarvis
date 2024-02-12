import React from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  margin: theme.spacing(2),
  maxWidth: "275px",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[300]}`,
  boxShadow: "none",
}));

const StyledLabelPaper = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.primary, // Use primary text color
  background: theme.palette.background.default, // Use default background color
  borderRadius: "10px",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: "#fff",
  background: "#4CAF50",
  borderRadius: "20px",
  padding: "6px 16px",
  "&:hover": {
    background: "#388E3C",
  },
  startIcon: {
    color: "#fff",
  },
}));

export default function QuickAction({ onButtonClick, title, filterText }) {
  return (
    <StyledPaper square={false}>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{
          fontSize: "1.25rem",
        }}
      >
        {title}
      </Typography>
      {filterText !== null ? (
        <Stack direction="row" spacing={2}>
          {filterText.map((text, index) => (
            <StyledLabelPaper key={index} elevation={0}>
              <Typography>{text}</Typography>
              <TextField
                type="number"
                id={`filter-${index}`}
                name={`filter-${index}`}
                placeholder={`Enter a number for ${text}`}
                variant="outlined"
                size="small"
                sx={{ width: "100%", marginTop: 1 }}
              />
            </StyledLabelPaper>
          ))}
        </Stack>
      ) : null}

      <StyledButton
        variant="contained"
        sx={{ textTransform: "none" }}
        startIcon={<PlayArrowIcon />}
        onClick={onButtonClick}
      >
        Run
      </StyledButton>
    </StyledPaper>
  );
}
