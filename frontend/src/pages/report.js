"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Box, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import html2pdf from "html2pdf.js";
import Stack from "@mui/material/Stack";
import { useCompletion } from "ai/react";
import Button from "@mui/material/Button";

export default function Report() {
  const [reportText, setReportText] = useState("");
  const { complete } = useCompletion({
    api: "/api/completion",
  });

  const exportToPDF = () => {
    const element = document.getElementById("content-to-export");
    html2pdf(element, {
      margin: 1,
      filename: "exported_content.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    });
  };

  const getTokens = async () => {
    const reportQuery = localStorage.getItem("reportQuery");
    if (reportQuery) {
      const reportQueryObj = JSON.parse(reportQuery);
      console.log("REPORT QUERY OBJ:", reportQueryObj);
      return reportQueryObj;
    }
    return "";
  };

  // const generateReport = useCallback(async () => {
  //   const tokenList = await getTokens(); 
  //   console.log('Tokens inside call back:', tokenList); 
  //   if (tokenList) {
  //     const requestBody = { tokens: tokenList };
  //     console.log("Request Body:", requestBody); 
  //     const completion = await complete(JSON.stringify(requestBody));
  //     if (!completion) throw new Error("Failed to generate report");

  //     const report = completion;
  //     console.log("COMPLETION:", completion); 
  //     setReportText(report);
  //   } else {
  //     console.log("No tokens found");
  //   }
  // }, [complete]);

  // useEffect(() => {
  //   generateReport(); 
  // }, [generateReport]); 

  return (
    <div
      id="content-to-export"
      className="min-h-screen flex flex-col justify-between p-24"
    >
      <Grid container justifyContent="space-between" alignItems="flex-start">
        <Grid item>
          <Typography variant="h4" sx={{ pt: "70px", ml: "60px" }}>
            Tokens with High Momentum
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToPDF}
            sx={{ mt: "70px", mr: "60px", height: "36px" }} // Adjusted height here
          >
            Export to PDF
          </Button>
        </Grid>
      </Grid>

      <div style={{ overflow: "auto", maxHeight: "60vh" }}>
        <div>
          {!reportText ? (
            <Box sx={{ width: 1200, ml: "60px", mt: "15px" }}>
              <Skeleton />
              <Skeleton animation="wave" />
              <Skeleton animation={false} />
            </Box>
          ) : (
            <Box overflow="auto" pt="20px" pb="20px" maxHeight="500px">
              <Typography
                variant="body1"
                sx={{
                  textAlign: "left",
                  ml: "60px",
                  mt: "15px",
                  maxWidth: "1200px",
                }}
                dangerouslySetInnerHTML={{ __html: reportText }}
              />
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}
