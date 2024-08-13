import { getAdminBook } from "@/app/actions/getAdminBook";
import { getVerifyBook } from "@/app/actions/getVerifyBook";
import {
  Box,
  Button,
  CircularProgress,
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
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
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

  const { mutate } = useMutation({
    mutationFn: getVerifyBook,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries("getAllBooks");
    },
  });

  const handleVerify = (id: any) => {
    mutate(id);
  };

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
        router.push(`/admin/Books?${query.toString()}`);
      }, 500);
      return () => clearTimeout(handle);
    }
  }, [router, name, minPrice, maxPrice, status, hasTyped]);

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "white",
        flex: 2,
        padding: 2,
        borderRadius: "8px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box sx={{ marginBottom: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>List of Books</Typography>
        <form style={{ marginTop: "50px" }}>
          <TextField
            label="Name"
            variant="outlined"
            sx={{ marginRight: 2 }}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setHasTyped(true);
            }}
          />
          <TextField
            label="Min Price"
            variant="outlined"
            sx={{ marginRight: 2 }}
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
            label="Max Price"
            variant="outlined"
            sx={{ marginRight: 2 }}
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
          <FormControl
            variant="outlined"
            sx={{ marginRight: 2, minWidth: 150 }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setHasTyped(true);
              }}
            >
              <MenuItem value="">ALL</MenuItem>
              <MenuItem value="FREE">FREE</MenuItem>
              <MenuItem value="RENTED">RENTED</MenuItem>
            </Select>
          </FormControl>
        </form>
      </Box>
      <Box>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography sx={{ color: "red", textAlign: "center" }}>
            Error loading books: {error.message}
          </Typography>
        ) : data?.length === 0 ? (
          <Typography sx={{ textAlign: "center" }}>No books found.</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "400px",
              overflowY: "auto",
              backgroundColor: "transparent",
              boxShadow: "none",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },
            }}
          >
            <Table sx={{ backgroundColor: "transparent" }}>
              <TableHead>
                <TableRow sx={{ fontWeight: "bold" }}>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    Book ID
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    Book Name
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    Book Author
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    Count
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    Price
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    Book Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((book: any) => (
                  <TableRow key={book.id}>
                    <TableCell sx={{ padding: "4px" }}>{book.id}</TableCell>
                    <TableCell sx={{ padding: "4px" }}>{book.name}</TableCell>
                    <TableCell sx={{ padding: "4px" }}>{book.author}</TableCell>
                    <TableCell sx={{ padding: "4px" }}>
                      {book.count === 0 ? "Rented" : "Free"}
                    </TableCell>
                    <TableCell sx={{ padding: "4px" }}>{book.count}</TableCell>
                    <TableCell sx={{ padding: "4px" }}>${book.price}</TableCell>
                    <TableCell sx={{ padding: "4px" }}>
                      <Button
                        onClick={() => handleVerify(book.id)}
                        variant="contained"
                        sx={{
                          backgroundColor:
                            book.bookStatus === "VERIFIED"
                              ? "green"
                              : "primary.main",
                          color: "white",
                          "&:hover": {
                            backgroundColor:
                              book.bookStatus === "VERIFIED"
                                ? "darkgreen"
                                : "primary.dark",
                          },
                        }}
                      >
                        {book.bookStatus}
                      </Button>
                    </TableCell>
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
