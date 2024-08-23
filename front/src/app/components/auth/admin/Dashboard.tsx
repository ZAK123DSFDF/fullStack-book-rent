"use client";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import DashboardBottomRightTop from "./Dashboard/DashboardBottom/DashboardBottomRight/DashboardBottomRightTop";
import DashboardBottomRightBottom from "./Dashboard/DashboardBottom/DashboardBottomRight/DashboardBottomRightBottom";
import DashboardBottomLeftTop from "./Dashboard/DashboardBottom/DashboardBottomLeft/DashboardBottomLeftTop";
import DashboardBottomLeftBottom from "./Dashboard/DashboardBottom/DashboardBottomLeft/DashboardBottomLeftBottom";
import BreadCrumbs from "../../BreadCrumbs";
import { usePathname, useRouter } from "next/navigation";
export default function OwnerDashboard() {
  const router = useRouter();
  const pathName = usePathname();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: 2,
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
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            flexDirection: "column",
            minHeight: "100%",
            padding: 3,
            gap: 4,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <DashboardBottomLeftTop />
          <DashboardBottomLeftBottom />
        </Box>
        <Box
          sx={{
            flex: 3,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            borderRadius: "8px",
            minHeight: "100%",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <DashboardBottomRightTop />
          <DashboardBottomRightBottom />
        </Box>
      </Box>
    </Box>
  );
}
