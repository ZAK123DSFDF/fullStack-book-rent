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
  const category = searchParams.get("categoryname");
  const name = searchParams.get("name");
  const author = searchParams.get("author");
  const count = searchParams.get("count");
  const price = searchParams.get("price");
  const bookStatus = searchParams.get("bookStatus");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  let actualSortBy = sortBy;
  if (sortBy === "categoryname") {
    actualSortBy = "category";
  }
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      { accessorKey: "id", header: "Book ID", size: 100 },
      {
        accessorKey: "category.name",
        header: "Category Name",
        size: 200,
      },
      { accessorKey: "name", header: "Book Name", size: 150 },
      { accessorKey: "author", header: "Book Author", size: 150 },
      { accessorKey: "count", header: "Count", size: 100 },
      { accessorKey: "price", header: "Price", size: 100 },
      {
        accessorKey: "bookStatus",
        header: "Book Status",
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => {
          const bookStatus = row.original.bookStatus;
          const isActive = bookStatus === "ACTIVE";

          return (
            <Button
              sx={{
                backgroundColor: isActive ? "green" : "red", // Set color based on status
                color: "white",
                boxShadow: "none",
                cursor: "default", // Remove pointer cursor
                "&:hover": {
                  backgroundColor: isActive ? "green" : "red", // Ensure hover color matches background
                  boxShadow: "none",
                },
              }}
            >
              {bookStatus}
            </Button>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        enableSorting: false,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor:
                  row.original.status === "FREE" ? "blue" : "red",
                marginRight: 1, // Add some spacing between the circle and text
              }}
            />
            {row.original.status}
          </Box>
        ),
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
      category,
      name,
      author,
      count,
      price,
      bookStatus,
      status,
      actualSortBy,
      sortOrder,
    ],
    queryFn: () =>
      getOwnerBooks(
        global as string,
        id as string,
        category as string,
        name as string,
        author as string,
        count as string,
        price as string,
        bookStatus as string,
        status as string,
        actualSortBy as string,
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
              const key = filter.id.replace(".", "");
              query.set(key, filter.value as string);
            } else {
              const key = filter.id.replace(".", "");
              query.delete(key);
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
              const sortByKey = id.replace(".", "");
              query.set("sortBy", sortByKey);
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
    renderTopToolbarCustomActions: () => (
      <Typography
        sx={{ fontWeight: "bold", fontSize: "15px", marginLeft: "5px" }}
      >
        Live Book Status
      </Typography>
    ),
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
        maxHeight: "290px",
        "@media (min-width: 1536px)": {
          maxHeight: "380px",
        },
        padding: 2,
        borderRadius: "8px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          overflow: "auto",
          maxHeight: "500px",
          maxWidth: "100%",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
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
          "&::-webkit-scrollbar-corner": {
            backgroundColor: "transparent",
          },
        }}
      >
        <MaterialReactTable table={table} />
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
