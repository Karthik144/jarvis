import * as React from "react";
import { DataGrid, GridFooter, GridFooterContainer } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { useRouter } from "next/router"; 
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import IconButton from "@mui/material/IconButton";


export default function WatchlistTable({ watchlistData, rawList, onSelectionChange }) {
  const router = useRouter(); 

  const [selectionModel, setSelectionModel] = React.useState([]);

  const handleSelectionChange = (newSelectionModel) => {
    setSelectionModel(newSelectionModel);
    console.log(newSelectionModel);

    // Call the callback prop with the new selection model
    if (onSelectionChange) {
      onSelectionChange(newSelectionModel);
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
    const csvData = convertToCSV(watchlistData);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "watchlist_data.csv");
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
      field: "currentPrice",
      headerName: "Current Price",
      type: "number",
      width: 130,
    },
    {
      field: "priceChange30",
      headerName: "%∆ Price (30d)",
      type: "number",
      width: 120,
    },
    {
      field: "priceChange60",
      headerName: "%∆ Price (60d)",
      type: "number",
      width: 120,
    },
    {
      field: "priceChange200",
      headerName: "%∆ Price (200d)",
      type: "number",
      width: 120,
    },
    {
      field: "volume",
      headerName: "Volume",
      type: "number",
      width: 130,
    },
    {
      field: "category",
      headerName: "Category",
      width: 160,
    },
    {
      field: "marketCap",
      headerName: "Market Cap",
      width: 130,
    },
    {
      field: "notes",
      headerName: "Notes",
      sortable: false,
      width: 150,
      renderCell: (params) => {
        const onClick = (e) => {
          e.stopPropagation(); 

          const row = params.row;
          const coinID = row.coinID;

          // Store the coinID and rawList in local storage
          localStorage.setItem("coinID", coinID);
          localStorage.setItem("rawList", JSON.stringify(rawList)); // Stringify rawList since it's a JSON object

          // Navigate to the notes page
          router.push("/notes");
        };

        return (
          <Button
            onClick={onClick}
            sx={{
              textTransform: "none",
            }}
          >
            View Notes
          </Button>
        );
      },
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
        rows={watchlistData}
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
