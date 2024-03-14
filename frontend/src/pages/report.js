"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Box, Paper } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
// import html2pdf from "html2pdf.js";
import Stack from "@mui/material/Stack";
import { useCompletion } from "ai/react";
import Button from "@mui/material/Button";
import dynamic from "next/dynamic";
const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

export default function Report() {
  const [reportText, setReportText] = useState("");
  const { complete } = useCompletion({
    api: "/api/completion",
  });

  const exportToPDF = async () => {
    const element = document.getElementById("content-to-export");

    // Dynamically import the html2pdf function
    const html2pdfModule = await import("html2pdf.js");

    // Use the default export of the module, which should be the function you want
    html2pdfModule.default(element, {
      margin: 0.5,
      filename: "momentum_report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    });
  };

  const convertMarkdownToHTML = (markdownText) => {
    // Initialize an empty string for the HTML text
    let htmlText = "";

    // Split the Markdown text into lines
    const lines = markdownText.split("\n");

    // Variable to track whether we are currently building an ordered list
    let inOrderedList = false;

    lines.forEach((line) => {
      // Check if the line starts with a number followed by a dot (numbered list item)
      if (line.match(/^\d+\./)) {
        // If we are not already in an ordered list, start one
        if (!inOrderedList) {
          htmlText += "<ol>";
          inOrderedList = true;
        }
        // Remove the number and dot from the start of the line, trim it, and wrap it in <li> tags
        htmlText += `<li>${line.replace(/^\d+\.\s*/, "")}</li>`;
      } else {
        // If we were in an ordered list but the current line is not a list item, close the ordered list
        if (inOrderedList) {
          htmlText += "</ol>";
          inOrderedList = false;
        }
        // Convert other Markdown elements (headings) as before
        if (line.startsWith("### ")) {
          htmlText += `<h3>${line.substring(4)}</h3>`;
        } else if (line.startsWith("## ")) {
          htmlText += `<h2>${line.substring(3)}</h2>`;
        } else if (line.startsWith("# ")) {
          htmlText += `<h1>${line.substring(2)}</h1>`;
        } else {
          // For lines that are not part of an ordered list or a heading, just add them as paragraphs
          htmlText += `<p>${line}</p>`;
        }
      }
    });

    // If the last line was part of an ordered list, close the list
    if (inOrderedList) {
      htmlText += "</ol>";
    }

    return htmlText;
  };

  // function test() {
  //   const reportInHTML = convertMarkdownToHTML(reportText);
  //   // console.log("Converted Report:", reportInHTML);
  //   setReportText(reportInHTML);
  // }

  // useEffect(() => {
  //   test();
  // }, []);

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
        <div style={{ overflow: "auto", marginTop: "20px" }}>
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
