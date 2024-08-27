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
  Switch,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { getDeactivateUser } from "@/app/actions/getDeactivateUser";
import { getActivateUser } from "@/app/actions/getActivateUser";
import { Check, CheckCircleIcon, X } from "lucide-react";
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
        accessorKey: "updateStatus",
        header: "Update Status",
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => {
          const isActive = row.original.updateStatus === "ACTIVE";
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: isActive ? "#d4f3d4" : "#f3d4d4", // light green and light red
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
                  color: isActive ? "green" : "red", // Text color based on status
                }}
              >
                {isActive ? "Active" : "Inactive"}
              </Typography>
              <Switch
                checked={isActive}
                onChange={() =>
                  handleToggleStatus(row.original.id, row.original.updateStatus)
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
            {row.original.userStatus === "VERIFIED" ? "APPROVED" : "APPROVE"}
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
  const { mutate: activateUser } = useMutation({
    mutationFn: (id: any) => getActivateUser(id),
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getAllUsers"]);
    },
  });

  // Mutation to deactivate the user
  const { mutate: deactivateUser } = useMutation({
    mutationFn: (id: any) => getDeactivateUser(id),
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries(["getAllUsers"]);
    },
  });

  // Handle the toggle status
  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    if (newStatus === "ACTIVE") {
      activateUser({ id });
    } else {
      deactivateUser({ id });
    }
  };
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
  const updateStatus = searchParams.get("updateStatus");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  let actualUserStatus = userStatus;
  if (userStatus === "APPROVE") {
    actualUserStatus = "NOTVERIFIED";
  } else if (userStatus === "APPROVED") {
    actualUserStatus = "VERIFIED";
  }
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
      actualUserStatus,
      updateStatus,
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
        actualUserStatus as string,
        updateStatus as string,
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
        if (globalSearch) {
          query.set("globalSearch", globalSearch);
        } else {
          query.delete("globalSearch");
        }
        columnFilter.forEach((filter) => {
          if (filter.value) {
            query.set(filter.id, filter.value as string);
          } else {
            query.delete(filter.id);
          }
        });
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
    renderTopToolbarCustomActions: () => (
      <Typography
        sx={{ fontWeight: "bold", fontSize: "15px", marginLeft: "5px" }}
      >
        List Of Owners
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
        height: "100%",
        padding: 2,
        borderRadius: "8px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box>
        <Box
          sx={{
            overflow: "auto",
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
