
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { useCompletion } from "ai/react";
// const { generateReport } = require("./api/perplexity");

export default function Report() {
  const [reportText, setReportText] = useState("");
  const { complete } = useCompletion({
    api: "/api/completion",
  });

  const getTokens = async () => {
    const reportQuery = localStorage.getItem("reportQuery");
    if (reportQuery) {
      const reportQueryObj = JSON.parse(reportQuery);
      console.log("REPORT QUERY OBJ:", reportQueryObj);
      return reportQueryObj;
    }
    return "";
  };

  const generateReport = useCallback(async () => {
    const tokenList = await getTokens(); // Retrieve tokens from getTokens
    if (tokenList) {
      const requestBody = { tokens: tokenList };
      const completion = await complete(JSON.stringify(requestBody));
      if (!completion) throw new Error("Failed to generate report");

      const report = completion;
      console.log("COMPLETION:", completion); 
      setReportText(report);
    } else {
      console.log("No tokens found");
    }
  }, [complete]);

  useEffect(() => {
    generateReport(); // Call generateReport once the component is mounted
  }, [generateReport]); // Dependency array includes generateReport to ensure it's called when the function is available

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
            {reportText && <div>{reportText}</div>}

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
