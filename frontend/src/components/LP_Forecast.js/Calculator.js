import React, { useState, useEffect } from "react";
import { Paper, Typography, Box } from "@mui/material";
import FeeButton from "./FeeButton";
import AmountTextField from "./AmountTextField";
import CustomDatePicker from "./DatePicker";
import OverlayText from "./OverlayText";
import CalcButton from "./CalcButton";
import Grid from "@mui/material/Grid";
import { predict_LP } from "@/scripts/predict_LP";

export default function Calculator({ contract_addrs, tokenPair }) {
  const fees = ["0.01%", "0.05%", "0.3%", "1%"];
  const [doneCalculation, setDoneCalculation] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null)
  const [depositAmount, setDepositAmount] = useState('');
  const [dateDeadline, setDateDeadline] = useState('');
  
  const [result, setResult] = useState({});

  const handleCalcDone = async() => {
    //Call Typescript script
    // setDepositAmount(1000)
    let numericDepositAmount; 
    if (depositAmount !== ''){
      numericDepositAmount = parseFloat(depositAmount);
    } else {
      numericDepositAmount = 1000
    }
    let numericConvertedFee; 
    if (selectedFee){
      const feeNumber = parseFloat(selectedFee.replace("%", ""));
      const basisPoints = feeNumber * 100;
      numericConvertedFee = basisPoints * 100;
    } else {
      numericConvertedFee = 500; 
    }

    const LP_params = {
      chain: 'arbitrum',
      // chain: "eth", // For testing
      chainId: 42161,
      // chainId: 1, // For testing
      token0: contract_addrs.tokenOneAddress, //WETH
      // token0: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", // ARB - For testing
      token1: contract_addrs.tokenTwoAddress, //USDC
      // token1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC - For testing
      feeTier: numericConvertedFee,
      depositAmt: numericDepositAmount,
    };
    console.log("LP PARAMS", LP_params)
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
        height: doneCalculation ? "470px" : "300px",
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
                <AmountTextField
                  depositAmount={depositAmount}
                  setDepositAmount={setDepositAmount}
                />
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
                <Grid container spacing={1} direction="column">
                  <Grid item>
                    {/* <OverlayText text={`Token 0 Amt: ${result.token0_amt.toFixed(2)}`} /> */}
                    <OverlayText
                      text={`${
                        tokenPair.split(" / ")[0]
                      } Amt: ${result.token0_amt.toFixed(2)}`}
                    />
                  </Grid>

                  <Grid item>
                    {/* <OverlayText
                      text={`Token 1 Amt: ${result.token1_amt.toFixed(2)}`}
                    /> */}
                    <OverlayText
                      text={`${
                        tokenPair.split(" / ")[1]
                      } Amt: ${result.token1_amt.toFixed(2)}`}
                    />
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
                      <Typography sx={{ fontSize: "1.25rem" }}>
                        ${+parseFloat(result.lower_band).toFixed(2)}
                      </Typography>
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
                      <Typography sx={{ fontSize: "1.25rem" }}>
                        ${+parseFloat(result.upper_band).toFixed(2)}
                      </Typography>
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
                <AmountTextField
                  depositAmount={depositAmount}
                  setDepositAmount={setDepositAmount}
                />{" "}
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