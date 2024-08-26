"use client";
import { Box } from "@mui/material";
import BooksBottom from "./Books/BooksBottom";
import BreadCrumbs from "../../BreadCrumbs";
export default function OwnerDashboard() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <BreadCrumbs />
      <BooksBottom />
    </Box>
  );
}
