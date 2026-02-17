import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { theme } from "./theme";
import LoginForm from './pages/Authentication/LoginPage/LoginPage';
import RegisterForm from './pages/Authentication/RegisterPage/RegisterPage';

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route index element={<Navigate to="login" replace />} />

        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegisterForm />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
