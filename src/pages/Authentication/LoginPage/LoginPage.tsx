// LoginPage.tsx
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Button, Box, Typography } from "@mui/material";
import { type LoginFormInputs } from "./index.types";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email required"),
  password: yup.string().min(6, "Password must be at least 6 chars").required("Password required"),
}).required();

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema)
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
    console.log("Login Data:", data);
    // Call API here
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: 300, mx: "auto", mt: 5 }}>
      <Typography variant="h5" mb={3}>Log In</Typography>
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Log In
      </Button>
    </Box>
  );
};

export default LoginPage;
