"use client";
import { getSignup } from "@/app/actions/getSignup";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      location: "",
      phoneNumber: "",
    },
    mode: "onBlur",
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: getSignup,
    onSuccess: (data) => {
      localStorage.setItem("userId", data.user.id);
      window.location.href = "/owner/dashboard";
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await mutate(data);
      reset();
    } catch (err) {
      console.error("Signup failed:", err);
    }
  };
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

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
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 5,
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
              Signup Form
            </Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="Name"
              variant="outlined"
              type="text"
              fullWidth
              {...register("name", { required: "Name is required" })}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
            <TextField
              label="Email"
              variant="outlined"
              type="email"
              fullWidth
              {...register("email", { required: "Email is required" })}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              {...register("password", { required: "Password is required" })}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
            <TextField
              label="Confirm Password"
              variant="outlined"
              type="password"
              fullWidth
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword?.message}
            />
            <TextField
              label="Location"
              variant="outlined"
              type="text"
              fullWidth
              {...register("location", { required: "Location is required" })}
              error={Boolean(errors.location)}
              helperText={errors.location?.message}
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              type="text"
              fullWidth
              {...register("phoneNumber", {
                required: "Phone number is required",
              })}
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber?.message}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit"}
            </Button>
            {isError && (
              <Typography color="error">
                {error instanceof Error ? error.message : "An error occurred."}
              </Typography>
            )}
            <Typography sx={{ alignSelf: "center" }}>
              Have an account?{" "}
              <Link
                style={{ color: "blue", cursor: "pointer" }}
                href={"/login"}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
