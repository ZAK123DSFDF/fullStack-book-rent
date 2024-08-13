"use client";
import { getLogin } from "@/app/actions/getLogin";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: getLogin,
    onSuccess: (data) => {
      localStorage.setItem("userId", data.user.id);
      window.location.href = "/owner/dashboard";
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
    mutate({ email, password });
    setEmail("");
    setPassword("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "center",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#171b36",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h1" sx={{ color: "white" }}>
          BOOK RENT
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          boxSizing: "border-box",
        }}
      >
        <Box
          component="form" // Ensure Box behaves as a form
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "300px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              alignSelf: "flex-start",
              textAlign: "left",
            }}
          >
            BOOK RENT
          </Typography>
          <Box
            sx={{
              width: "100%",
              borderBottom: "2px solid #e8e8e8",
              paddingY: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                alignSelf: "flex-start",
                textAlign: "left",
              }}
            >
              Login Form
            </Typography>
          </Box>
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            {isPending ? "Loading..." : "Login"}
          </Button>
          {isError && (
            <Typography color="error">
              {error instanceof Error ? error.message : "An error occurred."}
            </Typography>
          )}
          <Typography sx={{ alignSelf: "center" }}>
            don't have an account?
            <Link style={{ color: "blue" }} href={"/signup"}>
              {" "}
              Signup
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}