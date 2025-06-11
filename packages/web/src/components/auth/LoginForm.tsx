import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { LoginRequest, ApiError } from "@todo-app/client-common";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFieldError,
    clearErrors,
  } = useForm<LoginRequest>({
    resolver: yupResolver(validationSchema),
    // Ensure form data is preserved on error
    shouldUnregister: false,
    mode: "onChange",
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      // Clear any previous errors
      setError("");
      clearErrors();

      await login(data);
      navigate("/dashboard");
    } catch (err: any) {
      // Handle different types of errors
      let errorMessage = "Login failed. Please try again.";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Set the general error message
      setError(errorMessage);

      // Set field-specific errors based on the error message
      if (
        errorMessage.toLowerCase().includes("invalid credentials") ||
        errorMessage.toLowerCase().includes("invalid email or password") ||
        errorMessage.toLowerCase().includes("incorrect password") ||
        errorMessage.toLowerCase().includes("user not found")
      ) {
        setFieldError("email", {
          type: "server",
          message: "Invalid email or password",
        });
        setFieldError("password", {
          type: "server",
          message: "Invalid email or password",
        });
      } else if (errorMessage.toLowerCase().includes("email")) {
        setFieldError("email", {
          type: "server",
          message: errorMessage,
        });
      }

      console.log("Login error:", errorMessage);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="grey.50"
    >
      <Card sx={{ maxWidth: 400, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="center"
          >
            Welcome Back
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mb={3}
          >
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                {...register("email")}
                label="Email Address"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
                autoFocus
              />

              <TextField
                {...register("password")}
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Stack>
          </Box>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2">
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Typography
                  component="span"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  Sign up
                </Typography>
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;
