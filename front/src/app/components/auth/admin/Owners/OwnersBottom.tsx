import { getAllUsers } from "@/app/actions/getAllUsers";
import { getDeleteUser } from "@/app/actions/getDeleteUser";
import { getSingleUser } from "@/app/actions/getSingleUser";
import { getVerifyUser } from "@/app/actions/getVerifyUser";
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
import { useDeferredValue, useEffect, useState } from "react";

export default function DashboardBottomRightTop() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getAllUsers", nameSearch, locationSearch, userStatusSearch],
    queryFn: () =>
      //@ts-ignore
      getAllUsers(nameSearch as string, locationSearch, userStatusSearch),
  });

  const { mutate } = useMutation({
    mutationFn: getVerifyUser,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries("getAllUsers");
    },
  });

  const { mutate: deleteUser, isPending: deletingUser } = useMutation({
    mutationFn: getDeleteUser,
    onSuccess: () => {
      //@ts-ignore
      queryClient.invalidateQueries("getAllUsers");
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
    router.push(`${pathName}?${queryParams.toString()}`);
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

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "white",
        flex: 2,
        padding: 2,
        borderRadius: "8px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
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
        {isLoading ? (
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
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "400px",
              overflowY: "auto",
              backgroundColor: "transparent",
              boxShadow: "none",
              "&::-webkit-scrollbar": {
                width: "6px", // Thinner scrollbar width
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent", // Track background
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0, 0, 0, 0.3)", // Default scrollbar color
                borderRadius: "10px", // Rounded corners
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Darker color on hover
              },
            }}
          >
            <Table sx={{ backgroundColor: "transparent" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    User ID
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    User Name
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    User Location
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    User Email
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    User PhoneNumber
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    Upload Number
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    User Status
                  </TableCell>
                  <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell sx={{ padding: "4px" }}>{user.id}</TableCell>
                    <TableCell sx={{ padding: "4px" }}>{user.name}</TableCell>
                    <TableCell sx={{ padding: "4px" }}>
                      {user.location}
                    </TableCell>
                    <TableCell sx={{ padding: "4px" }}>{user.email}</TableCell>
                    <TableCell sx={{ padding: "4px" }}>
                      {user.phoneNumber}
                    </TableCell>
                    <TableCell sx={{ padding: "4px" }}>
                      {user.uploadNumber}
                    </TableCell>
                    <TableCell sx={{ padding: "4px" }}>
                      <Button
                        onClick={() => handleVerify(user.id)}
                        variant="contained"
                        sx={{
                          backgroundColor:
                            user.userStatus === "VERIFIED" ? "green" : "blue",
                          color: "white",
                          "&:hover": {
                            backgroundColor:
                              user.userStatus === "VERIFIED"
                                ? "darkgreen"
                                : "darkblue",
                          },
                        }}
                      >
                        {user.userStatus}
                      </Button>
                    </TableCell>
                    <TableCell sx={{ padding: "4px" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ marginRight: 1 }}
                        onClick={() => handleClickOpen(user.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(user.id)}
                      >
                        {deletingUser ? "Deleting" : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
                {/* Add more user details as needed */}
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
