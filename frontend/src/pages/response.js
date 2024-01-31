import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, Paper } from "@mui/material";
import FollowUpQuestionBar from "../components/home/FollowUpQuestionBar";
import NotesIcon from "@mui/icons-material/Notes";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Calculator from "../components/LP_Forecast.js/Calculator"; 
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
  const [followUpText, setFollowUpText] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [threadId, setThreadId] = useState("");
  const [runId, setRunId] = useState("");
  const [showCalculatorUI, setShowCalcualtorUI] = useState(false); 
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "You are a helpful crypto research assistant.",
    },
    {
      role: "system",
      content: `When necessary, use the Tavily Search Function to investigate tokenomics, applications, and latest updates for a specific token, ensuring concise responses under 175 words unless more detail is requested. Maintain information density, avoiding filler content. Append 'crypto' to queries for optimized search results. Cite all sources and avoid redundancy.`,
    },
    {
      role: "system",
      content: `List insurance options for protocols as needed, using bullet points. Provide context only upon request.`,
    },
    {
      role: "system",
      content: `Analyze sentiment using the Twitter Sentiment Analysis function. Summarize key findings in bullet points, ensuring brevity and density. Include Tweet links for reference. Expand details upon request. Trigger this function for mentions of Twitter, social media, or related topics.`,
    },
    {
      role: "system",
      content: `Identify low beta, high growth crypto tokens using the function. Initially list 10; call function for 10 more upon request. For each, list APY, APY Base, TVL USD, AVL PCT 7D, APY 30D, APY Mean 30D, and beta value in bullets. Contextualize only if asked.`,
    },
  ]);

  const [selectedFee, setSelectedFee] = useState(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const addMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // const handleSubmit = async (query) => {
  //   console.log("handle submit called in response.js");
  //   await fetchResponse(query);
  //   if (query === "Help me forecast my LP position"){
  //     setShowCalcualtorUI(true); 
  //   }
  // };

  const handleSubmit = async (query) => {
    console.log("handle submit called in response.js");

    const newUserMessage = {
      role: "user",
      content: query,
    };

    setResponseText("");
    setShowCalcualtorUI(false);

    setMessages([newUserMessage]);

    setPulseAnimation(true);
    
    setFollowUpText("");

    await fetchResponse(query);

    if (query === "Help me forecast my LP position") {
      setShowCalcualtorUI(true);
    }
    setPulseAnimation(false);

  };


  async function fetchResponse(userQuery) {
    console.log("INSIDE FETCH RESPONSE");
    try {
      console.log(userQuery);
      // console.log(newUserMessage); 
      console.log("MESSAGES INSIDE FETCH:", messages); 

      const processedQuery = userQuery.replace(/^"|"$/g, "");

      const structuredMessage = {
        role: "user",
        content: processedQuery,
      }

      const requestBody = {
        userInput: userQuery,
        defaultMessages: [...messages, structuredMessage],
      };

      console.log('MESSAGES REQUEST BODY', requestBody.messages); 

      // const response = await fetch("http://localhost:3001/analyze", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ userInput: userQuery }),
      // });

      const response = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      addMessage({
        role: "system",
        content: data.message,
      });
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
    // setUserSearch('Does pendle have insurance?');

    console.log("RIGHT BEFORE FETCH RESPONSE CALLED");
    fetchResponse(userQuery);
    // const loremIpsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident`;
    // setResponseText(loremIpsumText); 
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-start justify-between p-24">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container direction="column" style={{ paddingLeft: "50px" }}>
          <Typography variant="h4" sx={{ textAlign: "left", pt: "70px", marginLeft: '60px' }}>
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

          <div style={{ overflow: "auto", maxHeight: "65vh" }}>
            <div>
              {!responseText ? (
                <Box
                  sx={{ width: 1200, marginLeft: "60px", marginTop: "15px" }}
                >
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
                  sx={{
                    width: "100%",
                    marginLeft: "-415px",
                    paddingTop: "50px",
                  }}
                >
                  <Calculator />
                </Box>
              </Grid>
            )}
          </div>

          <div
              style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              padding: "35px 0",
            }}
          >
            <FollowUpQuestionBar onSubmit={handleSubmit} followUpText={followUpText} setFollowUpText={setFollowUpText} />
         </div>
        <div
          className={`pulse-animation ${pulseAnimation ? "animate-pulse-slow" : ""}`}
          style={{
            position: "fixed",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "10px",
            padding: "10px",
            display: pulseAnimation ? "block" : "none",
          }}
        >
        </div>
        </Grid>
      </LocalizationProvider>
    </div>
  );
}
