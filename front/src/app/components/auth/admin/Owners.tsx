"use client";
import React from "react";
import { Box } from "@mui/material";
import OwnersBottom from "./Owners/OwnersBottom";
import BreadCrumbs from "../../BreadCrumbs";

export default function OwnerDashboard() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: 2,
        overflow: "hidden",
      }}
    >
      <BreadCrumbs />
      <OwnersBottom />
    </Box>
  );
}
