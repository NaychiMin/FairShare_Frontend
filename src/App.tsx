import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import LoginForm from './pages/Authentication/LoginPage/LoginPage';
import RegisterForm from './pages/Authentication/RegisterPage/RegisterPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProtectedRoute from './context/Authentication/ProtectedRoute';
import ProfilePage from './pages/Profile/ProfilePage';
import GroupsPage from './pages/Groups/GroupsPage';
import ArchivedGroupsPage from './pages/Groups/ArchivedGroupsPage';
import CreateGroupForm from './pages/Groups/NewGroup';
import GroupDetailsPage from "./pages/Groups/GroupDetailsPage";
import ExpenseDetails from "./pages/Expense/ExpenseDetails";
import AcceptInvitePage from './pages/Groups/AcceptInvitePage';
import PendingInvitesPage from './pages/Groups/PendingInvitesPage';
import SentInvitesPage from './pages/Groups/SentInvitesPage';
import SettlementDetails from "./pages/Expense/SettlementDetailsPage";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route index element={<Navigate to="login" replace />} />

        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegisterForm />} />
        <Route path="groups/invite/accept" element={<AcceptInvitePage />} />
 
        <Route element={<ProtectedRoute />}> {/* routes that are login-protected */}
          <Route element={<MainLayout />}> {/* routes WITH MainLayout */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="newGroup" element={<CreateGroupForm />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="archived-groups" element={<ArchivedGroupsPage />} />
            <Route path="groups/:groupId" element={<GroupDetailsPage />} />
            <Route path="expenses/:expenseId" element={<ExpenseDetails />} />

            <Route path="sent-invites" element={<SentInvitesPage />} />
            <Route path="pending-invites" element={<PendingInvitesPage />} />

            <Route path="settlements/:settlementId" element={<SettlementDetails />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
