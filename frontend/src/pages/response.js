import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, Paper } from "@mui/material";
import FollowUpQuestionBar from "../components/home/FollowUpQuestionBar";
import { runConversation } from "./api/api";
import NotesIcon from "@mui/icons-material/Notes";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Calculator from "../components/LP_Forecast.js/Calculator";
import { ScrollBox } from "react-scroll-box";
import axios from "axios";

// MUI Date Picker Imports
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const markdownToHtml = (text) => {
  let html = text;

  // Convert Markdown H1 headers (#) to HTML <h1> tags
  html = html.replace(/(?:^|\n)#\s?(.*?)(?=\n|$)/g, "<h1>$1</h1>");

  // Convert Markdown H2 headers (##) to HTML <h2> tags
  html = html.replace(/(?:^|\n)##\s?(.*?)(?=\n|$)/g, "<h2>$1</h2>");

  // Convert Markdown H3 headers (###) to HTML <h3> tags
  html = html.replace(/(?:^|\n)###\s?(.*?)(?=\n|$)/g, "<h3>$1</h3>");

  // Convert Markdown H4 headers (####) to HTML <h4> tags
  html = html.replace(/(?:^|\n)####\s?(.*?)(?=\n|$)/g, "<h4>$1</h4>");

  // Convert Markdown H5 headers (#####) to HTML <h5> tags
  html = html.replace(/(?:^|\n)#####\s?(.*?)(?=\n|$)/g, "<h5>$1</h5>");

  // Convert Markdown H6 headers (######) to HTML <h6> tags
  html = html.replace(/(?:^|\n)######\s?(.*?)(?=\n|$)/g, "<h6>$1</h6>");

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
  const [showCalculatorUI, setShowCalculatorUI] = useState(false);
  const [tokenPair, setTokenPair] = useState(false);
  const [contractAddresses, setContractAddresses] = useState({
    tokenOneAddress: "",
    tokenTwoAddress: "",
  });

  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "You are a helpful crypto research assistant.",
    },
    {
      role: "system",
      content:
        "Important: When creating the momentum report, call the getTopMomentumScores func to get the list of tokens then use the symbols in this list to make multiple function calls to Tavily Search function to summarize the token, understand its applications, and provide any updates.",
    },
    {
      role: "system",
      content:
        "Upon a request for correlation analysis of watchlist tokens, immediately calculate and present the price correlation coefficients for each token pair, alongside their names. Classify each pair as 'high', 'moderate', or 'low' correlation based on these values. Include all details in a single, comprehensive response without delay or reference to future completion. Avoid using external tools like predict_LP or tavilySearch; the analysis must be manual and fully detailed within your response.",
    },
    {
      role: "system",
      content:
        "Initiate the 'Momentum List Report' generation by invoking the getTopMomentumScores function. This function will return each token's historical momentum scores, current momentum score, search data on the token's summary, and search data on the token's updates. Create a detailed report for these 10 tokens. For each token, list the current momentum score, historical momentum scores (w/o brackets), summary of what the token is about (don't include price data in the summary), and recent token updates (non price related). Do not return a response until you have completed the requested task for each of the 10 tokens.",
    },
    {
      role: "system",
      content:
        "Identify low beta, high growth crypto tokens using the available function. Initially list 10; call function for 10 more upon request. For each, list APY, APY Base, TVL USD, AVL PCT 7D, APY 30D, APY Mean 30D, and beta value in bullets. Do not include any other extra info unless specifically requested.",
    },

    {
      role: "system",
      content: `Call the filterByAPY function when user needs to filter by base APY and 30D APY. Initially list 10; call function for 10 more upon request. For each, list APY, APY Base, TVL USD, AVL PCT 7D, APY 30D, APY Mean 30D, and beta value in bullets. Do not include any other extra info other than what was specified before. Contextualize only if asked.`,
    },
    {
      role: "system",
      content: `Only call the predict_LP function when user needs to estimate the liqudity pool (LP) range. Do not call it to perform correlation analysis. Return a JSON object with the contract addresses of the token, which is already returned by the function.`,
    },
    {
      role: "system",
      content:
        "Use the Tavily Search Function only for investigating applications and latest updates for specific tokens. This function is not to be used for correlation analysis between watchlist tokens. Responses should be concise, under 175 words unless more detail is requested, and maintain information density without redundancy. Append 'crypto' to queries for optimized search results.",
    },
    {
      role: "system",
      content:
        "When asked about insurance, list insurance options for crypto protocols as needed, using bullet points. Provide context only upon request.",
    },
  ]);


  const [pulseAnimation, setPulseAnimation] = useState(false);

  const addMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSubmit = async (query) => {
    console.log("handle submit called in response.js");

    const newUserMessage = {
      role: "user",
      content: query,
    };

    setResponseText("");
    setUserSearch(query); 
    setShowCalculatorUI(false);

    setMessages([newUserMessage]);

    setPulseAnimation(true);

    setFollowUpText("");

    await fetchResponse(query);

    if (query === "Help me forecast my LP position") {
      setShowCalculatorUI(true);
    }
    setPulseAnimation(false);
  };

  function isJsonObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  async function fetchResponse(query) {
    try {

      const structuredMessage = {
        role: "user",
        content: query,
      }
      const allMessages = [...messages, structuredMessage]
      console.log("ALL MESSAGES:", allMessages); 
      const assistantResponse = await runConversation(query, allMessages);
      console.log('RESPONSE', assistantResponse);

      if (isJsonObject(assistantResponse)){
        console.log('INSIDE IS JSON OBJECT'); 
        // Check if response contains token addresses
        if (
          "tokenOneAddress" in assistantResponse &&
          "tokenTwoAddress" in assistantResponse &&
          "tokenPair" in assistantResponse
        ) {
            // Update state with contract addresses
            setContractAddresses({
              tokenOneAddress: assistantResponse.tokenOneAddress,
              tokenTwoAddress: assistantResponse.tokenTwoAddress,
            });

            setTokenPair(assistantResponse.tokenPair);

            console.log(
              "Contract addresses:",
              assistantResponse.tokenOneAddress,
              assistantResponse.tokenTwoAddress
            );

            console.log("Token Pair:", assistantResponse.tokenPair);

            setResponseText("lp");
            setShowCalculatorUI(true);
          } 

      } else {
        // Handle standard message response
        addMessage({
          role: "system",
          content: assistantResponse,
        });

        const formattedResponse = markdownToHtml(assistantResponse);
        setResponseText(formattedResponse);
      }
    } catch (error) {
      console.error("Error during conversation:", error);
    }
  }

  useEffect(() => {
    const userQuery = localStorage.getItem("userQuery");
    if (userQuery){
      console.log('INSIDE USER QUERY');
      const userQueryObj = JSON.parse(userQuery);

      // Process query to remove extra quotes 
      let processedQuery;
      if (userQueryObj.query) {
        console.log("INSIDE .QUERY"); 
        processedQuery = userQueryObj.query.replace(/^"|"$/g, "");
        console.log("processed query:", processedQuery); 
        setUserSearch(processedQuery);
      }
      else {
        console.log("INSIDE NORMAL QUERY")
        processedQuery = userQuery.replace(/^"|"$/g, "");
        setUserSearch(processedQuery);
      }
      

      // Check if query is for watchlist comparison 
      if (userQueryObj.watchlist){
        const savedWatchlist = localStorage.getItem("watchlist");
        const watchlist = savedWatchlist ? JSON.parse(savedWatchlist) : [];

        let watchlistDetails = watchlist
          .map((item) => {
            return `${item.name} (Current Price: ${item.currentPrice}, 30D Change: ${item.priceChange30}, 60D Change: ${item.priceChange60}, 200D Change: ${item.priceChange200}, Volume: ${item.volume}, Market Cap: ${item.marketCap})`;
          })
          .join("; ");

        processedQuery += ` | Watchlist Analysis: ${watchlistDetails}`;

      } 
      fetchResponse(processedQuery);
    }

  }, []);

  return (
    <div className="flex min-h-screen flex-col items-start justify-between p-24">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container direction="column" style={{ paddingLeft: "50px" }}>
          <Typography
            variant="h4"
            sx={{ textAlign: "left", pt: "70px", marginLeft: "60px" }}
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

          <div style={{ overflow: "auto", maxHeight: "60vh" }}>
            {responseText !== "lp" ? (
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
            ) : (
              <>
                {showCalculatorUI && (
                  <Grid container spacing={2}>
                    <Box
                      sx={{
                        width: "100%",
                        marginLeft: "-415px",
                        paddingTop: "50px",
                      }}
                    >
                      <Calculator
                        contract_addrs={contractAddresses}
                        tokenPair={tokenPair}
                      />
                    </Box>
                  </Grid>
                )}
              </>
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
            <FollowUpQuestionBar
              onSubmit={handleSubmit}
              followUpText={followUpText}
              setFollowUpText={setFollowUpText}
            />
          </div>
          <div
            className={`pulse-animation ${
              pulseAnimation ? "animate-pulse-slow" : ""
            }`}
            style={{
              position: "fixed",
              bottom: "100px",
              left: "50%",
              transform: "translateX(-50%)",
              borderRadius: "10px",
              padding: "10px",
              display: pulseAnimation ? "block" : "none",
            }}
          ></div>
        </Grid>
      </LocalizationProvider>
    </div>
  );
}
