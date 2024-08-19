import { getAdminBook } from "@/app/actions/getAdminBook";
import { getVerifyBook } from "@/app/actions/getVerifyBook";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef, //if using TypeScript (optional, but recommended)
} from "material-react-table";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookData, setBookData] = useState([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Columns definition for the books table
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "id", // Accessor for the data
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
        header: "Book Status",
        size: 150,
        Cell: ({ row }) => (
          <Button
            onClick={() => handleVerify(row.original.id)}
            variant="contained"
            sx={{
              backgroundColor:
                row.original.bookStatus === "VERIFIED" ? "green" : "blue",
              color: "white",
              "&:hover": {
                backgroundColor:
                  row.original.bookStatus === "VERIFIED"
                    ? "darkgreen"
                    : "darkblue",
              },
            }}
          >
            {row.original.bookStatus}
          </Button>
        ),
      },
    ],
    []
  );

  // Fetch books based on search parameters
  const nameSearch = useDeferredValue(searchParams.get("search"));
  const minPriceSearch = useDeferredValue(searchParams.get("minPrice"));
  const maxPriceSearch = useDeferredValue(searchParams.get("maxPrice"));
  const statusSearch = useDeferredValue(searchParams.get("status"));

  const { data, isPending, isError, error } = useQuery({
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

  const { mutate, isPending: verifying } = useMutation({
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

  const table = useMaterialReactTable({
    columns,
    data: bookData || [],
    enableRowSelection: true,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
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
        maxWidth: "1300px",
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
              <MenuItem value="">ALL</MenuItem>
              <MenuItem value="FREE">FREE</MenuItem>
              <MenuItem value="RENTED">RENTED</MenuItem>
            </Select>
          </FormControl>
        </form>
      </Box>
      {isPending ? (
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
      ) : bookData?.length === 0 ? (
        <Typography sx={{ textAlign: "center" }}>No books found.</Typography>
      ) : (
        <MaterialReactTable table={table} />
      )}
    </Box>
  );
}
