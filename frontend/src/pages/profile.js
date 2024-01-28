import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import FolderIcon from "@mui/icons-material/Folder";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Selector from "../components/investor_profile/Selector";
import TVLButton from "../components/investor_profile/TVLButton";
import ActionButton from "../components/investor_profile/ActionButton";
import { styled } from "@mui/material/styles";

function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    })
  );
}

export default function Profile() {
  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const handleMinChange = (event) => {
    setMinValue(event.target.value);
  };

  const handleMaxChange = (event) => {
    setMaxValue(event.target.value);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const listItemStyle = {
    py: 3,
    display: "flex",
    alignItems: "center",
    minHeight: 55,
  };

  const listItemTextStyle = {
    my: 0,
    mx: 0,
    textAlign: "left",
  };

  return (
    <div style={{ paddingLeft: "90px" }}>
      <Stack direction="column" spacing={5}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "500",
            textAlign: "left",
            fontSize: "1.75rem",
            paddingTop: "90px",
          }}
        >
          Investor Profile
        </Typography>

        <Box
          sx={{
            backgroundColor: "rgba(242, 241, 235, 0.5)", // 50% opacity
            width: "100%",
            maxWidth: "600px",
            borderRadius: "10px",
          }}
        >
          <List dense={dense} sx={{ padding: 0 }}>
            <ListItem
              secondaryAction={
                <TVLButton
                  onClick={handleClick}
                  minValue={minValue}
                  maxValue={maxValue}
                />
              }
              sx={listItemStyle}
            >
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    "&.MuiMenuItem-root:active": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <TextField
                    id="min-number"
                    label="Min"
                    type="number"
                    size="small"
                    value={minValue}
                    onChange={handleMinChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </MenuItem>
                <MenuItem onClick={(e) => e.stopPropagation()}>
                  <TextField
                    id="max-number"
                    label="Max"
                    type="number"
                    size="small"
                    value={maxValue}
                    onChange={handleMaxChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </MenuItem>
              </Menu>
              <ListItemText
                primary="Total Value Locked"
                sx={listItemTextStyle}
              />
            </ListItem>

            <Divider variant="middle" component="li" />

            <ListItem secondaryAction={<Selector />} sx={listItemStyle}>
              <ListItemText primary="Chain" sx={listItemTextStyle} />
            </ListItem>

            <Divider variant="middle" component="li" />

            <ListItem
              secondaryAction={<Selector type="protocol" />}
              sx={listItemStyle}
            >
              <ListItemText primary="Protocol" sx={listItemTextStyle} />
            </ListItem>
          </List>
        </Box>
        <Stack direction="row" spacing={2}>
          <ActionButton cancel={true}>Cancel</ActionButton>
          <ActionButton cancel={false}>Save</ActionButton>
        </Stack>
      </Stack>
    </div>
  );
}
