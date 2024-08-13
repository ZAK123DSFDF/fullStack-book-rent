import { getUserCategoryCount } from "@/app/actions/getUserCatogories";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function DashboardBottomLeftBottom() {
  const COLORS = ["#ff7e5f", "#feb47b", "#85e3ff", "#C93C20", "#6C7156"];

  const { data, error, isLoading } = useQuery({
    queryKey: ["getUserCategories"],
    queryFn: () => getUserCategoryCount(),
  });

  console.log("Fetched data:", data); // Log the data for debugging

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Box
      sx={{
        height: "300px",
        backgroundColor: "white",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          paddingX: 2,
          paddingY: 2,
        }}
      >
        <Typography variant="h6">Available Books</Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              backgroundColor: "#f8f7f1",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            Today
          </Typography>
        </Box>
      </Box>
      <ResponsiveContainer width="100%" height={150}>
        {data && Array.isArray(data) && (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              labelLine={false}
              dataKey="bookCount" // Updated to match data key
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )}
      </ResponsiveContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexDirection: "column",
          gap: 2,
          maxHeight: "70px",
          overflowY: "auto",
          overflowX: "hidden",
          paddingX: 2,
          // Webkit scrollbar styles
          "&::-webkit-scrollbar": {
            width: "6px", // Thinner scrollbar width
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent", // Track background
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.3)", // Default scrollbar color
            borderRadius: "10px", // Rounded corners
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Darker color on hover
          },
        }}
      >
        {data &&
          Array.isArray(data) &&
          data.map((entry, index) => (
            <Box
              key={entry.name}
              sx={{
                display: "flex",
                alignItems: "center",
                margin: 0,
              }}
            >
              <Box
                sx={{
                  backgroundColor: COLORS[index % COLORS.length],
                  width: 20,
                  height: 20,
                  marginRight: 2, // Adjust spacing as needed
                }}
              />
              <Typography sx={{ margin: 0 }}>
                {entry.name}: {entry.bookCount}{" "}
                {/* Updated to match data key */}
              </Typography>
            </Box>
          ))}
      </Box>
    </Box>
  );
}
