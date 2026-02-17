// RegisterPage.tsx
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Button, Box, Typography } from "@mui/material";
import { type RegisterFormInputs } from "./index.types";

const schema = yup.object({
  name: yup.string().required("Name required"),
  email: yup.string().email("Invalid email").required("Email required"),
  password: yup.string().min(6, "Password must be at least 6 chars").required("Password required"),
  confirmPassword: yup.string()
     .oneOf([yup.ref("password")], "Passwords must match")
     .required("Confirm your password")
}).required();

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema)
  });

  const onSubmit: SubmitHandler<RegisterFormInputs> = (data) => {
    console.log("Register Data:", data);
    // Call API here
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: 300, mx: "auto", mt: 5 }}>
      <Typography variant="h5" mb={3}>Get Started</Typography>
      <TextField
        label="Name"
        fullWidth
        margin="normal"
        {...register("name")}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
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
      <TextField
        label="Confirm Password"
        type="password"
        fullWidth
        margin="normal"
        {...register("confirmPassword")}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Sign Up
      </Button>
    </Box>
  );
};

export default RegisterPage;
