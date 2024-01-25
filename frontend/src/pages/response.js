import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, Paper } from "@mui/material";
import FollowUpQuestionBar from "../../../frontend/components/FollowUpQuestionBar";
import NotesIcon from "@mui/icons-material/Notes";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
// import FeeButton from "../../../frontend/components/FeeButton";
// import AmountTextField from "../../../frontend/components/AmountTextField";
// import CustomDatePicker from "../../../frontend/components/DatePicker"; 
// import OverlayText from "../../../frontend/components/OverlayText"; 
import Calculator from "../../../frontend/components/Calculator"; 
import { ScrollBox } from "react-scroll-box";

// MUI Date Picker Imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const markdownToHtml = (text) => {
  let html = text;
  // Convert Markdown headers (###) to HTML <h3> tags
  html = html.replace(/(?:^|\n)###\s?(.*?)(?=\n|$)/g, "<h3>$1</h3>");

  // Convert line breaks to <br>
  html = html.replace(/\n/g, "<br>");

  // Handle nested lists by replacing them with a placeholder before processing the top-level lists
  html = html.replace(
    /(\n\d+\..+?)(?=\n\d+)/g,
    (match) => `<!--list_placeholder${match}list_placeholder-->`
  );

  // Convert numbered lists to HTML ordered lists
  html = html.replace(/(?:^|\n)(\d+)\. /g, (match, p1, offset) => {
    // Only match numbers that start on a new line or the beginning of the string
    if (offset === 0 || html[offset - 1] === "\n") {
      return `<ol start="${p1}"><li>`;
    }
    return match; // Do not replace
  });
  html = html.replace(/<\/li><br>(\d+)\. /g, "<li>");
  html = html.replace(/<li>(.+?)<br>/g, "<li>$1</li>");
  html = html.replace(/<li>(.+?)<\/ol>/g, "<li>$1</li></ol>");
  html = html.replace(/<\/li><br>/g, "</li>");

  // Handle unordered lists
  html = html.replace(/(?:^|\n)[-+*]\s/g, "<ul><li>");
  html = html.replace(/<\/li><br>([-+*])\s/g, "<li>");
  html = html.replace(/<li>(.+?)<br>/g, "<li>$1</li>");
  html = html.replace(/<li>(.+?)<\/ul>/g, "<li>$1</li></ul>");
  html = html.replace(/<\/li><br>/g, "</li>");

  // Convert Markdown bold to HTML bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Restore the nested lists from the placeholders
  html = html.replace(/<!--list_placeholder/g, "");
  html = html.replace(/list_placeholder-->/g, "");

  // Replace the <br> tags with line breaks or paragraphs as needed
  html = html.replace(/<br>/g, "\n");
  html = html
    .trim()
    .split("\n\n")
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return html;
};

export default function Response() {
  const [responseText, setResponseText] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [threadId, setThreadId] = useState("");
  const [runId, setRunId] = useState("");

  const [selectedFee, setSelectedFee] = useState(null);
  const [showCalculatorUI, setShowCalcualtorUI] = useState(false); 

  const handleSubmit = async (query) => {
    console.log("handle submit called in response.js");
    // await fetchResponse(query);
    if (query === "Help me forecast my LP position?"){
      setShowCalcualtorUI(true); 
    }
  };

  async function fetchResponse(userQuery) {
    console.log("INSIDE FETCH RESPONSE");
    try {
      const response = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput: userQuery }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const formattedResponse = markdownToHtml(data.message);
      console.log("Formatted response:", formattedResponse);

      setResponseText(formattedResponse);
      setThreadId(data.threadId);
      setRunId(data.runId);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  }

  useEffect(() => {
    const userQuery = localStorage.getItem("userQuery");
    const processedQuery = userQuery ? userQuery.replace(/^"|"$/g, "") : "";
    setUserSearch(processedQuery);

  //   console.log("RIGHT BEFORE FETCH RESPONSE CALLED");
  //   fetchResponse(userQuery);
  const loremIpsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident`;
  setResponseText(loremIpsumText); 
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-start justify-between p-24">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Typography
          variant="h4"
          sx={{ textAlign: "left", pt: "70px", marginLeft: "50px" }}
        >
          {userSearch}
        </Typography>

        <Grid
          container
          alignItems="center"
          spacing={1}
          sx={{
            marginLeft: "50px",
            marginTop: "50px",
          }}
          className={!responseText ? "animate-pulse-slow" : ""}
        >
          <Grid item>
            <NotesIcon />
          </Grid>
          <Grid item>
            <Typography variant="h5" sx={{ fontWeight: "300" }}>
              Answer
            </Typography>
          </Grid>
        </Grid>

        <div style={{ overflow: "auto", maxHeight: "500px" }}>
          <div>
            {!responseText ? (
              <Box sx={{ width: 1200, marginLeft: "60px", marginTop: "15px" }}>
                <Skeleton />
                <Skeleton animation="wave" />
                <Skeleton animation={false} />
              </Box>
            ) : (
              <Box
                overflow="auto"
                paddingTop="20px"
                paddingBottom="20px"
                maxHeight="500px"
              >
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: "left",
                    marginLeft: "60px",
                    marginTop: "15px",
                    maxWidth: "1200px",
                  }}
                  dangerouslySetInnerHTML={{ __html: responseText }}
                />
              </Box>
            )}
          </div>

          {showCalculatorUI && (
            <Grid container spacing={2}>
              <Box
                sx={{ width: "100%", marginLeft: "-400px", marginTop: "50px" }}
              >
                <Calculator />
              </Box>
            </Grid>
          )}
        </div>

        <div
          style={{
            position: "fixed",
            bottom: 30,
            left: 0,
            right: 0,
            paddingBottom: "15px",
            paddingTop: "45px",
          }}
        >
          <FollowUpQuestionBar onSubmit={handleSubmit} />
        </div>
      </LocalizationProvider>
    </div>
  );
}
