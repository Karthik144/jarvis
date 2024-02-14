import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";

export default function MomentumTable({ momentumList }) {

  const [selectionModel, setSelectionModel] = React.useState([]);

  const handleSelectionChange = (newSelectionModel) => {
    setSelectionModel(newSelectionModel);
    console.log(selectionModel);
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
