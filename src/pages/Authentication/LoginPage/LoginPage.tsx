// LoginPage.tsx
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { type LoginFormInputs } from "./index.types";
import { useAuth } from "../../../context/Authentication/useAuth";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import "../authentication.css";

const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().required("Password is required"),
  })
  .required();

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });
  const errorMessageDefault =
    "Unable to log in at this time. Please try again later.";

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true);
    setError("");

    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || errorMessageDefault);
      } else {
        setError(errorMessageDefault);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-body">
      <div>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "400", mx: "auto" }}
        >
          <Typography variant="h5" mb={2}>
            Log In
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={loading}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            Log In
          </Button>
        </Box>
        <Button
          variant="text"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
          onClick={() => navigate("/register")}
        >
          No account with us? Register here
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
