"use client";
import React from "react";
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
        overflow: "auto",
        maxHeight: "700px",
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
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            flex: 3,
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            borderRadius: "8px",
            minHeight: "100%",
            flexDirection: "column",
            gap: 2,
            overflow: "auto",
            maxHeight: "200px",
            maxWidth: "250px",
            minWidth: "200px",
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
            overflow: "auto",
            maxHeight: "200px",
          }}
        >
          <DashboardBottomRightTop />
          <DashboardBottomRightBottom />
        </Box>
      </Box>
    </Box>
  );
}
