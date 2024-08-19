"use client";
import { getDeleteBook } from "@/app/actions/getDeleteBook";
import { getOwnerBooks } from "@/app/actions/getOwnerBooks";
import { getSingleBook } from "@/app/actions/getSingleBook";
import { getUpdateBook } from "@/app/actions/getUpdateBook";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

export default function DashboardBottomRightTop() {
  const queryClient = useQueryClient();
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    author: "",
    price: "",
    count: "",
    categoryName: "", // Changed from categoryId to categoryName
  });
  const [name, setName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const [bookData, setBookData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const nameSearch = useDeferredValue(searchParams.get("search"));
  const minPriceSearch = useDeferredValue(searchParams.get("minPrice"));
  const maxPriceSearch = useDeferredValue(searchParams.get("maxPrice"));
  const statusSearch = useDeferredValue(searchParams.get("status"));

  // Define columns for the MaterialReactTable
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "Book ID", size: 100 },
      { accessorKey: "name", header: "Book Name", size: 150 },
      { accessorKey: "author", header: "Book Author", size: 150 },
      { accessorKey: "count", header: "Count", size: 100 },
      { accessorKey: "price", header: "Price", size: 100 },
      { accessorKey: "status", header: "Status", size: 100 },
      {
        accessorKey: "action",
        header: "Action",
        size: 120,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleEditClick(row.original.id)}
              size="small"
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDeleteBook(row.original.id)}
              sx={{ marginLeft: 1 }}
              size="small"
            >
              Delete
            </Button>
          </Box>
        ),
      },
    ],
    []
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "books",
      nameSearch,
      minPriceSearch,
      maxPriceSearch,
      statusSearch,
    ],
    queryFn: () =>
      getOwnerBooks(
        nameSearch as string,
        //@ts-ignore
        minPriceSearch,
        maxPriceSearch,
        statusSearch as string
      ),
  });

  useEffect(() => {
    if (data) {
      setBookData(data);
    }
  }, [data]);

  const { mutate: deleteBook, isPending: deletingBook } = useMutation({
    mutationFn: getDeleteBook,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries("books");
    },
  });

  const { mutate: updateBookData, isPending: updatingBook } = useMutation({
    mutationFn: getUpdateBook,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries("books");
      handleCloseModal();
    },
  });

  const {
    data: bookDataSingle,
    isLoading: fetchingBook,
    isError: fetchingError,
  } = useQuery({
    queryKey: ["singleBook", selectedBookId],
    queryFn: () => getSingleBook(selectedBookId),
    enabled: !!selectedBookId,
  });

  useEffect(() => {
    if (bookDataSingle) {
      setFormValues({
        name: bookDataSingle.name || "",
        author: bookDataSingle.author || "",
        price: bookDataSingle.price || "",
        count: bookDataSingle.count || "0",
        categoryName: bookDataSingle.category.name || "",
      });
    }
  }, [bookDataSingle]);

  const handleEditClick = (id: any) => {
    setSelectedBookId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookId(null);
  };

  const handleChange = (e: any) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const categories = [
    "Science Fiction",
    "Fantasy",
    "Mystery",
    "Biography",
    "Non-Fiction",
  ];

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const updatedData = {
      name: formValues.name,
      author: formValues.author,
      price: parseFloat(formValues.price), // Convert price to a number
      count: parseInt(formValues.count, 10), // Convert count to a number
      category: formValues.categoryName,
    };

    updateBookData({
      updateData: updatedData,
      bookId: selectedBookId,
    });
  };

  const handleDeleteBook = (id: any) => {
    deleteBook(id);
  };

  const handleSubmit1 = (e: any) => {
    e.preventDefault();
    // Log the current values of the fields
    console.log("Search Values:", {
      name,
      minPrice,
      maxPrice,
      status,
    });
  };

  const router = useRouter();
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
        <Typography sx={{ fontWeight: "bold" }}>Created Books</Typography>
        <form
          onSubmit={handleSubmit1}
          style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
        >
          <TextField
            label="Name"
            variant="outlined"
            sx={{ marginRight: 2, width: 150 }} // Adjust width as needed
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setHasTyped(true);
            }}
          />
          <TextField
            label="Min Price"
            variant="outlined"
            sx={{ marginRight: 2, width: 150 }} // Adjust width as needed
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
            sx={{ marginRight: 2, width: 150 }} // Adjust width as needed
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
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setHasTyped(true);
              }}
              label="Status"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="unavailable">Unavailable</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary">
            Search
          </Button>
        </form>

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
              maxHeight: "200px", // Allow the table to take up available space
              overflow: "auto", // Ensure content can scroll if it overflows
            }}
          >
            <MaterialReactTable table={table} />
          </Box>
        )}
      </Box>

      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Edit Book</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Book Name"
              variant="outlined"
              fullWidth
              name="name"
              value={formValues.name}
              onChange={handleChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Author"
              variant="outlined"
              fullWidth
              name="author"
              value={formValues.author}
              onChange={handleChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Price"
              variant="outlined"
              fullWidth
              name="price"
              type="number"
              value={formValues.price}
              onChange={handleChange}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Count"
              variant="outlined"
              fullWidth
              name="count"
              type="number"
              value={formValues.count}
              onChange={handleChange}
              sx={{ marginBottom: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="categoryName"
                value={formValues.categoryName}
                onChange={handleChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DialogActions>
              <Button
                onClick={handleCloseModal}
                color="primary"
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={updatingBook}
              >
                {updatingBook ? <CircularProgress size={24} /> : "Update"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
