import { useState, useMemo, useEffect } from "react";
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
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {
  format,
  differenceInMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  eachYearOfInterval,
  startOfYear,
} from "date-fns";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRangeDate } from "@/app/actions/getRangeDate";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardBottomRightBottom() {
  const today = new Date();
  const startOfYearDate = startOfYear(today);
  const router = useRouter();
  const [date, setDate] = useState({
    startDate: startOfYearDate,
    endDate: today,
    key: "selection",
  });
  const [openDate, setOpenDate] = useState(false);
  const queryClient = useQueryClient();
  const handleChange = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setDate({ startDate, endDate, key: "selection" });
  };

  const { data: rangeData } = useQuery({
    queryKey: ["userRangeBalance", date.startDate, date.endDate],
    queryFn: () => getRangeDate(date.startDate, date.endDate),
  });
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
        name: format(month, "yyyy-MM"),
      }));
    }
  };

  const xAxisData = generateXAxisData();
  const transformData = (data: any) => {
    if (data) {
      const currentYearBalances = data.currentYearBalances || {};
      const lastYearBalances = data.lastYearBalances || {};
      const currentYearData = xAxisData.map((item) => {
        const formattedName = item.name;
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
        maxHeight: "500px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        paddingX: 1,
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
            {openDate &&
              createPortal(
                <Box
                  sx={{
                    position: "absolute",
                    background: "white",
                    zIndex: 1000,
                    borderRadius: "4px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    bottom: "245px",
                    left: "500px",
                    transform: "translateX(10px)",
                  }}
                >
                  <DateRangePicker
                    ranges={[date]}
                    onChange={handleChange}
                    moveRangeOnFirstSelection={false}
                  />
                </Box>,
                document.body
              )}
            <ChevronDown size={10} />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "8px",
            boxSizing: "border-box",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box
              sx={{
                minWidth: 5,
                minHeight: 5,
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
                minWidth: 5,
                minHeight: 5,
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
