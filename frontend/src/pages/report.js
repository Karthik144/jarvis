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
  const [reportText, setReportText] = useState(`# WBTC

## Summary
WBTC (Wrapped Bitcoin) is an ERC20 token that represents one bitcoin (BTC). It allows users to transfer BTC onto Ethereum blockchain and interact with decentralized applications (dApps) without having to move their funds from the original BTC wallet.

## Applications
1. Interoperability: Allows seamless integration of Bitcoin into Ethereum ecosystem, enabling users to access various DeFi protocols.
2. Security: Provides additional security by allowing users to store their cryptocurrency in cold storage while still being able to participate in DeFi activities.
3. Flexibility: Enables traders to trade both BTC and other ERC20 tokens within the same platform.

## Updates
1. Partnership with BitGo: To ensure secure custody solutions for institutional investors holding large amounts of WBTC.
2. Integration with Uniswap V3: Facilitating trading of WBTC along with other assets on this popular decentralized exchange.

# TRAC

## Summary
TRAC (Traceable Asset Protocol) is a blockchain project aimed at facilitating the tracking and verification of physical goods using digital tokens. Each token represents ownership of a specific real-world asset.

## Applications
1. Supply Chain Management: Enhances transparency and traceability in supply chains by providing immutable records of product origin, movement, and authenticity.
2. Art Market: Helps authenticate artworks and track their provenance through the creation of unique digital identities for each piece.
3. Real Estate: Streamlines property transactions by creating tamper-proof records of ownership and transaction history.

## Updates
1. Strategic partnership with Avery Dennison: Introducing RFID technology to enhance traceability capabilities across various industries.
2. Launch of TRACx Platform: An end-to-end solution for managing and verifying high-value assets using digital tokens.

# MNT

## Summary
MNT (Moneta) is a stablecoin pegged to multiple fiat currencies including USD, CAD, JPY, CHF, GBP, and EUR. Its goal is to provide users with a reliable store of value that can be easily exchanged for these traditional currencies.

## Applications
1. Cross-Border Payments: Reduces costs associated with international money transfers by eliminating intermediaries and offering instant settlements.
2. Remittances: Simplifies sending money back home for migrant workers by converting local wages into stable currency units.
3. Hedging: Offers protection against volatility in unstable markets by maintaining a constant value relative to major world currencies.

## Updates
1. Integration with Binance Smart Chain: Expanding access to MNT by integrating it with another leading blockchain ecosystem.
2. Listing on Bitrue Exchange: Increasing liquidity and market reach for MNT holders.

# BEAM

## Summary
BEAM (Bytom Evolution And Modernization) is a privacy-focused blockchain designed for building smart economy applications. It utilizes MimbleWimble technology, which provides enhanced confidentiality features.

## Applications
1. Decentralized Finance: Supports development of privacy-preserving financial dApps such as lending platforms and stablecoins.
2. Digital Identity: Offers a secure method for managing personal data and identity verification without revealing sensitive information.
3. Supply Chain & Logistics: Enables efficient tracking and authentication of goods using encrypted data blocks.

## Updates
1. Mainnet 4.0 Upgrade: Implementing new features like Schnorr signatures and Lightning Network compatibility.
2. Collaboration with Confidential Assets: Developing tools for issuing and managing private assets on the BEAM network.

# CHZ

## Summary
CHZ (Chilliz) is a utility token that powers Socios.com, a fan engagement platform where users can purchase, collect, and trade fan tokens representing their favorite sports teams or influencers.

## Applications
1. Fan Engagement: Allows fans to influence team decisions through voting on polls and surveys using CHZ tokens.
2. Merchandise: Facilitates exclusive access to merchandise and experiences for token holders.
3. Gamification: Introduces elements of gaming and competition to enhance fan engagement.

## Updates
1. Partnership with UFC: Bringing fan tokens for various UFC fighters to the Socios.com platform.
2. Launch of Fan Token Sale for Paris Saint-Germain: Allowing fans to purchase and trade PSG-themed fan tokens.

# CRV

## Summary
CRV (Curve DAO Token) is a governance token used within the Curve Finance ecosystem, a decentralized exchange focused on stablecoins and automated market-making.

## Applications
1. Stablecoin Trading: Facilitates efficient trading of various stablecoins by optimizing liquidity pools.
2. Yield Farming: Enables users to earn rewards by providing liquidity to the platform.
3. Decentralized Governance: Allows token holders to vote on proposals to improve the Curve protocol.

## Updates
1. Integration with Ethereum Layer 2 Solutions: Improving scalability and reducing gas fees for CRV transactions.
2. Launch of CRVv2: Upgrading the token with new features like staking and improved governance mechanisms.

# ALT

## Summary
ALT (Altair) is an Ethereum-based decentralized finance platform that aims to provide access to decentralized lending and borrowing services. It utilizes an automated market-making system for interest rates.

## Applications
1. Lending & Borrowing: Connects borrowers with lenders in a trustless manner, reducing counterparty risk.
2. Automated Risk Pricing: Uses smart contracts to dynamically adjust interest rates based on market conditions.
3. Multiple Collateral Types: Accepts various forms of collateral beyond just ETH or ERC20 tokens.

## Updates
1. Partnership with Compound: Bridging ALT's lending pools with Compound's existing infrastructure.
2. Introduction of Multi-Collateral Support: Allowing users to pledge different types of assets as collateral.

# MANA

## Summary
MANA (Decentraland) is a virtual reality platform powered by the Ethereum blockchain where users can create, experience, and monetize content and applications.

## Applications
1. Virtual World Building: Lets users design and develop immersive experiences within the Decentraland metaverse.
2. Land Ownership: Grants users exclusive rights to parcels of land they purchase with MANA tokens.
3. Economic Opportunities: Provides avenues for earning revenue through rentals, events, games, and more.

## Updates
1. Launch of Decentraland Metaverse: Bringing the vision of a fully functional virtual world to life.
2. Marketplace Platform: Enabling buying, selling, and trading of virtual items and services within the Decentraland ecosystem.

# GMX

## Summary
GMX (Gemini Money Exchange) is a decentralized exchange built on Solana Blockchain focusing on fast, cheap, and scalable trading. It offers spot and perpetual futures trading with leverage up to 50x.

## Applications
1. High-Speed Trading: Leverages Solana's speed and low fees to enable rapid order execution.
2. Futures Trading: Allows users to speculate on price movements without owning the underlying asset.
3. Leverage Trading: Empowers traders to amplify their returns with margin financing.

## Updates
1. Integration with Serum DEX: Combining forces to offer a comprehensive suite of trading products on Solana.
2. Expansion of Token Listings: Continuously adding support for new assets to cater to diverse user needs.

# AXS

## Summary
AXS (Axie Infinity Shards) is a governance token used within Axie Infinity, a blockchain-based trading and battling game featuring collectible creatures called Axies.

## Applications
1. Game Economy: Acts as a key component in driving demand for Axie NFTs and influencing game mechanics.
2. Staking & Rewards: Encourages long-term engagement by rewarding token holders with passive income.
3. Decision Making: Permits token holders to vote on proposals affecting the future direction of the game.

## Updates
1. Release of Ronin Sidechain: Improving scalability and performance for Axie Infinity transactions.
2. Integration with DeFi Platforms: Exploring opportunities to integrate AXS with other decentralized finance projects.`);
  const { complete } = useCompletion({
    api: "/api/completion",
  });

  const exportToPDF = async () => {
    const element = document.getElementById("content-to-export");

    const html2pdfModule = await import("html2pdf.js");

    // html2pdfModule.default(element, {
    //   margin: 0.5,
    //   filename: "momentum_report.pdf",
    //   image: { type: "jpeg", quality: 0.98 },
    //   autoPaging: "text", 
    //   html2canvas: { scale: 2 },
    //   pagebreak: { mode: ["avoid-all", "css", "legacy"] }, 
    //   jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    // });

    html2pdfModule.default(element, {
      margin: 0.5,
      filename: "momentum_report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: true,
        dpi: 192,
        letterRendering: true,
      },
      pagebreak: { mode: "avoid-all" }, // Adjusted to handle page breaks
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
        // Convert other Markdown elements
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

  function test() {
    const reportInHTML = convertMarkdownToHTML(reportText);
    // console.log("Converted Report:", reportInHTML);
    setReportText(reportInHTML);
  }

  useEffect(() => {
    test();
  }, []);

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
