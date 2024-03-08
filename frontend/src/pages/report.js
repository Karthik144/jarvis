
import React, { useEffect, useState } from "react";
import { Box, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { useChat } from "ai/react";
// const { generateReport } = require("./api/perplexity");

export default function Report() {
  const [reportText, setReportText] = useState("");
  const { messages, setMessages } = useChat();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) {
      const reportQuery = localStorage.getItem("reportQuery");

      if (reportQuery) {
        console.log("INSIDE REPORT QUERY");
        const reportQueryObj = JSON.parse(reportQuery);
        setMessages(reportQueryObj); 
        console.log("REPORT QUERY OBJ:", reportQueryObj); 
        console.log("Messages in useEffect:", messages); 
      }

      // const syntheticEvent = { preventDefault: () => {} };
      // handleSubmit(syntheticEvent);

      setInitialLoad(false); // Ensure this only runs once
    }
  }, [initialLoad]);

  // useEffect(() => {
  //   const reportQuery = localStorage.getItem("reportQuery");

  //   if (reportQuery) {
  //     console.log("INSIDE REPORT QUERY");
  //     const reportQueryObj = JSON.parse(reportQuery);
  //     fetchReport(reportQueryObj);
  //   }
  // }, []);

  async function fetchReport(messages) {
    console.log("Fetch report called");
    const report = await generateReport(messages);
    console.log("REPORT TEXT:", report);
    setReportText(report);
  }

  return (
    <div className="flex min-h-screen flex-col items-start justify-between p-24">
      <Grid container direction="column" style={{ paddingLeft: "50px" }}>
        <Typography
          variant="h4"
          sx={{ textAlign: "left", pt: "70px", marginLeft: "60px" }}
        >
          Tokens with High Momentum
        </Typography>

        <div style={{ overflow: "auto", maxHeight: "60vh" }}>
          <div>
            {/* {!reportText ? (
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
                  dangerouslySetInnerHTML={{ __html: reportText }}
                />
              </Box>
            )} */}
            {messages.map((m) => (
              <div key={m.id}>
                {m.role === "user" ? "User: " : "AI: "}
                {m.content}
              </div>
            ))}

            {/* <form onSubmit={handleSubmit}>
              <input
                value={input}
                placeholder="Say something..."
                onChange={handleInputChange}
              />
            </form> */}
          </div>
        </div>
      </Grid>
    </div>
  );
}
