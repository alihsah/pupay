import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";

import Landing from "../pages/auth/Landing";
import SignInPage from "../pages/auth/SignInPage";
import SignUpPage from "../pages/auth/SignUpPage";
import Unauthorized from "../pages/auth/Unauthorized";

import ClerkTokenProvider from "./ClerkTokenProvider";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import RoleRedirect from "./RoleRedirect";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminCollections from "../pages/admin/Collections";
import AdminCollectionDetails from "../pages/admin/CollectionDetails";
import AdminPayments from "../pages/admin/Payments";
import AdminStudents from "../pages/admin/Students";
import AdminAnnouncements from "../pages/admin/Announcements";
import AIHelper from "../pages/admin/AIHelper";
import AdminArchives from "../pages/admin/Archives";
import AdminSettings from "../pages/admin/Settings";

import StudentDashboard from "../pages/student/Dashboard";
import StudentCollections from "../pages/student/MyCollections";
import StudentPayments from "../pages/student/MyPayments";
import StudentNotifications from "../pages/student/Notifications";
import StudentAnnouncements from "../pages/student/Announcements";
import StudentProfile from "../pages/student/Profile";

function AppRoutes() {
  return (
    <ClerkTokenProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/collections"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminCollections />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/collections/:id"
          element={
            <DashboardLayout>
              <AdminCollectionDetails />
            </DashboardLayout>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminPayments />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminStudents />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ai-helper"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AIHelper />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminAnnouncements />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/archives"
          element={
            <DashboardLayout>
              <AdminArchives />
            </DashboardLayout>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminSettings />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["student"]}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/collections"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["student"]}>
                <DashboardLayout>
                  <StudentCollections />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/payments"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["student"]}>
                <DashboardLayout>
                  <StudentPayments />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/notifications"
          element={
            <DashboardLayout>
              <StudentNotifications />
            </DashboardLayout>
          }
        />

        <Route
          path="/student/announcements"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["student"]}>
                <DashboardLayout>
                  <StudentAnnouncements />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["student"]}>
                <DashboardLayout>
                  <StudentProfile />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ClerkTokenProvider>
  );
}

export default AppRoutes;