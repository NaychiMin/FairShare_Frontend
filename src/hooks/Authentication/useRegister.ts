import { useState } from "react";
import { registerApi } from "../services/authService";
import { RegisterRequest, ApiError } from "../types/auth";
import { validateRegister } from "../validation/registerValidation";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const register = async (data: RegisterRequest) => {
    setServerError("");
    setErrors({});

    const validationErrors = validateRegister(data);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    try {
      setLoading(true);
      await registerApi(data);
      return true;
    } catch (err: any) {
      const apiError = err as ApiError;

      if (apiError.fieldErrors) {
        setErrors(apiError.fieldErrors);
      } else {
        setServerError(apiError.message || "Registration failed");
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    errors,
    serverError
  };
};
