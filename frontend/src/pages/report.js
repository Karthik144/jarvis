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
  const [reportText, setReportText] =
    useState(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ut sem tincidunt, fermentum nibh quis, tincidunt odio. In in laoreet elit. Aliquam efficitur, ipsum et commodo consectetur, mi urna pharetra arcu, sed ullamcorper mi augue auctor justo. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse faucibus rhoncus ex, vel suscipit mauris efficitur non. Nullam mattis commodo metus et viverra. Donec eget turpis dictum, volutpat velit eu, lobortis massa. Integer vulputate sagittis ex a mattis. Suspendisse pretium tincidunt mauris, et laoreet ligula tempor sit amet. Maecenas dolor lorem, semper et nulla sit amet, sodales mollis mi. Sed consectetur auctor ante, et mollis ex posuere a. Donec eget diam vitae est faucibus iaculis id sed risus. Donec non tempus turpis, sed vulputate massa. Pellentesque dictum luctus lectus sit amet venenatis.

Fusce non sodales magna. Duis mattis nisi ex, aliquet dignissim lacus placerat sed. Cras euismod pulvinar quam quis pellentesque. Suspendisse potenti. Vestibulum sed ex augue. Vivamus condimentum massa sed ex tristique iaculis. Morbi auctor ipsum vel leo egestas, in blandit enim efficitur. Suspendisse a ex convallis, auctor orci sit amet, sodales arcu.

Sed finibus nunc accumsan elit sodales, eget placerat neque hendrerit. Phasellus at eleifend dolor. Maecenas sed nisi rutrum libero fermentum fermentum et in quam. Ut porta turpis vitae erat lacinia gravida. Morbi pulvinar sem sed magna gravida lobortis. Nam posuere sed elit sit amet bibendum. Nulla at pulvinar leo. Proin ullamcorper orci nec fermentum feugiat. Vivamus laoreet scelerisque viverra. Praesent ligula lacus, volutpat non nulla et, eleifend molestie dolor. In enim mauris, ultricies fringilla elementum eget, ornare id quam. Maecenas est justo, iaculis at neque at, tincidunt suscipit turpis. Suspendisse ornare interdum ipsum ut porta. Aliquam vel tristique tortor. Aliquam suscipit quis mi non accumsan.

Vivamus pretium posuere odio vitae tincidunt. Sed eleifend semper lorem, in tincidunt lorem pellentesque a. Nulla quis erat non odio rutrum molestie. Donec quis placerat purus. Morbi non interdum ipsum. Sed blandit dolor vel pulvinar pretium. Aliquam luctus diam vel ipsum convallis iaculis. Vivamus rhoncus odio eu molestie elementum. Integer auctor malesuada eros. Aenean non pretium neque. In hac habitasse platea dictumst. Suspendisse at eros nibh.

Duis vitae risus quis nisi porttitor consequat. Quisque ut velit in nulla sollicitudin laoreet vitae tempus mauris. Donec sed est venenatis, porta purus vel, volutpat enim. Aliquam bibendum, orci nec viverra tincidunt, diam felis ornare massa, quis aliquam tellus magna et urna. Etiam sed ultrices augue. Integer accumsan vitae augue nec imperdiet. Vestibulum consectetur nibh posuere nunc congue, id sollicitudin quam feugiat. Vivamus volutpat ipsum mi, ac vestibulum enim placerat nec. Nunc bibendum, lectus scelerisque convallis convallis, lorem magna porta metus, vel blandit elit velit non justo. Sed dignissim nisl ut pulvinar consectetur. Fusce eu semper purus, non posuere velit. Pellentesque eu magna vitae elit vehicula dapibus.

Aliquam laoreet justo convallis sapien euismod, vitae fermentum turpis mollis. Nullam sed arcu tincidunt, volutpat ante at, convallis odio. Aenean elit mi, venenatis ac mi id, consequat efficitur urna. Nulla facilisi. Sed nec purus sodales odio tempor semper. Nam porta, velit a aliquet convallis, felis mi vehicula erat, tincidunt blandit augue dolor eu tellus. Quisque porttitor velit sem, finibus porta felis tempus vel. Fusce ultrices, tortor id condimentum mollis, nulla dolor posuere eros, commodo ullamcorper nulla risus eget odio. Donec euismod ante eu odio malesuada rhoncus.

Mauris volutpat est et mi dictum eleifend eu sit amet felis. Etiam nisi eros, dictum ut justo efficitur, sagittis rhoncus lacus. Duis erat enim, suscipit a eros quis, sodales sodales dolor. Nullam ullamcorper ipsum a nisi venenatis, vitae eleifend justo tincidunt. Nullam gravida consectetur ornare. Integer tristique posuere maximus. Sed aliquam suscipit condimentum. Pellentesque efficitur justo eget neque scelerisque posuere. Suspendisse potenti. Duis nec lorem risus.

Suspendisse tempor commodo semper. Praesent rhoncus dolor et vulputate rhoncus. Proin diam diam, pharetra sed nibh a, malesuada ornare magna. Donec et risus eget metus tristique hendrerit. Integer rhoncus sagittis mauris ut placerat. Donec vitae consectetur eros. Etiam nec ante at tellus blandit bibendum. Integer elementum posuere risus, et tincidunt odio finibus a. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nullam eleifend mauris sed lectus ornare posuere. Nunc porttitor, sapien et efficitur malesuada, eros elit aliquet nisi, ut lobortis justo magna blandit diam. Integer nisi dolor, egestas vehicula convallis ut, congue id felis. Vivamus vitae velit dolor. Donec mollis urna sit amet pulvinar porta.

In quis dictum augue, id rhoncus augue. Cras tempor aliquam fermentum. Cras nec ligula risus. Suspendisse dignissim justo nisl, id venenatis magna commodo et. Aliquam viverra a metus id auctor. Mauris semper lacinia varius. Ut enim dui, auctor rhoncus tristique sit amet, porttitor nec mauris. Etiam sit amet pellentesque lacus.

Integer feugiat velit lobortis elit tincidunt mattis. Donec ullamcorper accumsan tellus iaculis sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec sit amet augue vel lacus vehicula elementum id a quam. Aenean iaculis, lorem vel vehicula malesuada, ipsum dui interdum sem, ac finibus nisl lacus a arcu. Vestibulum et nibh gravida, sollicitudin orci at, mattis magna. Quisque consectetur ultrices turpis vitae tempus. Nullam ac libero ligula. Nunc ligula est, dignissim id suscipit sit amet, congue sit amet diam. Cras pretium est urna, in condimentum erat imperdiet id. Suspendisse potenti.`);
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
    // Replace ### headings with <h3>
    let htmlText = markdownText.replace(/### (.*$)/gim, '<h3>$1</h3>');

    // Replace ## headings with <h2>
    htmlText = htmlText.replace(/## (.*$)/gim, '<h2>$1</h2>');

    // Replace # headings with <h1>
    htmlText = htmlText.replace(/# (.*$)/gim, '<h1>$1</h1>');

    return htmlText;
  };

  // const getTokens = async () => {
  //   const reportQuery = localStorage.getItem("reportQuery");
  //   if (reportQuery) {
  //     const reportQueryObj = JSON.parse(reportQuery);
  //     console.log("REPORT QUERY OBJ:", reportQueryObj);
  //     return reportQueryObj;
  //   }
  //   return "";
  // };

  // const generateReport = useCallback(async () => {
  //   const tokenList = await getTokens();
  //   console.log('Tokens inside call back:', tokenList);
  //   if (tokenList) {
  //     const requestBody = { tokens: tokenList };
  //     console.log("Request Body:", requestBody);
  //     const completion = await complete(JSON.stringify(requestBody));
  //     if (!completion) throw new Error("Failed to generate report");

  //     // Convert Markdown in the completion text to HTML
  //     const reportInHTML = convertMarkdownToHTML(completion);
  //     console.log("COMPLETION:", completion);
  //     console.log("Converted Report:", reportInHTML);

  //     setReportText(reportInHTML);
  //   } else {
  //     console.log("No tokens found");
  //   }
  // }, [complete]);

  // useEffect(() => {
  //   generateReport();
  // }, [generateReport]);

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
