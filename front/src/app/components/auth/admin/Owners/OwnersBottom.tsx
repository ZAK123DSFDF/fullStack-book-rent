import { getAllUsers } from "@/app/actions/getAllUsers";
import { getDeleteUser } from "@/app/actions/getDeleteUser";
import { getSingleUser } from "@/app/actions/getSingleUser";
import { getVerifyUser } from "@/app/actions/getVerifyUser";
import {
  MaterialReactTable,
  MRT_ColumnFiltersState,
  MRT_SortingState,
  useMaterialReactTable,
  type MRT_ColumnDef, //if using TypeScript (optional, but recommended)
} from "material-react-table";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
export default function DashboardBottomRightTop() {
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [hasTyped, setHasTyped] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilter, setColumnFilter] = useState<MRT_ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "id",
        header: "User ID",
        size: 100,
      },
      {
        accessorKey: "name",
        header: "User Name",
        size: 200,
      },
      {
        accessorKey: "location",
        header: "User Location",
        size: 200,
      },
      {
        accessorKey: "email",
        header: "User Email",
        size: 200,
      },
      {
        accessorKey: "phoneNumber",
        header: "User PhoneNumber",
        size: 200,
      },
      {
        accessorKey: "uploadNumber",
        header: "Upload Number",
        size: 150,
      },
      {
        accessorKey: "userStatus",
        header: "User Status",
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => (
          <Button
            onClick={() => handleVerify(row.original.id)}
            variant="contained"
            sx={{
              backgroundColor:
                row.original.userStatus === "VERIFIED" ? "green" : "blue",
              color: "white",
              "&:hover": {
                backgroundColor:
                  row.original.userStatus === "VERIFIED"
                    ? "darkgreen"
                    : "darkblue",
              },
            }}
          >
            {row.original.userStatus}
          </Button>
        ),
      },
      {
        header: "Action",
        size: 200,
        enableSorting: false, // Disable sorting for the action column
        enableColumnFilter: false, // Disable filtering for the action column
        Cell: ({ row }) => (
          <>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginRight: 1 }}
              onClick={() => handleClickOpen(row.original.id)}
            >
              View
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDelete(row.original.id)}
            >
              Delete
            </Button>
          </>
        ),
      },
    ],
    []
  );

  const handleClickOpen = (userId: any) => {
    setSelectedUser(userId);
    setIsDialogOpen(true);
  };
  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const global = searchParams.get("globalSearch");
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const location = searchParams.get("location");
  const email = searchParams.get("email");
  const phoneNumber = searchParams.get("phoneNumber");
  const uploadNumber = searchParams.get("uploadNumber");
  const userStatus = searchParams.get("userStatus");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  const { data, isPending, isError, error } = useQuery({
    queryKey: [
      "getAllUsers",
      global,
      id,
      name,
      location,
      email,
      phoneNumber,
      uploadNumber,
      userStatus,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      //@ts-ignore
      getAllUsers(
        global as string,
        id as string,
        name as string,
        location as string,
        email as string,
        phoneNumber as string,
        uploadNumber as string,
        userStatus as string,
        sortBy as string,
        sortOrder as string
      ),
  });
  useEffect(() => {
    if (data) {
      setUserData(data);
    }
  }, [data]);
  const { mutate, isPending: verifying } = useMutation({
    mutationFn: getVerifyUser,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getAllUsers"]);
    },
  });

  const { mutate: deleteUser, isPending: deletingUser } = useMutation({
    mutationFn: getDeleteUser,
    onSuccess: () => {
      console.log("successfully verified");
      //@ts-ignore
      queryClient.invalidateQueries(["getAllUsers"]);
    },
  });

  const { data: singleUser, isLoading: userLoading } = useQuery({
    queryKey: ["getSingleUser", selectedUser],
    queryFn: () => getSingleUser(selectedUser),
    enabled: !!selectedUser,
  });

  const handleDelete = (id: any) => {
    deleteUser(id);
  };

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

        router.push(`/admin/Owners?${query.toString()}`);
      }, 500);

      return () => clearTimeout(handle);
    }
  }, [columnFilter, globalSearch, hasTyped, router, sorting]);
  const table = useMaterialReactTable({
    columns,
    data: userData || [],
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
        overflow: "auto", // Enable scrollbars if content overflows
        maxHeight: "700px", // Set a maximum height to trigger vertical scrolling
      }}
    >
      <Box sx={{ marginBottom: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>List of Owners</Typography>
      </Box>
      <Box>
        <MaterialReactTable table={table} />
        <Dialog open={isDialogOpen} onClose={handleClose}>
          <DialogTitle>User Details</DialogTitle>
          <DialogContent>
            {userLoading ? (
              <Typography>Loading...</Typography>
            ) : singleUser ? (
              <Box>
                <Typography variant="h6">Name: {singleUser.name}</Typography>
                <Typography>Email: {singleUser.email}</Typography>
                <Typography>Phone: {singleUser.phoneNumber}</Typography>
                <Typography>Address: {singleUser.location}</Typography>
              </Box>
            ) : (
              <Typography>No user details available.</Typography>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}
