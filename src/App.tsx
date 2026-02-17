import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import LoginForm from './pages/Authentication/LoginPage/LoginPage';
import RegisterForm from './pages/Authentication/RegisterPage/RegisterPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProtectedRoute from './context/Authentication/ProtectedRoute';
import ProfilePage from './pages/Profile/ProfilePage';

function App() {

  return (
    <Routes>
      <Route index element={<Navigate to="login" replace />} />

      <Route path="login" element={<LoginForm />} />
      <Route path="register" element={<RegisterForm />} />

      
      <Route element={<ProtectedRoute />}> {/* routes that are login-protected */}
        <Route element={<MainLayout />}> {/* routes WITH MainLayout */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
