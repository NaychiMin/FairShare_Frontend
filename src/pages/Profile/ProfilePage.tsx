import React, { useState } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
  Tabs,
  Tab,
  Alert,
  type SnackbarCloseReason,
  Snackbar,
} from "@mui/material";
import { useAuth } from "../../context/Authentication/useAuth";
import UserAvatar from "../../components/UserAvatar";
import ChangePasswordForm from "./ChangePasswordForm";
import { AxiosError } from "axios";
import authService from "../../services/authService";

export type ProfileFormInputs = {
  name: string;
  email: string;
};

// Validation schema using Yup
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

const ProfilePage: React.FC = () => {
  const { user, jwtToken, updateUser } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const errorMessageDefault = "Unable to update profile at this time. Please try again later."
  
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });
  const [value, setValue] = useState("profile");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleToastClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccess(false);
  };

  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.update(data, user?.userId || "nil", jwtToken || "");
      if (response.user) {
        updateUser(response.user);
        setSuccess(true);
      }
    } catch (err) {
      console.error(error);
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
    <div className="full-page-body">
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message={
          <Alert variant="outlined" severity="success">
            Successfully updated profile.
          </Alert>
        }
      />
      <Paper
        variant="outlined"
        sx={{
          padding: "1rem",
          display: "flex",
          justifyContent: "flex-start",
          alignContent: "center",
          gap: "1rem",
        }}
      >
        <UserAvatar name={user?.name || ""} />
        <Typography variant="h6">{user?.name}</Typography>
      </Paper>
      <Paper
        variant="outlined"
        sx={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginTop: "1rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Tabs value={value} onChange={handleChange} sx={{ marginBottom: "1rem" }}>
          <Tab value="profile" label="Profile" />
          <Tab value="password" label="Change Password" />
          <Tab value="other" label="Other Settings" />
        </Tabs>
        <div className="w-full">
          {value === "profile" ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={loading}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={loading}
                    />
                  )}
                />

                <TextField
                  label="Status"
                  value="Active" // or from user.status
                  fullWidth
                  InputProps={{ readOnly: true, disabled: true }}
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
          ) : value === "password" ? (
            <ChangePasswordForm/>
          ) : (
            <></>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default ProfilePage;
