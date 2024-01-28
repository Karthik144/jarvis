import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputBase from '@mui/material/InputBase'; 
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; 

const StyledFormControl = styled(FormControl)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10, 
    backgroundColor: "#EFECEC", 
    color: "#9F9F9C",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: "1px solid #CECECE", 
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      border: "1px solid #CECECE", 
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "1px solid #CECECE",
    },
  },
  "& .MuiSvgIcon-root": {
    color: "#9F9F9C", 
  },
});

// Custom InputBase component for the placeholder
const BootstrapInput = styled(InputBase)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(2),
  },
  '& .MuiInputBase-input': {
    borderRadius: 10,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #CECECE',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      borderRadius: 10,
      borderColor: '#CECECE',
    },
  },
}));

export default function Selector({ type }) {
  const [protocol, setProtocol] = React.useState("");
  const [chain, setChain] = React.useState("");
  const handleChange = (event) => {
    if (type==='protocol'){
      setProtocol(event.target.value);
    } else {
      setChain(event.target.value); 
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <StyledFormControl fullWidth variant="outlined">
        <Select
          value={protocol}
          onChange={handleChange}
          displayEmpty
          input={<BootstrapInput />}
          inputProps={{ "aria-label": "Without label" }}
          placeholder={type === "protocol" ? "Protocol" : "Chain"}
        >
          <MenuItem value={type === "protocol" ? "uniswap" : "arbitrum"}>
            {type === "protocol" ? "Uniswap" : "Arbitrum"}
          </MenuItem>
          <MenuItem value={type === "protocol" ? "sushiswap" : "ethereum"}>
            {type === "protocol" ? "SushiSwap" : "Ethereum"}
          </MenuItem>
          <MenuItem value={type === "protocol" ? "pancakeswap" : "optimism"}>
            {type === "protocol" ? "PancakeSwap" : "Optimism"}
          </MenuItem>
        </Select>
      </StyledFormControl>
    </Box>
  );
}
