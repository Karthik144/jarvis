import * as React from "react";
import { DataGrid, GridFooter, GridFooterContainer } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { CSVLink } from "react-csv"; 


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

  const convertToCSV = (data) => {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    for (const row of data) {
      const values = headers.map((header) => {
        const escaped = ("" + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(momentumList);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "momentum_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const CustomFooter = () => {
    return (
      <GridFooterContainer>
        <IconButton
          color="primary"
          onClick={downloadCSV}
          aria-label="export to csv"
        >
          <FileDownloadOutlinedIcon />
        </IconButton>
        <GridFooter />
      </GridFooterContainer>
    );
  };

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
        components={{
          Footer: CustomFooter, 
        }}
      />
    </div>
  );
}
