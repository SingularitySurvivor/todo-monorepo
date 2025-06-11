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
  Grid,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterRequest, ApiError } from "@todo-app/client-common";

const validationSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFieldError,
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(validationSchema),
    // Ensure form data is preserved on error
    shouldUnregister: false,
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Clear any previous errors
      setError("");
      clearErrors();

      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      navigate("/dashboard");
    } catch (err: any) {
      // Handle different types of errors
      let errorMessage = "Registration failed. Please try again.";

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Set the general error message
      setError(errorMessage);

      // If it's an email-related error, also set a field-specific error
      if (
        errorMessage
          .toLowerCase()
          .includes("user with this email already exists")
      ) {
        setFieldError("email", {
          type: "server",
          message:
            "This email is already registered. Please use a different email or try signing in.",
        });
      }

      // Form data will be preserved automatically
      // The form will NOT reset and all user input will remain
      console.log("Registration error:", errorMessage);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="grey.50"
      py={4}
    >
      <Card sx={{ maxWidth: 500, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            textAlign="center"
          >
            Create Account
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mb={3}
          >
            Sign up to get started with our todo collaboration platform
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    {...register("firstName")}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    autoComplete="given-name"
                    autoFocus
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    {...register("lastName")}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    autoComplete="family-name"
                  />
                </Grid>
              </Grid>

              <TextField
                {...register("email")}
                label="Email Address"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
              />

              <TextField
                {...register("password")}
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={
                  errors.password?.message ||
                  "Must be at least 8 characters with uppercase, lowercase, number, and special character"
                }
                autoComplete="new-password"
              />

              <TextField
                {...register("confirmPassword")}
                label="Confirm Password"
                type="password"
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                autoComplete="new-password"
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
                  "Create Account"
                )}
              </Button>
            </Stack>
          </Box>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2">
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Typography
                  component="span"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  Sign in
                </Typography>
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterForm;
