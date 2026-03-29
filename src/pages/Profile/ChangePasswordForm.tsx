import React, { useState } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Button, Stack, Alert } from "@mui/material";
import authService from "../../services/authService";
import { useAuth } from "../../context/Authentication/useAuth";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

export type ChangePasswordInputs = {
  oldPassword: string;
  password: string;
  password2: string;
};

const passwordSchema = yup.object({
  oldPassword: yup.string().required("Old password is required"),
  password: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  password2: yup
    .string()
    .required("Please confirm password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const ChangePasswordForm: React.FC = () => {
  const { user, jwtToken } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorMessageDefault =
    "Unable to update profile at this time. Please try again later.";

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInputs>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      password2: "",
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordInputs> = async (data) => {
    setLoading(true);
    setError(null);

    try {
      await authService.updatePassword(
        data,
        user?.userId || "nil",
        jwtToken || "",
      );
      toast.success("Successfully updated password.");
      reset();
    } catch (err) {
      console.error(err);
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Controller
          name="oldPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Old Password"
              type="password"
              fullWidth
              error={!!errors.oldPassword}
              helperText={errors.oldPassword?.message}
              disabled={loading}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="New Password"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
            />
          )}
        />

        <Controller
          name="password2"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Confirm New Password"
              type="password"
              fullWidth
              error={!!errors.password2}
              helperText={errors.password2?.message}
              disabled={loading}
            />
          )}
        />

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          Save
        </Button>
      </Stack>
    </form>
  );
};

export default ChangePasswordForm;
