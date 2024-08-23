"use client";
import { getAdminBook } from "@/app/actions/getAdminBook";
import { getVerifyBook } from "@/app/actions/getVerifyBook";
import {
  MaterialReactTable,
  MRT_ColumnFiltersState,
  MRT_SortingState,
  useMaterialReactTable,
  type MRT_ColumnDef, //if using TypeScript (optional, but recommended)
} from "material-react-table";
import { Box, Button, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function DashboardBottomRightTop() {
  const searchParams = useSearchParams();
  const [hasTyped, setHasTyped] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilter, setColumnFilter] = useState<MRT_ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
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
        accessorKey: "bookStatus",
        header: "bookStatus",
        size: 150,
        enableSorting: false,
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
      {
        accessorKey: "status",
        header: "status",
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => <Typography>{row.original.status}</Typography>,
      },
    ],
    []
  );

  // Fetch books based on search parameters
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

  const { data, isPending, isError, error } = useQuery({
    queryKey: [
      "getAllBooks",
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
      getAdminBook(
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

  const { mutate, isPending: verifying } = useMutation({
    mutationFn: getVerifyBook,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getAllBooks"]);
    },
  });

  const handleVerify = (id: any) => {
    mutate(id);
  };
  useEffect(() => {
    if (hasTyped) {
      const handle = setTimeout(() => {
        const query = new URLSearchParams();

        // Add global search parameter
        if (globalSearch) {
          query.set("globalSearch", globalSearch);
        } else {
          query.delete("globalSearch");
        }

        // Add column filters parameters
        columnFilter.forEach((filter) => {
          if (filter.value) {
            query.set(filter.id, filter.value as string);
          } else {
            query.delete(filter.id);
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
        }

        router.push(`/admin/Books?${query.toString()}`);
      }, 500);

      return () => clearTimeout(handle);
    }
  }, [columnFilter, globalSearch, hasTyped, router, sorting]);
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
        maxWidth: "1300px",
      }}
    >
      <Box sx={{ marginBottom: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>List of Books</Typography>
      </Box>
      <MaterialReactTable table={table} />
    </Box>
  );
}
