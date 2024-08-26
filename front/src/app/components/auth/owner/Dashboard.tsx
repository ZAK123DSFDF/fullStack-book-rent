"use client";
import React, { useState } from "react";
import { Box } from "@mui/material";
import DashboardBottomRightTop from "./Dashboard/DashboardBottom/DashboardBottomRight/DashboardBottomRightTop";
import DashboardBottomRightBottom from "./Dashboard/DashboardBottom/DashboardBottomRight/DashboardBottomRightBottom";
import DashboardBottomLeftTop from "./Dashboard/DashboardBottom/DashboardBottomLeft/DashboardBottomLeftTop";
import DashboardBottomLeftBottom from "./Dashboard/DashboardBottom/DashboardBottomLeft/DashboardBottomLeftBottom";
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
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          height: "100%",
          gap: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            borderRadius: "8px",
            height: "100%",
            flexDirection: "column",
            gap: 2,
            padding: 2,
            minWidth: "250px",
            maxWidth: "250px",
            backgroundColor: "white",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <DashboardBottomLeftTop />
          <DashboardBottomLeftBottom />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            borderRadius: "8px",
            height: "100%",
            flexDirection: "column",
            gap: 2,
            width: "100%",
            overflow: "hidden",
          }}
        >
          <DashboardBottomRightTop />
          <DashboardBottomRightBottom />
        </Box>
      </Box>
    </Box>
  );
}
