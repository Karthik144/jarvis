import React from "react";
import { Paper, Typography, Box } from "@mui/material";

export default function OverlayTypography({ text }) {
  return (
    <Box position="relative" display="inline-flex" justifyContent="center" sx={{ paddingTop: '10px'}}>
      <Paper
        elevation={0} 
        sx={{
          borderRadius: "50px", 
          p: "6px 10px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#EEEEE9", 
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.primary", 
          }}
        >
          {text}
        </Typography>
      </Paper>
    </Box>
  );
}