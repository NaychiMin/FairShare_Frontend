import React, { useState, useEffect } from "react";
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
  Snackbar,
} from "@mui/material";
import { AxiosError } from "axios";

import { useAuth } from "../../context/Authentication/useAuth";
import UserAvatar from "../../components/UserAvatar";
import ChangePasswordForm from "./ChangePasswordForm";
import authService from "../../services/authService";
import { toast } from "react-toastify";

import badgeService from "../../services/badgeService";
import type { UserBadge } from "../../services/badgeService";

// --- Validation schema ---
export type ProfileFormInputs = {
  name: string;
  email: string;
};

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // --- Form states ---
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [value, setValue] = useState("profile");

  // --- Badge states ---
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

  const errorMessageDefault =
    "Unable to update profile at this time. Please try again later.";

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

  // --- Handle tab changes ---
  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleToastClose = () => {
    setSuccess(false);
  };

  // --- Submit profile update ---
  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.update(
        data,
        user?.userId || "nil"
      );
      if (response.user) {
        updateUser(response.user);
        toast.success("Successfully updated profile.");
      }
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

  // --- Fetch user badges ---
  useEffect(() => {
    // if (!jwtToken) return;

    const fetchBadges = async () => {
      setBadgesLoading(true);
      try {
        if (!user?.email) return;
        const badges = await badgeService.getUserBadges(user.email);
        setBadges(badges);
      } catch (err) {
        console.error("Failed to fetch badges", err);
        setError("Failed to load badges");
      } finally {
        setBadgesLoading(false);
      }
    };

    fetchBadges();
  }, [user.email]);

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

      {/* --- User Header --- */}
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

      {/* --- Tabs --- */}
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
          <Tab value="badges" label="Badges" />
          <Tab value="other" label="Other Settings" />
        </Tabs>

        <div className="w-full">
          {value === "profile" && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
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
                  value="Active"
                  fullWidth
                  InputProps={{ readOnly: true, disabled: true }}
                />
                <Button variant="contained" color="primary" type="submit" disabled={loading}>
                  Save
                </Button>
              </Stack>
            </form>
          )}

          {value === "password" && <ChangePasswordForm />}

          {/* --- Badges tab --- */}
          {value === "badges" && (
            <Paper sx={{ padding: "1rem", mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                My Badges
              </Typography>
              {badgesLoading ? (
                <Typography>Loading badges...</Typography>
              ) : badges.length === 0 ? (
                <Typography>No badges earned yet.</Typography>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                  {badges.map((badge, index) => (
                    <Paper
                      key={index}
                      sx={{
                        padding: "1rem",
                        minWidth: 150,
                        textAlign: "center",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <Typography variant="subtitle1">{badge.badgeName}</Typography>
                      <Typography variant="body2">{badge.description}</Typography>
                      <Typography variant="caption">
                        {badge.badgeType}{" "}
                        {badge.badgeScope === "GROUP" && `(Group: ${badge.groupName})`}
                      </Typography>
                    </Paper>
                  ))}
                </div>
              )}
            </Paper>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default ProfilePage;