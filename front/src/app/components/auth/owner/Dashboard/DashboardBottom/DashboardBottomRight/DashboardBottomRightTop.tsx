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
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  MRT_ColumnFiltersState,
  MRT_SortingState,
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
    categoryName: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilter, setColumnFilter] = useState<MRT_ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [hasTyped, setHasTyped] = useState(false);
  const [bookData, setBookData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const global = searchParams.get("globalSearch");
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const author = searchParams.get("author");
  const count = searchParams.get("count");
  const price = searchParams.get("price");
  const bookStatus = searchParams.get("bookStatus");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  // Define columns for the MaterialReactTable
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "Book ID", size: 100 },
      { accessorKey: "name", header: "Book Name", size: 150 },
      { accessorKey: "author", header: "Book Author", size: 150 },
      { accessorKey: "count", header: "Count", size: 100 },
      { accessorKey: "price", header: "Price", size: 100 },
      {
        accessorKey: "bookStatus",
        header: "bookStatus",
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => (
          <Button
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
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        enableSorting: false,
      },

      {
        accessorKey: "action",
        header: "Action",
        size: 120,
        enableSorting: false, // Disable sorting for the action column
        enableColumnFilter: false, // Disable filtering for the action column
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

  const { data, isPending, isError, error } = useQuery({
    queryKey: [
      "books",
      global,
      id,
      name,
      author,
      count,
      price,
      bookStatus,
      status,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getOwnerBooks(
        global as string,
        id as string,
        name as string,
        author as string,
        count as string,
        price as string,
        bookStatus as string,
        status as string,
        sortBy as string,
        sortOrder as string
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
  const [del, setDel] = useState(false);
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
      price: parseFloat(formValues.price),
      count: parseInt(formValues.count, 10),
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
  const router = useRouter();
  const [check, setCheck] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setCheck(true);
    }, 3000);

    // Cleanup the timeout if the component unmounts or re-renders before 1.5 seconds
    return () => clearTimeout(timer);
  }, [check]);
  useEffect(() => {
    if (check) {
      if (hasTyped) {
        const handle = setTimeout(() => {
          const query = new URLSearchParams();

          // Add global search parameter
          if (globalSearch) {
            query.set("globalSearch", globalSearch);
          } else {
            query.delete("globalSearch");
            setDel(true);
            if (del) {
              router.push(`/owner/dashboard?${query.toString()}`);
            }
          }

          // Add column filters parameters
          columnFilter.forEach((filter) => {
            if (filter.value) {
              query.set(filter.id, filter.value as string);
            } else {
              query.delete(filter.id);
              setDel(true);
              if (del) {
                router.push(`/owner/dashboard?${query.toString()}`);
              }
            }
          });

          // Add sorting parameters
          if (sorting.length > 0) {
            const { id, desc } = sorting[0];
            if (id) {
              query.set("sortBy", id);
              query.set("sortOrder", desc ? "desc" : "asc");
            }
          } else {
            query.delete("sortBy");
            query.delete("sortOrder");
            setDel(true);
            if (del) {
              router.push(`/owner/dashboard?${query.toString()}`);
            }
          }
          if (query.toString() !== "") {
            router.push(`/owner/dashboard?${query.toString()}`);
          }
        }, 500);

        return () => clearTimeout(handle);
      }
    }
  }, [columnFilter, globalSearch, hasTyped, router, sorting, del, check]);

  const table = useMaterialReactTable({
    columns,
    data: bookData || [],
    manualFiltering: true,
    manualSorting: true,
    onColumnFiltersChange: (filters) => {
      setHasTyped(true);
      setColumnFilter(filters);
    },
    onGlobalFilterChange: (filters) => {
      setHasTyped(true);
      setGlobalSearch(filters);
    },
    onSortingChange: (sorting) => {
      setHasTyped(true);
      setSorting(sorting);
    },
    state: {
      //@ts-ignore
      columnFilter,
      sorting,
      globalSearch,
      isPending,
      showAlertBanner: isError,
      showProgressBars: isPending,
    },
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

        <Box
          sx={{
            maxHeight: "300px", // Allow the table to take up available space
            overflow: "auto", // Ensure content can scroll if it overflows
          }}
        >
          <MaterialReactTable table={table} />
        </Box>
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
