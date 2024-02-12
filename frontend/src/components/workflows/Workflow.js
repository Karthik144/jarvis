import React from "react";
import { fetchWatchlist } from "@/pages/dashboard";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/router.js";
import Box from "@mui/material/Box";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
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
  maxWidth: '275px',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[300]}`, 
  boxShadow: "none", 
}));

const StyledLabelPaper = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: "white",
  background: "black",
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

export default function Workflow({ title, prompts, type, user }) {
  const router = useRouter();

  
  const handleWorkflowButtonClick = async () => {
    console.log("Workflow button was pressed!");
    if (type === "Watchlist") {
      if (user) {
        await fetchWatchlist();
        const userQuery = {
          query: prompts[0],
          watchlist: true,
        };
        localStorage.setItem("userQuery", JSON.stringify(userQuery));
        router.push("/response");
      }
    }
    else {
      const userQuery = {
        query: prompts[0],
        watchlist: false,
      };
      localStorage.setItem("userQuery", JSON.stringify(userQuery));
      router.push("/response");
    }
  };

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
      <Typography
        variant="body2"
        sx={{
          fontSize: "1rem",
          color: "text.secondary",
          paddingBottom: "1em",
        }}
      >
        {type}
      </Typography>
      <Stack direction="column" spacing={2}>
        {prompts.map((prompt, index) => (
          <StyledLabelPaper key={index} elevation={0}>
            {prompt}
          </StyledLabelPaper>
        ))}
      </Stack>
      <StyledButton
        variant="contained"
        sx={{ textTransform: "none" }}
        startIcon={<PlayArrowIcon />}
        onClick={handleWorkflowButtonClick}
      >
        Run
      </StyledButton>
    </StyledPaper>
  );
}