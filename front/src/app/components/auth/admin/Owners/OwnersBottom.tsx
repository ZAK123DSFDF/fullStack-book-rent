import { getAllUsers } from "@/app/actions/getAllUsers";
import { getDeleteUser } from "@/app/actions/getDeleteUser";
import { getSingleUser } from "@/app/actions/getSingleUser";
import { getVerifyUser } from "@/app/actions/getVerifyUser";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

export default function DashboardBottomRightTop() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "id", // Accessor for the data
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
    setSelectedUser(userId); // Set the selected user ID or user object
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const nameSearch = useDeferredValue(searchParams.get("search"));
  const locationSearch = useDeferredValue(searchParams.get("location"));
  const userStatusSearch = useDeferredValue(searchParams.get("userStatus"));
  const router = useRouter();
  const pathName = usePathname();
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["getAllUsers", nameSearch, locationSearch, userStatusSearch],
    queryFn: () =>
      //@ts-ignore
      getAllUsers(nameSearch as string, locationSearch, userStatusSearch),
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
      queryClient.invalidateQueries([
        "getAllUsers",
        nameSearch,
        locationSearch,
        userStatusSearch,
      ]);
    },
  });

  const { mutate: deleteUser, isPending: deletingUser } = useMutation({
    mutationFn: getDeleteUser,
    onSuccess: () => {
      console.log("successfully verified");
      //@ts-ignore
      queryClient.invalidateQueries([
        "getAllUsers",
        nameSearch,
        locationSearch,
        userStatusSearch,
      ]);
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
    const queryParams = new URLSearchParams();
    if (name) queryParams.append("search", name);
    if (location) queryParams.append("location", location);
    if (userStatus) queryParams.append("userStatus", userStatus);
  }, [name, location, userStatus, router, pathName]);

  useEffect(() => {
    if (hasTyped) {
      const handle = setTimeout(() => {
        const query = new URLSearchParams();
        if (name) query.set("search", name);
        if (location) query.set("location", location);
        if (userStatus) query.set("userStatus", userStatus);
        router.push(`Owners?${query.toString()}`);
      }, 500);
      return () => clearTimeout(handle);
    }
  }, [router, name, location, userStatus, hasTyped]);
  const table = useMaterialReactTable({
    columns,
    data: userData || [], //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableRowSelection: true, //enable some features
    enableColumnOrdering: true, //enable a feature for all columns
    enableGlobalFilter: true, //turn off a feature
  });
  console.log(table);
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
        <Typography sx={{ fontWeight: "bold" }}>List of Owners</Typography>
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
            label="Location"
            variant="outlined"
            sx={{ marginRight: 2 }}
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setHasTyped(true);
            }}
          />
          <FormControl sx={{ marginRight: 2, minWidth: 150 }}>
            <InputLabel id="user-status-select-label">User Status</InputLabel>
            <Select
              labelId="user-status-select-label"
              id="user-status-select"
              value={userStatus}
              onChange={(e) => {
                setUserStatus(e.target.value);
                setHasTyped(true);
              }}
              label="User Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="VERIFIED">Verified</MenuItem>
              <MenuItem value="NOTVERIFIED">Not Verified</MenuItem>
            </Select>
          </FormControl>
        </form>
      </Box>
      <Box>
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
            Error loading users: {error.message}
          </Typography>
        ) : data?.length === 0 ? (
          <Typography sx={{ textAlign: "center" }}>No users found.</Typography>
        ) : (
          <MaterialReactTable table={table} />
        )}

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
