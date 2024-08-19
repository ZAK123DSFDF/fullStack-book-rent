import { getAdminBook } from "@/app/actions/getAdminBook";
import { getVerifyBook } from "@/app/actions/getVerifyBook";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

export default function DashboardBottomRightTop() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const [bookData, setBookData] = useState<any[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const nameSearch = useDeferredValue(searchParams.get("search"));
  const minPriceSearch = useDeferredValue(searchParams.get("minPrice"));
  const maxPriceSearch = useDeferredValue(searchParams.get("maxPrice"));
  const statusSearch = useDeferredValue(searchParams.get("status"));

  // Define columns for the MaterialReactTable
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Book ID",
        size: 100,
      },
      {
        accessorKey: "name",
        header: "Book Name",
        size: 200,
      },
      {
        accessorKey: "author",
        header: "Book Author",
        size: 200,
      },
      {
        accessorKey: "count",
        header: "Count",
        size: 150,
      },
      {
        accessorKey: "price",
        header: "Price",
        size: 150,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 150,
        Cell: ({ row }) => (
          <Button
            onClick={() => handleVerify(row.original.id)}
            variant="contained"
            sx={{
              backgroundColor:
                row.original.status === "VERIFIED" ? "green" : "blue",
              color: "white",
              "&:hover": {
                backgroundColor:
                  row.original.status === "VERIFIED" ? "darkgreen" : "darkblue",
              },
            }}
          >
            {row.original.status}
          </Button>
        ),
      },
    ],
    []
  );

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

  useEffect(() => {
    if (data) {
      setBookData(data);
    }
  }, [data]);

  const { mutate } = useMutation({
    mutationFn: getVerifyBook,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries([
        "getAllBooks",
        nameSearch,
        minPriceSearch,
        maxPriceSearch,
        statusSearch,
      ]);
    },
  });

  const handleVerify = (id: any) => {
    mutate(id);
  };

  useEffect(() => {
    if (hasTyped) {
      const handle = setTimeout(() => {
        const query = new URLSearchParams();
        if (name) query.set("search", name);
        if (minPrice) query.set("minPrice", minPrice);
        if (maxPrice) query.set("maxPrice", maxPrice);
        if (status) query.set("status", status);
        router.push(`/admin/dashboard?${query.toString()}`);
      }, 500);
      return () => clearTimeout(handle);
    }
  }, [router, name, minPrice, maxPrice, status, hasTyped]);

  const table = useMaterialReactTable({
    columns,
    data: bookData || [],
  });

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "white",
        flex: 2,
        padding: 2,
        borderRadius: "8px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        maxWidth: "900px",
        maxHeight: "400px", // Maximum height for the container
        display: "flex",
        flexDirection: "column", // Stack children vertically
      }}
    >
      <Box
        sx={{
          marginBottom: 2,
          maxHeight: "300px", // Maximum height for the filter section
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>List of Books</Typography>
        <form
          style={{
            marginTop: "50px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
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
            inputProps={{ min: 0, max: 100000, step: 1 }}
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
            inputProps={{ min: 0, max: 100000, step: 1 }}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setHasTyped(true);
            }}
          />
          <FormControl sx={{ marginRight: 2, minWidth: 150 }}>
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
              <MenuItem value="FREE">Free</MenuItem>
              <MenuItem value="RENTED">Rented</MenuItem>
            </Select>
          </FormControl>
        </form>
      </Box>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%", // Ensure full height if needed
          }}
        >
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography sx={{ color: "red", textAlign: "center" }}>
          Error loading books: {error.message}
        </Typography>
      ) : bookData?.length === 0 ? (
        <Typography sx={{ textAlign: "center" }}>No books found.</Typography>
      ) : (
        <Box
          sx={{
            flex: 1, // Allow the table to take up available space
            overflow: "auto", // Ensure content can scroll if it overflows
          }}
        >
          <MaterialReactTable table={table} />
        </Box>
      )}
    </Box>
  );
}
