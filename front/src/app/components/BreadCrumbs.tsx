"use client";
import { Box, Typography } from "@mui/material";
import { usePathname } from "next/navigation";

export default function BreadCrumbs() {
  const pathName = usePathname();
  const splitPath = pathName.split("/");
  return (
    <Box
      sx={{
        backgroundColor: "white",
        paddingY: 2,
        paddingX: 6,
        borderRadius: "8px",
        overflow: "hidden",
        minHeight: "60px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography sx={{ fontWeight: "bold" }}> {splitPath[1]}/</Typography>
        <Typography>{splitPath[2]}</Typography>
      </Box>
    </Box>
  );
}
