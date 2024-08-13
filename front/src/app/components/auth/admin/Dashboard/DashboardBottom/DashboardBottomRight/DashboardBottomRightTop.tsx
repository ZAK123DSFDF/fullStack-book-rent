import { getAdminBook } from "@/app/actions/getAdminBook";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";

export default function DashboardBottomRightTop() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState("");
  const [hasTyped, setHasTyped] = useState(false);

  const nameSearch = useDeferredValue(searchParams.get("search"));
  const minPriceSearch = useDeferredValue(searchParams.get("minPrice"));
  const maxPriceSearch = useDeferredValue(searchParams.get("maxPrice"));
  const statusSearch = useDeferredValue(searchParams.get("status"));

  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "getAllBooks",
      nameSearch,
      minPriceSearch,
      maxPriceSearch,
      statusSearch,
    ],
    queryFn: () =>
      getAdminBook(
        nameSearch as string,
        //@ts-ignore
        minPriceSearch,
        maxPriceSearch,
        statusSearch
      ),
  });

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (name) queryParams.append("search", name);
    if (minPrice) queryParams.append("minPrice", minPrice);
    if (maxPrice) queryParams.append("maxPrice", maxPrice);
    if (status) queryParams.append("status", status);
  }, [name, minPrice, maxPrice, status]);

  useEffect(() => {
    if (hasTyped) {
      const handle = setTimeout(() => {
        const query = new URLSearchParams();
        if (name) query.set("search", name);
        if (minPrice) query.set("minPrice", minPrice);
        if (maxPrice) query.set("maxPrice", maxPrice);
        if (status) query.set("status", status);
        router.push(`dashboard?${query.toString()}`);
      }, 500);
      return () => clearTimeout(handle);
    }
  }, [router, name, minPrice, maxPrice, status, hasTyped]);

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "white",
        borderRadius: "8px",
        flex: 0,
        padding: 2,
        minHeight: "300px",
      }}
    >
      <Box sx={{ marginBottom: 2 }}>
        <form style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <TextField
            label="name"
            variant="outlined"
            sx={{ marginRight: 2, width: 150 }}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setHasTyped(true);
            }}
          />
          <TextField
            label="minPrice"
            variant="outlined"
            sx={{ marginRight: 2, width: 150 }}
            value={minPrice}
            type="number"
            inputProps={{
              min: 0,
              max: 100000,
              step: 1,
            }}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setHasTyped(true);
            }}
          />
          <TextField
            label="maxPrice"
            variant="outlined"
            sx={{ marginRight: 2, width: 150 }}
            value={maxPrice}
            type="number"
            inputProps={{
              min: 0,
              max: 100000,
              step: 1,
            }}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setHasTyped(true);
            }}
          />
          <FormControl sx={{ marginRight: 2, width: 150 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setHasTyped(true);
              }}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="RENTED">Rented</MenuItem>
              <MenuItem value="FREE">Free</MenuItem>
            </Select>
          </FormControl>
        </form>
      </Box>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxHeight: "250px",
          minHeight: "250px",
          overflowX: "hidden",
          overflowY: "auto",
          padding: "8px",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography sx={{ color: "red", textAlign: "center" }}>
            Error loading books. Please try again later.
          </Typography>
        ) : data?.length === 0 ? (
          <Typography sx={{ textAlign: "center" }}>No books found.</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "100%",
              backgroundColor: "transparent",
              boxShadow: "none",
              margin: "8px",
            }}
          >
            <Table sx={{ backgroundColor: "transparent" }}>
              <TableHead sx={{ position: "sticky", top: 0, zIndex: 1 }}>
                <TableRow>
                  <TableCell sx={{ padding: "8px" }}>Book ID</TableCell>
                  <TableCell sx={{ padding: "8px" }}>Book Name</TableCell>
                  <TableCell sx={{ padding: "8px" }}>Book Author</TableCell>
                  <TableCell sx={{ padding: "8px" }}>Status</TableCell>
                  <TableCell sx={{ padding: "8px" }}>Count</TableCell>
                  <TableCell sx={{ padding: "8px" }}>Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((book: any) => (
                  <TableRow key={book.id}>
                    <TableCell sx={{ padding: "8px" }}>{book.id}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>{book.name}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>{book.author}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>
                      {book.count === 0 ? "Rented" : "Free"}
                    </TableCell>
                    <TableCell sx={{ padding: "8px" }}>{book.count}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>${book.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}
