"use client";
import { getLogout } from "@/app/actions/getLogout";
import { Box, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { BookUser, LayoutDashboard, LogOut, UserRoundPen } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathName = usePathname();
  const router = useRouter();

  const { mutateAsync } = useMutation({
    mutationFn: getLogout,
    onSuccess: async () => {
      localStorage.removeItem("userId");
      window.location.href = "/login";
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });

  const handleLogout = async () => {
    try {
      await mutateAsync();
    } catch (error) {
      console.error("Logout mutation failed:", error);
    }
  };

  const getActiveStyle = (path: string) => {
    return pathName === path
      ? {
          backgroundColor: "#00abff",
          color: "#c3cfd9",
          borderRadius: "4px",
          padding: 1,
        }
      : {};
  };

  return (
    <Box
      sx={{
        backgroundColor: "#171b36",
        minHeight: "100%",
        width: "200px",
        borderRadius: "8px",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", padding: 1 }}>
          <Typography sx={{ color: "#0687cd" }}>BOOK RENT</Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              padding: 1,
              cursor: "pointer",
              ...getActiveStyle("/admin/dashboard"),
            }}
            onClick={() => router.push("/admin/dashboard")}
          >
            <LayoutDashboard strokeWidth={1.5} color="#c3cfd9" size={20} />
            <Typography sx={{ color: "#c3cfd9", fontSize: "15px" }}>
              Dashboard
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              padding: 1,
              cursor: "pointer",
              ...getActiveStyle("/admin/Books"),
            }}
            onClick={() => router.push("/admin/Books")}
          >
            <BookUser strokeWidth={1.5} size={20} color="#c3cfd9" />
            <Typography sx={{ color: "#c3cfd9", fontSize: "15px" }}>
              Books
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              padding: 1,
              cursor: "pointer",
              ...getActiveStyle("/admin/Owners"),
            }}
            onClick={() => router.push("/admin/Owners")}
          >
            <UserRoundPen strokeWidth={1.5} color="#c3cfd9" size={20} />
            <Typography sx={{ color: "#c3cfd9", fontSize: "15px" }}>
              Owners
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#45495e",
          borderRadius: "3px",
          padding: 1,
        }}
      >
        <LogOut strokeWidth={1.5} color="#c3cfd9" size={20} />
        <Typography
          sx={{ color: "#c3cfd9", cursor: "pointer" }}
          onClick={handleLogout}
        >
          Logout
        </Typography>
      </Box>
    </Box>
  );
}
