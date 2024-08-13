"use client";
import { getBookSearch } from "@/app/actions/getBookSearch";
import { getCreateBook } from "@/app/actions/getCreateBook";
import BreadCrumbs from "@/app/components/BreadCrumbs";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // Import uuid

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function BookUpload() {
  const [book, setBook] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [books, setBooks] = useState([]);
  const [price, setPrice] = useState("");
  const [count, setCount] = useState("");
  const [error, setError] = useState("");
  // Fetch book data
  const { data, refetch } = useQuery({
    queryKey: ["getBookSearch"],
    queryFn: () => getBookSearch(),
  });

  useEffect(() => {
    if (data) {
      setBooks(data);
    }
  }, [data]);
  const { mutate, isPending, isError } = useMutation({
    mutationFn: getCreateBook,
    onSuccess: () => {
      setBook("");
      setCount("");
      setPrice("");
    },
  });
  const handleChange = (event: any) => {
    const selectedValue = event.target.value;
    setBook(selectedValue);

    // Find the selected book data
    //@ts-ignore
    const selectedBook = books.find((item) => item.name === selectedValue);

    if (selectedBook) {
      console.log("Selected Book:", selectedBook);

      // Create an object with the book details
      const bookDetails = {
        //@ts-ignore
        id: selectedBook.id,
        //@ts-ignore
        name: selectedBook.name,
        //@ts-ignore
        category: selectedBook.category,
        //@ts-ignore
        author: selectedBook.author,
      };

      // Store the object in local storage
      localStorage.setItem("books", JSON.stringify(bookDetails));
      console.log("Stored in Local Storage:", localStorage.getItem("books"));
    } else {
      console.log("Book not found");
    }
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!book || !count || !price) {
      alert("Please fill out all required fields.");
      return;
    }
    const storeData = localStorage.getItem("books");
    const parseData = JSON.parse(storeData as string);
    const data = {
      name: parseData.name,
      author: parseData.author,
      price,
      count,
      category: parseData.category.name,
    };
    mutate(data);
    console.log(parseData);
    console.log(parseData.name, parseData.author, parseData.category.name);
    console.log("form submitted successfully");
  };
  // Open dialog and reset fields
  const handleOpenDialog = () => {
    setName("");
    setAuthor("");
    setCategory("");
    setOpenDialog(true);
  };

  // Close dialog and reset fields
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setName("");
    setAuthor("");
    setCategory("");
  };

  // Handle add new book
  const handleAddBook = () => {
    //@ts-ignore
    const existingBook = books.find((book) => book.name === name);

    if (existingBook) {
      setError("Book already exists in the list.");
      return;
    }
    // Create an object with the new book details including a unique ID
    const newBookDetails = {
      id: uuidv4(), // Generate a unique ID
      name,
      author,
      category,
    };

    // Store the object in local storage
    localStorage.setItem("books", JSON.stringify(newBookDetails));
    console.log("Stored in Local Storage:", localStorage.getItem("books"));

    // Update the list of books and set the new book as selected
    //@ts-ignore
    setBooks((prevBooks) => [...prevBooks, newBookDetails]);
    setBook(name);

    // Close the dialog
    handleCloseDialog();
  };
  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: 2,
      }}
    >
      <BreadCrumbs />
      <Box
        sx={{
          backgroundColor: "white",
          paddingY: 2,
          paddingX: 6,
          borderRadius: "8px",
          overflow: "hidden",
          flex: 1,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            padding: 2,
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "relative",
            }}
          >
            <InputLabel>Select a Book</InputLabel>
            <Select
              labelId="select-book-label"
              id="select-book"
              value={book}
              onChange={handleChange}
              autoWidth
              label="Book"
            >
              {books.map((item: any) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
              <Button onClick={handleOpenDialog} value={""}>
                Add
              </Button>
            </Select>
            <TextField
              label="Select Book Quantity"
              type="number" // Ensure only numeric input
              value={count}
              onChange={(e) => setCount(e.target.value)}
              InputProps={{ inputProps: { min: 0, max: 100 } }} // Optionally, set min value to 0
            />
            <TextField
              label="select the price"
              type="number" // Ensure only numeric input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              InputProps={{ inputProps: { min: 50, max: 1000 } }} // Optionally, set min value to 0
            />
            <Button type="submit" variant="contained" color="primary">
              {isPending ? "uploading..." : "upload"}
            </Button>
            {isError && <Typography>something went wrong</Typography>}
          </form>
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Book Title"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Author"
                fullWidth
                variant="outlined"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="Science Fiction">Science Fiction</MenuItem>
                  <MenuItem value="Fantasy">Fantasy</MenuItem>
                  <MenuItem value="Mystery">Mystery</MenuItem>
                  <MenuItem value="Biography">Biography</MenuItem>
                  <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
                </Select>
              </FormControl>
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                onClick={handleAddBook}
                disabled={!name || !author || !category} // Disable if any field is empty
              >
                Add Book
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}
