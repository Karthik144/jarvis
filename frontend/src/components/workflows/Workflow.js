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
  width: "100%", 
  maxWidth: "600px", 
  minWidth: "275px", 
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[300]}`,
  boxShadow: "none",
}));

// const StyledLabelPaper = styled(Paper)(({ theme }) => ({
//   ...theme.typography.body2,
//   padding: theme.spacing(1),
//   textAlign: "center",
//   color: "white",
//   background: "black",
//   borderRadius: "10px",
// }));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: "black",
  backgroundColor: "transparent",
  border: "2px solid #CECECE",
  borderRadius: "10px",
  padding: theme.spacing(0.5),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  textTransform: "none",
  "&:hover": {
    backgroundColor: theme.palette.action.hover, 
    boxShadow: `0 2px 4px 0 ${theme.palette.grey[300]}`, 
  },
  "& .MuiButton-startIcon": {
    color: "#0D9276",
    marginRight: theme.spacing(0.75),
  },
  boxShadow: "none",
}));

const CirclePaper = styled(Paper)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: 25,
  height: 25,
  borderRadius: "50%",
  backgroundColor: "black",
  boxShadow: "none", 
});

const StyledEditButton = styled(Button)({
  backgroundColor: "#000000",
  color: "white",
  borderRadius: "20px",
  textTransform: "none",
  transition: "box-shadow 0.3s ease",
  padding: "4px 16px", 
  fontSize: "0.875rem", 
  "&:hover": {
    backgroundColor: "#808080",
  },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const CircleText = styled(Typography)({
  color: "white", 
  fontWeight: "semibold", 
});


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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            fontSize: "1.75rem",
          }}
        >
          {title}
        </Typography>

        <StyledEditButton>Edit</StyledEditButton>
      </Box>

      <Typography
        variant="body2"
        sx={{
          fontSize: "1.25rem",
          color: "text.secondary",
          paddingBottom: "1em",
        }}
      >
        {type}
      </Typography>
      <Stack direction="column" spacing={2}>
        {prompts.map((prompt, index) => (
          <Stack direction="row" spacing={2} sx={{ paddingLeft: "5px" }}>
            <CirclePaper elevation={4}>
              <CircleText>{index + 1}</CircleText>
            </CirclePaper>

            <Typography>{prompt}</Typography>
          </Stack>
        ))}
      </Stack>
      <StyledButton
        variant="contained"
        sx={{ textTransform: "none" }}
        startIcon={<PlayArrowIcon sx={{ fontSize: "1.5rem" }} />}
        onClick={handleWorkflowButtonClick}
      >
        Run Workflow
      </StyledButton>
    </StyledPaper>
  );
}