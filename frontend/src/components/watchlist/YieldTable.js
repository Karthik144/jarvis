import * as React from "react";
import { DataGrid, GridFooter, GridFooterContainer } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { CSVLink } from 'react-csv'; 

export default function YieldTable({ yieldList }) {
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

  const renderScrollableCell = (params) => {
    const bands = params.value.split("-");
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {bands.map((band, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconButton
              size="small"
              onClick={(event) => copyToClipboard(band)}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <div style={{ minWidth: "70px" }}>
              {index === 0 ? "lower" : "upper"}
            </div>
            <div style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis" }}>{parseFloat(band).toFixed(4)}...</div>
          </div>
        ))}
      </div>
    );
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
    const csvData = convertToCSV(yieldList);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "yield_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const columns = [
    {
      field: "symbol",
      headerName: "Pool",
      width: 130,
    },
    {
      field: "pool_bands",
      headerName: "Bands",
      renderCell: renderScrollableCell,
      width: 200,
    },
    {
      field: "apyBase",
      headerName: "Base APY",
      type: "number",
      width: 120,
    },
    {
      field: "apyBase7d",
      headerName: "Base APY (7d)",
      type: "number",
      width: 120,
    },
    {
      field: "apyMean30d",
      headerName: "Mean APY (30d)",
      type: "number",
      width: 120,
    },
    {
      field: "volumeUsd7d",
      headerName: "Volume (7d)",
      type: "number",
      width: 130,
    },
    {
      field: "ratio",
      headerName: "Ratio",
      type: "number",
      width: 110,
    },
    {
      field: "predictedClass",
      headerName: "Prediction",
      width: 130,
    },
    {
      field: "chain",
      headerName: "Chain",
      width: 130,
    },
    {
      field: "pool_address",
      headerName: "Address",
      width: 110,
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
        rows={yieldList}
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
