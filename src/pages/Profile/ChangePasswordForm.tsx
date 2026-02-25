import React, { useState } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Button, Stack } from "@mui/material";

type ChangePasswordInputs = {
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
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChangePasswordInputs>({
    resolver: yupResolver(passwordSchema),
  });

  const onSubmit: SubmitHandler<ChangePasswordInputs> = async (data) => {
    setLoading(true);
    try {
      console.log("Profile data to save:", data);
      // TODO: Replace with API call to save profile
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Controller
          name="oldPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Old Password"
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
