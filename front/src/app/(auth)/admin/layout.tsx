import AdminSidebar from "@/app/components/auth/admin/AdminSidebar";
import { Box } from "@mui/material";

export default function adminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        backgroundColor: "#f0f2ff",
        height: "100vh",
        padding: 2,
      }}
    >
      <AdminSidebar />
      {children}
    </Box>
  );
}
