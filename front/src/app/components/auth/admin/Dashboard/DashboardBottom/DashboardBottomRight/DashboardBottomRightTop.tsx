import { getAdminBook } from "@/app/actions/getAdminBook";
import { getVerifyBook } from "@/app/actions/getVerifyBook";
import {
  MaterialReactTable,
  MRT_ColumnFiltersState,
  MRT_SortingState,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Box, Button, Switch, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { getActivateBook } from "@/app/actions/getActivateBook";
import { getDeactivateBook } from "@/app/actions/getDeactivateBook";

export default function DashboardBottomRightTop() {
  const searchParams = useSearchParams();
  const [bookData, setBookData] = useState([]);
  const [del, setDel] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilter, setColumnFilter] = useState<MRT_ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [check, setCheck] = useState(false);
  const { mutate: activateBook } = useMutation({
    mutationFn: (id: any) => getActivateBook(id),
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getAllBooksDashboard"]);
    },
  });

  // Mutation to deactivate the user
  const { mutate: deactivateBook } = useMutation({
    mutationFn: (id: any) => getDeactivateBook(id),
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getAllBooksDashboard"]);
    },
  });

  // Handle the toggle status
  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    if (newStatus === "ACTIVE") {
      activateBook({ id });
    } else {
      deactivateBook({ id });
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setCheck(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [check]);
  console.log("this is check", check);
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
              router.push(`/admin/dashboard?${query.toString()}`);
            }
          }
          columnFilter.forEach((filter) => {
            if (filter.value) {
              const key = filter.id.replace(".", "");
              query.set(key, filter.value as string);
            } else {
              const key = filter.id.replace(".", "");
              query.delete(key);
              setDel(true);
              if (del) {
                router.push(`/admin/dashboard?${query.toString()}`);
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
              router.push(`/admin/dashboard?${query.toString()}`);
            }
          }
          if (query.toString() !== "") {
            router.push(`/admin/dashboard?${query.toString()}`);
          }
        }, 500);

        return () => clearTimeout(handle);
      }
    }
  }, [columnFilter, globalSearch, hasTyped, router, sorting, del, check]);
  // Define columns for the MaterialReactTable
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Book ID",
        size: 100,
      },
      {
        accessorKey: "owner.name", // Accessor for nested owner.name
        header: "Owner Name",
        size: 200,
      },
      {
        accessorKey: "category.name", // Accessor for nested category.name
        header: "Category Name",
        size: 200,
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
        Cell: ({ row }) => {
          const isActive = row.original.bookStatus === "ACTIVE";
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: isActive ? "#d4f3d4" : "#f3d4d4",
                padding: "4px 8px",
                borderRadius: "8px",
                color: "white",
              }}
            >
              {isActive ? <Check color="green" /> : <X color="red" />}
              <Typography
                sx={{
                  marginRight: "8px",
                  fontWeight: "bold",
                  color: isActive ? "green" : "red",
                }}
              >
                {isActive ? "Active" : "Inactive"}
              </Typography>
              <Switch
                checked={isActive}
                onChange={() =>
                  handleToggleStatus(row.original.id, row.original.bookStatus)
                }
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: isActive ? "darkgreen" : "red",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: isActive ? "darkgreen" : "red",
                  },
                }}
              />
            </Box>
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
    ],
    []
  );
  const global = searchParams.get("globalSearch");
  const id = searchParams.get("id");
  const ownerName = searchParams.get("ownername");
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
  if (sortBy === "ownername") {
    actualSortBy = "ownerName";
  } else if (sortBy === "categoryname") {
    actualSortBy = "category";
  }
  const { data, isPending, isError, error } = useQuery({
    queryKey: [
      "getAllBooksDashboard",
      global,
      id,
      ownerName,
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
      getAdminBook(
        global as string,
        id as string,
        ownerName as string,
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
  const { mutate } = useMutation({
    mutationFn: getVerifyBook,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getAllBooksDashboard"]);
    },
  });
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
    </Box>
  );
}
