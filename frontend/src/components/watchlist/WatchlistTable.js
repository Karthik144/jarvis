import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";

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
    width: 150, 
  },
  {
    field: "marketCap",
    headerName: "Market Cap",
    width: 130,
  },
];


export default function WatchlistTable({ watchlistData }) {
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={watchlistData}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </div>
  );
}
