import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import FeeButton from "./FeeButton";
import AmountTextField from "./AmountTextField";
import CustomDatePicker from "./DatePicker";
import OverlayText from "./OverlayText"; 
import Grid from "@mui/material/Grid";


export default function Calculator({ selectedFee, handleSelectFee }) {
  const fees = ["0.01%", "0.05%", "0.3%", "1%"];

  return (
    <Box
      sx={{
        width: "515px",
        height: "400px",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={1}
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "#FFFFFF",
          padding: { xs: 2, sm: 3 },
          color: "text.primary",
          borderRadius: "16px",
          border: "1px solid #CECECE",
        }}
      >
        <Typography>Select Fee Tier</Typography>

        <Grid
          container
          spacing={2}
          justifyContent="left"
          alignItems="left"
          sx={{ pt: 2 }}
        >
          {fees.map((fee, index) => (
            <Grid item key={index}>
              <FeeButton
                feeAmount={fee}
                selected={selectedFee === fee}
                onClick={() => handleSelectFee(fee)}
              />
            </Grid>
          ))}
        </Grid>

        <Grid
          container
          spacing={2}
          justifyContent="left"
          alignItems="left"
          sx={{ pt: 2 }}
        >
          <Grid item>
            <AmountTextField />
          </Grid>
          <Grid item>
            <CustomDatePicker />
          </Grid>
        </Grid>

        <Typography sx={{ pt: 2 }}>Estimated Fees</Typography>
        <Typography style={{ fontSize: "2rem" }}>$3.61</Typography>

        <Grid
          container
          spacing={8}
          justifyContent="left"
          alignItems="left"
          sx={{ pt: 2 }}
        >
          <Grid item>
            <Typography>Position Breakdown</Typography>
            <Grid container spacing={2}>
              <Grid item>
                <OverlayText text="ETH: 0.80953" />
              </Grid>

              <Grid item>
                <OverlayText text="USDC: 1226.18" />
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <Typography>Range</Typography>
            <Grid container spacing={2}>
              <Grid item>
                <div style={{ textAlign: "left", fontWeight: "bold" }}>
                  <Typography
                    sx={{
                      paddingTop: "10px",
                      fontSize: "0.85rem",
                      color: "#9F9F9C",
                    }}
                  >
                    Min Price
                  </Typography>
                  <Typography sx={{ fontSize: "1.25rem" }}>2100</Typography>
                </div>{" "}
              </Grid>
              <Grid item>
                <div style={{ textAlign: "left", fontWeight: "bold" }}>
                  <Typography
                    sx={{
                      paddingTop: "10px",
                      fontSize: "0.85rem",
                      color: "#9F9F9C",
                    }}
                  >
                    Max Price
                  </Typography>
                  <Typography sx={{ fontSize: "1.25rem" }}>2130</Typography>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
