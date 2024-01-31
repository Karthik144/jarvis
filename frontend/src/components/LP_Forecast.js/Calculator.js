import React, { useState, useEffect } from "react";
import { Paper, Typography, Box } from "@mui/material";
import FeeButton from "./FeeButton";
import AmountTextField from "./AmountTextField";
import CustomDatePicker from "./DatePicker";
import OverlayText from "./OverlayText";
import CalcButton from "./CalcButton";
import Grid from "@mui/material/Grid";
import { predict_LP } from "@/scripts/predict_LP";

export default function Calculator() {
  const fees = ["0.01%", "0.05%", "0.3%", "1%"];
  const [doneCalculation, setDoneCalculation] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null)
  const [depositAmount, setDepositAmount] = useState('');
  const [dateDeadline, setDateDeadline] = useState('');
  
  const [result, setResult] = useState({});

  const handleCalcDone = async() => {
    //Call Typescript script
    setDepositAmount(1000)
    const LP_params = {
      chain: 'eth',
      chainId: 1,
      token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', //WETH
      token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', //USDC
      feeTier: 500,
      depositAmt: depositAmount,
    }
    const script_result = await predict_LP(LP_params);
    setResult(script_result)
    //Set output UI

    setDoneCalculation((prevState) => !prevState); // Toggle the state
  };

  const handleSelectFee = (fee) => {
      setSelectedFee(fee)
      console.log(selectedFee)
  }

  const handleDepositAmountChange = (event) => {
      setDepositAmount(event.target.value);
  }

  const handleDateDeadlineChange = (date) => {
      setDateDeadline(date);
  }

  useEffect(() => {
      console.log("Selected Fee:", selectedFee);
  }, [selectedFee]);
    

  return (
    <Box
      sx={{
        width: "470px",
        height: doneCalculation ? "415px" : "300px",
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
        {doneCalculation ? (
          <>
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
            <Typography style={{ fontSize: "2rem" }}>Coming Soon</Typography>

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
                    <OverlayText text={`Token 0 Amt: ${result.token0_amt}`}/>
                  </Grid>

                  <Grid item>
                    <OverlayText text={`Token 1 Amt: ${result.token1_amt}`} />
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
                      <Typography sx={{ fontSize: "1.25rem" }}>${+(parseFloat(result.lower_band).toFixed(2))}</Typography>
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
                      <Typography sx={{ fontSize: "1.25rem" }}>${+(parseFloat(result.upper_band).toFixed(2))}</Typography>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item sx={{ pt: 2, pb: 2 }}>
              <CalcButton onClick={handleCalcDone} type="recalculate" />
            </Grid>
          </>
        ) : (
          <>
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

            <Grid item sx={{ pt: 2, pb: 2 }}>
              <CalcButton onClick={handleCalcDone} type="calculate" />
            </Grid>
          </>
        )}
      </Paper>
    </Box>
  );
}