import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function MomentumTable({ momentumList }) {

  const [selectionModel, setSelectionModel] = React.useState([]);

  const handleSelectionChange = (newSelectionModel) => {
    setSelectionModel(newSelectionModel);
    console.log(selectionModel);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log("Text copied to clipboard");
      },
      (err) => {
        console.error("Failed to copy text: ", err);
      }
    );
  };

  const renderAddressCell = (params) => {

    const handleCopyClick = (event, value) => {
      // Stop the event from propagating to the row
      event.stopPropagation();
      // Copy the value to the clipboard
      copyToClipboard(value);
    };

    // Check if the address is present
    if (params.value) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconButton
            size="small"
            onClick={(event) => handleCopyClick(event, params.value)}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </div>
      );
    } else {
      // If no address is present, then just show n/a for now
      return <span>n/a</span>;
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 120,
    },
    {
      field: "momentum_score_current",
      headerName: "Momentum Score",
      type: "number",
      width: 130,
    },
    {
      field: "current_price",
      headerName: "Current Price",
      type: "number",
      width: 130,
    },
    {
      field: "price_change_percentage_24h",
      headerName: "%∆ Price (24h)",
      type: "number",
      width: 120,
    },
    {
      field: "price_change_percentage_30d_in_currency",
      headerName: "%∆ Price (30d)",
      type: "number",
      width: 120,
    },
    {
      field: "market_cap",
      headerName: "Market Cap",
      type: "number",
      width: 130,
    },
    {
      field: "total_supply",
      headerName: "Total Supply",
      type: "number",
      width: 120,
    },
    {
      field: "total_volume",
      headerName: "Total Volume",
      type: "number",
      width: 130,
    },
    {
      field: "ethereum_address",
      headerName: "ETH Address",
      width: 130,
      renderCell: renderAddressCell,
    },
    {
      field: "arbitrum_one_address",
      headerName: "ARB Address",
      width: 130,
      renderCell: renderAddressCell,
    },
  ];

  return (
    <div style={{ height: 450, width: "100%" }}>
      <DataGrid
        rows={momentumList}
        columns={columns}
        onRowSelectionModelChange={handleSelectionChange}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 15]}
        checkboxSelection
      />
    </div>
  );
}
