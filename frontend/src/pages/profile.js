import React from "react";
import Typography from "@mui/material/Typography";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import FolderIcon from '@mui/icons-material/Folder';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box'; 
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from '@mui/material/Stack';
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Selector from "../components/investor_profile/Selector";
import TVLButton from "../components/investor_profile/TVLButton";
import ActionButton from "../components/investor_profile/ActionButton";
import { styled } from '@mui/material/styles';

function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    })
  );
}

export default function Profile(){

    const [dense, setDense] = React.useState(false);
    const [secondary, setSecondary] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
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
              padding: 2,
              backgroundColor: "#FBF9F1",
              width: "100%",
              maxWidth: "600px",
              minWidth: "300px",
              borderRadius: "10px",
            }}
          >
            <List dense={dense} sx={{ padding: 0 }}>
              <ListItem
                secondaryAction={
                  <>
                    <TVLButton onClick={handleClick} text="1-5M" />

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
                          id="outlined-number"
                          label="Min"
                          type="number"
                          size="small"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </MenuItem>
                      <MenuItem onClick={(e) => e.stopPropagation()}>
                        <TextField
                          id="outlined-number"
                          label="Max"
                          type="number"
                          size="small"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </MenuItem>
                    </Menu>
                  </>
                }
                sx={{
                  padding: "25px 0", // Add vertical padding bw each item
                }}
              >
                <ListItemText primary="Total Value Locked" />
              </ListItem>

              <Divider component="li" />

              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete">
                    <Selector />
                  </IconButton>
                }
                sx={{
                  padding: "25px 0", // Add vertical padding bw each item
                }}
              >
                <ListItemText primary="Chain" />
              </ListItem>

              <Divider component="li" />

              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete">
                    <Selector type="protocol" />
                  </IconButton>
                }
                sx={{
                  padding: "25px 0", // Add vertical padding bw each item
                }}
              >
                <ListItemText
                  primary="Protocol"
                  secondary={secondary ? "Secondary text" : null}
                />
              </ListItem>
            </List>
          </Box>
          <Stack direction="row" spacing={2}>
            <ActionButton>Save</ActionButton>
            <ActionButton>Cancel</ActionButton>
          </Stack>
        </Stack>
      </div>
    ); 
}