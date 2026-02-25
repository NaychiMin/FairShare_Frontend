// RegisterPage.tsx
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { type RegisterFormInputs } from "./index.types";
import authService from "../../../services/authService";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import "../authentication.css";

const schema = yup
  .object({
    name: yup.string().required("Name required"),
    email: yup.string().email("Invalid email").required("Email required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 chars")
      .required("Password required"),
    password2: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm your password"),
  })
  .required();

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema),
  });
  const errorMessageDefault =
    "Unable to register at this time. Please try again later.";

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      await authService.register(data);
      setSuccess(true);
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

  const handleClose = () => {
    setSuccess(false);
    navigate("/login");
  };

  return (
    <div className="auth-body">
      <div>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: 400, mx: "auto" }}
          autoComplete="off"
        >
          <Typography variant="h5" mb={2}>
            Getting Started
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Name"
            fullWidth
            margin="normal"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={loading}
          />
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
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            {...register("password2")}
            error={!!errors.password2}
            helperText={errors.password2?.message}
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
            Sign Up
          </Button>
          <Button
            startIcon={<ArrowBackIcon />}
            variant="text"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
            onClick={() => navigate("/login")}
          >
            Return to Log In
          </Button>
        </Box>
        <Dialog
          open={success}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Alert variant="filled" severity="success">
              Successfully created an account.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Return to Log In page</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default RegisterPage;
