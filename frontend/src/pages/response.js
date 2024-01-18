import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import FollowUpQuestionBar from "../../../frontend/components/FollowUpQuestionBar";
import NotesIcon from "@mui/icons-material/Notes";
import { main as callAssistant } from "../backend/Assistant"; 
import { printMessagesFromThread as getLastMessage } from "../backend/Assistant"; 
import Grid from "@mui/material/Grid";

const markdownToHtml = (text) => {
  let html = text;

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
  const [threadId, setThreadId] = useState("");
  const [runId, setRunId] = useState("");

  // useEffect(() => {
  //   const sessionIDs = localStorage.getItem("sessionIDs");
  //   if (sessionIDs) {
  //     const ids = JSON.parse(sessionIDs);
  //     setThreadId(ids[0]);
  //     setRunId(ids[1]);
  //     // Clear the item from local storage
  //     localStorage.removeItem("sessionIDs");
  //   }
  // }, []);

  useEffect(() => {
    const userQuery = localStorage.getItem("userQuery");

    async function fetchResponse() {
      console.log("INSIDE FETCH RESPONSE");
      try {
        // Call the main function from Assistant.js and wait for the response
        // const response = await callAssistant(userQuery);
const response = `
Bitcoin is a decentralized digital currency, also known as a cryptocurrency, that was invented in 2008 by an unknown person or group of people using the name Satoshi Nakamoto. It was released as open-source software in 2009. Bitcoin is the first successful implementation of a distributed cryptocurrency, a concept proposed by b-money, and BitGold which date back to the late 1990s and early 2000s.

Bitcoin enables peer-to-peer transactions between users without the need for a central authority or intermediaries. Transactions are verified by network nodes through cryptography and recorded on a public ledger called a blockchain. Bitcoin can be exchanged for other currencies, products, and services.

Some key characteristics and features of Bitcoin include:

1. Decentralization: Bitcoin operates on a decentralized network of computers where each participant (node) has an equal say in the administration of the network.

2. Limited Supply: The total supply of Bitcoin is capped at 21 million coins, making it a deflationary currency as opposed to traditional fiat currencies that can be printed without limit.

3. Anonymity: While transactions are stored publicly on the blockchain, the identities of the people involved in transactions are encrypted.

4. Security: The Bitcoin network is secured by miners who use powerful computer equipment to solve complex mathematical problems. This process also introduces new bitcoins into the system, in a process known as mining.

5. Transparency: Every transaction on the Bitcoin network is publicly recorded on the blockchain, which ensures that all coin transfers are both transparent and permanent.

6. Immutability: Once a Bitcoin transaction is validated and added to the blockchain, it is nearly impossible to reverse, preventing fraud and double-spending.

7. Divisibility: Bitcoin is highly divisible, with the smallest unit being the satoshi (one hundred millionth of a bitcoin), which enables micro-transactions that traditional electronic money cannot perform.

Bitcoin has gained widespread attention and adoption since its inception and has influenced the development of hundreds of other cryptocurrencies, collectively known as altcoins. It is used for a variety of purposes, from investment and speculation to remittances and payments, but it is also controversial due to its volatility, its use in illicit transactions, and concerns over its environmental impact due to the energy-intensive mining process.
`;
        const formattedResponse = markdownToHtml(response);
        console.log("RESPONSE INSIDE THISSSS:", response);
        setResponseText(formattedResponse);
      } catch (error) {
        console.error("Error fetching response:", error);
      }
    }
    console.log("RIGHT BEFORE FETCH RESPONSE CALLED");
    // fetchResponse();
  }, []); 

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <Typography
        variant="h4"
        sx={{ textAlign: "left", pt: "100px", marginLeft: "50px" }}
      >
        RSI Analysis on Bitcoin
      </Typography>

      <Grid
        container
        alignItems="center"
        spacing={1}
        sx={{
          marginLeft: "50px",
          marginTop: "50px",
          ...(responseText === "" && {
            animation: "pulse 2s infinite",
          }),
        }}
        className={!responseText ? "animate-pulse" : ""}
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

      <div style={{ position: "fixed", bottom: 35, left: 0, right: 0 }}>
        <FollowUpQuestionBar />
      </div>
    </div>
  );
}
