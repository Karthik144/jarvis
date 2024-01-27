import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography"; 
import BigButton from "./BigButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 400,
  borderRadius: "10px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  alignItems: 'center',
};

export default function WelcomeModal({ handleClose, open, email, setEmail }) {

const handleEmailChange = (event) => {
    setEmail(event.target.value);   
};

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            sx={{
              fontSize: "4rem",
              fontWeight: "semibold",
              color: "#1640D6",
              textAlign: "center",
            }}
          >
            Welcome
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{
              fontSize: "1.25rem",
              fontWeight: "regular",
              color: "text.secondary",
              textAlign: "center",
            }}
            variant="subtitle1"
          >
            Sign in or sign up to continue.
          </Typography>

          <Stack
            spacing={2}
            direction="column"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <BigButton>Google</BigButton>
            <BigButton>Apple</BigButton>
            <TextField
              id="outlined-basic"
              label="Email"
              variant="outlined"
              value={email} 
              onChange={handleEmailChange} 
            />
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
