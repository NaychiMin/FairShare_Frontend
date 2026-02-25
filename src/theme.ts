import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light", // dark vs light mode
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});
