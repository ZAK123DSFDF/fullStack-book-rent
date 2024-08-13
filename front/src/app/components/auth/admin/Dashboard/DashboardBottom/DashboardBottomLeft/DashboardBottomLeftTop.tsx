import { getAdminBalance } from "@/app/actions/getAdminBalance";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function DashboardBottomLeftTop() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["adminWallet"],
    queryFn: () => getAdminBalance(),
  });
  const now = new Date();
  const formattedDate = format(now, "EEE, dd MMM, yyyy, hh:mm a");
  console.log("this is admin balance", data);
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ color: "#88888b", fontSize: "25px" }}>
          This Month Statistics
        </Typography>
        <Typography sx={{ color: "#bababa" }}>{formattedDate}</Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box
          sx={{
            minHeight: "150px",
            backgroundColor: "white",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 1,
            gap: 1,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: 1,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Typography sx={{ color: "#8b8b97" }}>Income</Typography>
            <Typography
              sx={{
                backgroundColor: "#f4f5f7",
                paddingX: 1,
                color: "#8b8b97",
                fontSize: "15px",
                borderRadius: "2px",
              }}
            >
              this month
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              ETB {data?.currentMonthTotal}
            </Typography>
            <Box sx={{ display: "flex" }}>
              {data?.percentageChange >= 0 ? (
                <>
                  <ArrowUp strokeWidth={1.5} size={20} color="green" />
                  <Typography sx={{ color: "green", marginLeft: "4px" }}>
                    {data?.percentageChange}%
                  </Typography>
                </>
              ) : (
                <>
                  <ArrowDown strokeWidth={1.5} size={20} color="red" />
                  <Typography sx={{ color: "red", marginLeft: "4px" }}>
                    {data?.percentageChange}%
                  </Typography>
                </>
              )}
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography sx={{ color: "#8b8b97" }}>
              compared to ETB{data?.dollarChange} last month
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Typography sx={{ color: "#7d7d80" }}>
                Last month income
              </Typography>
              <Typography sx={{ color: "#7d7d80" }}>
                ETB {data?.lastMonthTotal}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}