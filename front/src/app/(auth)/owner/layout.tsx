import OwnerSidebar from "@/app/components/auth/owner/OwnerSidebar";
import { Box } from "@mui/material";

export default function ownerLayout({
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
      <OwnerSidebar />
      {children}
    </Box>
  );
}
