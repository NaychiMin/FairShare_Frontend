import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css'

import LoginForm from './pages/Authentication/LoginPage/LoginPage';
import RegisterForm from './pages/Authentication/RegisterPage/RegisterPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProtectedRoute from './context/Authentication/ProtectedRoute';
import ProfilePage from './pages/Profile/ProfilePage';
import GroupsPage from './pages/Groups/GroupsPage';
import ArchivedGroupsPage from './pages/Groups/ArchivedGroupsPage';
import CreateGroupForm from './pages/Groups/NewGroup';

function App() {

  return (
    <>
      <ToastContainer />
      <Routes>
    
        <Route index element={<Navigate to="login" replace />} />

        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegisterForm />} />

        
        <Route element={<ProtectedRoute />}> {/* routes that are login-protected */}
          <Route element={<MainLayout />}> {/* routes WITH MainLayout */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="newGroup" element={<CreateGroupForm />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="archived-groups" element={<ArchivedGroupsPage />} />
          </Route>
        </Route>
      </Routes>-
    </>
  )
}

export default App
