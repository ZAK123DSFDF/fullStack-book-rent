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
import { useState, useEffect, useDeferredValue } from "react";

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
  const searchParams = useSearchParams();
  const nameSearch = useDeferredValue(searchParams.get("search"));
  const minPriceSearch = useDeferredValue(searchParams.get("minPrice"));
  const maxPriceSearch = useDeferredValue(searchParams.get("maxPrice"));
  const statusSearch = useDeferredValue(searchParams.get("status"));

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

  const { isPending: deletingBook, mutate: deleteBook } = useMutation({
    mutationFn: getDeleteBook,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries("books");
    },
  });

  const {
    data: bookData,
    isLoading: fetchingBook,
    isError: fetchingError,
  } = useQuery({
    queryKey: ["singleBook", selectedBookId],
    queryFn: () => getSingleBook(selectedBookId),
    enabled: !!selectedBookId,
  });

  const { mutate: updateBookData, isPending: updatingBook } = useMutation({
    mutationFn: getUpdateBook,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries("books");
      handleCloseModal();
    },
  });

  const [hasTyped, setHasTyped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (bookData) {
      setFormValues({
        name: bookData.name || "",
        author: bookData.author || "",
        price: bookData.price || "",
        count: bookData.count || "0",
        categoryName: bookData.category.name || "",
      });
    }
  }, [bookData]);

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

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "white",
        borderRadius: "8px",
        flex: 0,
        padding: 2,
        minHeight: "300px",
        maxHeight: "400px",
      }}
    >
      <Box sx={{ marginBottom: 2, display: "flex", gap: 6 }}>
        <Typography
          sx={{ fontWeight: "bold", marginLeft: "15px", alignSelf: "flex-end" }}
        >
          Created Books
        </Typography>
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

      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxHeight: "250px",
          minHeight: "250px",
          overflow: "auto",
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
            }}
          >
            <Table sx={{ backgroundColor: "transparent" }}>
              <TableHead sx={{ position: "sticky", top: 0, zIndex: 1 }}>
                <TableRow>
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
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((book: any) => (
                  <TableRow key={book.id}>
                    <TableCell sx={{ padding: "8px" }}>{book.id}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>{book.name}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>{book.author}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>{book.status}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>{book.count}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>{book.price}</TableCell>
                    <TableCell sx={{ padding: "8px" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditClick(book.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => deleteBook(book.id)}
                        disabled={deletingBook}
                        sx={{ marginLeft: 1 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Edit Book</DialogTitle>
        <DialogContent>
          {fetchingBook ? (
            <CircularProgress />
          ) : fetchingError ? (
            <Typography color="error">Error fetching book data.</Typography>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                value={formValues.name}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                label="Author"
                name="author"
                fullWidth
                value={formValues.author}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                label="Price"
                name="price"
                fullWidth
                value={formValues.price}
                type="number"
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                label="Count"
                name="count"
                fullWidth
                value={formValues.count}
                type="number"
                onChange={handleChange}
                margin="normal"
              />
              <FormControl fullWidth margin="dense">
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
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" disabled={updatingBook}>
                  {updatingBook ? <CircularProgress size={24} /> : "Update"}
                </Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
