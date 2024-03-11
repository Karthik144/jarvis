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
      margin: 0.3,
      filename: "momentum_report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    });
  };

  const convertMarkdownToHTML = (markdownText) => {
    // Replace ### headings with <h3>
    let htmlText = markdownText.replace(/### (.*$)/gim, '<h3>$1</h3>');

    // Replace ## headings with <h2>
    htmlText = htmlText.replace(/## (.*$)/gim, '<h2>$1</h2>');

    // Replace # headings with <h1>
    htmlText = htmlText.replace(/# (.*$)/gim, '<h1>$1</h1>');

    return htmlText;
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

  const generateReport = useCallback(async () => {
    const tokenList = await getTokens();
    console.log('Tokens inside call back:', tokenList);
    if (tokenList) {
      const requestBody = { tokens: tokenList };
      console.log("Request Body:", requestBody);
      const completion = await complete(JSON.stringify(requestBody));
      if (!completion) throw new Error("Failed to generate report");

      // Convert Markdown in the completion text to HTML
      const reportInHTML = convertMarkdownToHTML(completion);
      console.log("COMPLETION:", completion);
      console.log("Converted Report:", reportInHTML);

      setReportText(reportInHTML);
    } else {
      console.log("No tokens found");
    }
  }, [complete]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  return (
    <div className="min-h-screen flex flex-col justify-between p-24">
      <div
        style={{ textAlign: "right", paddingRight: "60px", paddingTop: "30px" }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={exportToPDF}
          sx={{ height: "36px" }}
        >
          Export to PDF
        </Button>
      </div>

      <div id="content-to-export" style={{ padding: "0 60px" }}>
        {" "}
        <Typography variant="h4" sx={{ pt: "40px" }}>
          Tokens with High Momentum
        </Typography>
        <div style={{ overflow: "auto", maxHeight: "60vh", marginTop: "20px" }}>
          {!reportText ? (
            <Box sx={{ maxWidth: "1200px" }}>
              <Skeleton />
              <Skeleton animation="wave" />
              <Skeleton animation={false} />
            </Box>
          ) : (
            <Box pt="20px" pb="20px" sx={{ maxWidth: "1200px" }}>
              <Typography
                variant="body1"
                dangerouslySetInnerHTML={{ __html: reportText }}
              />
            </Box>
          )}
        </div>
      </div>
    </div>
  );


}
