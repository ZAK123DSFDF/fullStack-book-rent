"use client";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClickOpen}
        sx={{
          margin: 2,
          color: "white",
          backgroundColor: "blue",
          "&:hover": {
            backgroundColor: "darkblue",
            color: "lightgray",
          },
        }}
      >
        Open Dialog
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "blue",
            color: "white",
          },
        }}
      >
        <DialogTitle sx={{ color: "white" }}>Dialog Title</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "white" }}>
            Dialog Content
          </Typography>
        </DialogContent>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "white" }}>
            Dialog Content
          </Typography>
        </DialogContent>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "white" }}>
            Dialog Content
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: "white" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={open}
        message="This is a snackbar message"
        autoHideDuration={6000}
        onClose={handleClose}
      />
      <TextField label="Username" variant="outlined" margin="normal" />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      <Card>
        <CardContent>
          <Typography variant="h5">Card Title</Typography>
          <Typography variant="body2">Card content goes here.</Typography>
        </CardContent>
      </Card>
    </>
  );
}
