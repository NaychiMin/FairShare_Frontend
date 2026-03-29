import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import App from "./App.tsx";
import "./index.css";

import { theme } from "./theme";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/Authentication/AuthProvider.tsx";
import { AuthBadgeProvider } from "./context/Badge/AuthBadgeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthBadgeProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </AuthBadgeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
