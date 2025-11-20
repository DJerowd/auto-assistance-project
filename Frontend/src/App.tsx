import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import VehicleMaintenancesPage from "./pages/VehicleMaintenancesPage";
import VehicleRemindersPage from "./pages/VehicleRemindersPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<AdminRoute />}>
               <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/:vehicleId" element={<VehicleDetailPage />} />
            <Route path="/vehicles/:vehicleId/maintenances" element={<VehicleMaintenancesPage />} />
            <Route path="/vehicles/:vehicleId/reminders" element={<VehicleRemindersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
