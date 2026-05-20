import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";

import Landing from "../pages/auth/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/auth/Unauthorized";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminCollections from "../pages/admin/Collections";
import AdminPayments from "../pages/admin/Payments";
import AdminStudents from "../pages/admin/Students";
import AdminAnnouncements from "../pages/admin/Announcements";
import AdminAIHelper from "../pages/admin/AIHelper";
import AdminSettings from "../pages/admin/Settings";

import StudentDashboard from "../pages/student/Dashboard";
import StudentCollections from "../pages/student/MyCollections";
import StudentPayments from "../pages/student/MyPayments";
import StudentAnnouncements from "../pages/student/Announcements";
import StudentProfile from "../pages/student/Profile";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin Pages */}
      <Route
        path="/admin/dashboard"
        element={
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        }
      />

      <Route
        path="/admin/collections"
        element={
          <DashboardLayout>
            <AdminCollections />
          </DashboardLayout>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <DashboardLayout>
            <AdminPayments />
          </DashboardLayout>
        }
      />

      <Route
        path="/admin/students"
        element={
          <DashboardLayout>
            <AdminStudents />
          </DashboardLayout>
        }
      />

      <Route
        path="/admin/announcements"
        element={
          <DashboardLayout>
            <AdminAnnouncements />
          </DashboardLayout>
        }
      />

      <Route
        path="/admin/ai-helper"
        element={
          <DashboardLayout>
            <AdminAIHelper />
          </DashboardLayout>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <DashboardLayout>
            <AdminSettings />
          </DashboardLayout>
        }
      />

      {/* Student Pages */}
      <Route
        path="/student/dashboard"
        element={
          <DashboardLayout>
            <StudentDashboard />
          </DashboardLayout>
        }
      />

      <Route
        path="/student/collections"
        element={
          <DashboardLayout>
            <StudentCollections />
          </DashboardLayout>
        }
      />

      <Route
        path="/student/payments"
        element={
          <DashboardLayout>
            <StudentPayments />
          </DashboardLayout>
        }
      />

      <Route
        path="/student/announcements"
        element={
          <DashboardLayout>
            <StudentAnnouncements />
          </DashboardLayout>
        }
      />

      <Route
        path="/student/profile"
        element={
          <DashboardLayout>
            <StudentProfile />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default AppRoutes;