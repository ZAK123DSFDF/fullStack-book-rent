"use client";
import { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // Import the styles for the date picker
import "react-date-range/dist/theme/default.css"; // Import the theme styles
import {
  format,
  differenceInMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  eachYearOfInterval,
  startOfYear,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getRangeDate } from "@/app/actions/getRangeDate";
import { getUserRangeBalance } from "@/app/actions/getUserRangeBalance";
import { ChevronDown } from "lucide-react";

export default function DashboardBottomRightBottom() {
  const today = new Date();
  const startOfYearDate = startOfYear(today);

  const [date, setDate] = useState({
    startDate: startOfYearDate,
    endDate: today,
    key: "selection",
  });
  const [openDate, setOpenDate] = useState(false);

  const handleChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDate({ startDate, endDate, key: "selection" });
  };

  const { data: rangeData } = useQuery({
    queryKey: ["userRangeBalance", date.startDate, date.endDate],
    queryFn: () => getUserRangeBalance(date.startDate, date.endDate),
    enabled: !!date.startDate && !!date.endDate, // Ensure query only runs when dates are available
  });
  console.log("this is the rangeData", rangeData);
  const handleClick = () => {
    setOpenDate((prev) => !prev);
  };

  const rangeInMonths = useMemo(() => {
    return differenceInMonths(date.endDate, date.startDate);
  }, [date.startDate, date.endDate]);

  const generateXAxisData = () => {
    const start = startOfMonth(date.startDate);
    const end = endOfMonth(date.endDate);

    if (rangeInMonths > 12) {
      return eachYearOfInterval({ start, end }).map((year) => ({
        name: format(year, "yyyy"), // Format as "yyyy" for yearly data
      }));
    } else {
      return eachMonthOfInterval({ start, end }).map((month) => ({
        name: format(month, "yyyy-MM"), // Format as "yyyy-MM" for monthly data
      }));
    }
  };

  const xAxisData = generateXAxisData();

  // Transform the response data into chart-compatible format
  const transformData = (data) => {
    if (data) {
      console.log("this is the data", data);
      // Extract balances
      const currentYearBalances = data.currentYearBalances || {};
      const lastYearBalances = data.lastYearBalances || {};

      console.log(
        "this is the data in the transform",
        currentYearBalances,
        lastYearBalances
      );

      // Create data arrays for each year
      const currentYearData = xAxisData.map((item) => {
        const formattedName = item.name;

        // Convert formattedName to Date object for manipulation
        const currentDate = new Date(`${formattedName}-01`);
        const lastYearDate = new Date(
          currentDate.setFullYear(currentDate.getFullYear() - 1)
        );
        const lastYearFormattedName = format(lastYearDate, "yyyy-MM");

        return {
          name: formattedName,
          currentYearValue: currentYearBalances[formattedName] || 0,
          lastYearValue: lastYearBalances[lastYearFormattedName] || 0,
        };
      });

      return currentYearData;
    } else {
      // Handle case when data is null or undefined
      console.warn("No data provided for transformData");
      return xAxisData.map((item) => ({
        name: item.name,
        currentYearValue: 0,
        lastYearValue: 0,
      }));
    }
  };

  const chartData = transformData(rangeData);
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "white",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        flex: 1.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        paddingX: 3,
        paddingBottom: 1,
        borderRadius: "8px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignSelf: "center",
          width: "100%",
          justifyContent: "flex-start",
        }}
      >
        <Box
          sx={{ display: "flex", gap: 3, marginLeft: 5, alignItems: "center" }}
        >
          <Typography sx={{ fontWeight: "bold" }}>Earning Summary</Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "30px",
              position: "relative",
              marginRight: 3,
            }}
          >
            <span
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
              onClick={handleClick}
            >
              {`${format(date.startDate, "MMM dd, yyyy")} to ${format(
                date.endDate,
                "MMM dd, yyyy"
              )}`}
            </span>
            {openDate && (
              <DateRangePicker
                className="dateRange"
                ranges={[date]}
                onChange={handleChange}
                moveRangeOnFirstSelection={false}
              />
            )}
            <ChevronDown size={10} />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "8px", // Ensure consistent padding around the content
            boxSizing: "border-box", // Ensure padding and border are included in the element's width and height
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: "blue",
              }}
            />
            <Typography sx={{ fontSize: "0.8rem", margin: 0 }}>
              {" "}
              {/* Removed default margin */}
              {`from ${format(date.startDate, "MMM dd, yyyy")} to ${format(
                date.endDate,
                "MMM dd, yyyy"
              )}`}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              marginLeft: 5,
            }}
          >
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                backgroundColor: "#7f5b83",
              }}
            />
            <Typography sx={{ fontSize: "0.8rem", margin: 0 }}>
              {" "}
              {/* Removed default margin */}
              same period last year
            </Typography>
          </Box>
        </Box>
      </Box>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="blue" stopOpacity={1} />
              <stop offset="95%" stopColor="lightblue" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="none" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#000" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#000" }}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="currentYearValue"
            stroke="blue"
            fill="url(#colorCurrent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
          <Area
            type="monotone"
            dataKey="lastYearValue"
            stroke="#7f5b83"
            fill="none" // No fill for the second graph
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5" // Dashed line style
            activeDot={{ r: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
