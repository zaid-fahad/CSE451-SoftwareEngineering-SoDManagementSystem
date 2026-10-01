import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { SemesterProvider } from './context/SemesterContext';
import { FeatureGuardedRoute } from './component/Auth/FeatureGuardedRoute';
import { AppLayout } from './layout/AppLayout';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminBilling } from './pages/AdminBilling';
import { DutyManager } from './pages/DutyManager';
import { SwapPortal } from './pages/SwapPortal';
import { StudentDutiesPage } from './pages/StudentDutiesPage';
import { StudentBillSubmitPage } from './pages/StudentBillSubmitPage';
import { FacultyPortal } from './pages/FacultyPortal';
import { StudentCalendarInspector } from './pages/StudentCalendarInspector';
import { UserManagementPage } from './pages/UserManagementPage';
import { MasterCalendarPage } from './pages/MasterCalendarPage';
import { AttendanceManagerPage } from './pages/AttendanceManagerPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';
import { SemesterManagementPage } from './pages/SemesterManagementPage';
import { HistoricalArchiveHubPage } from './pages/HistoricalArchiveHubPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './component/Auth/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <FeatureFlagProvider>
      <AuthProvider>
        <SemesterProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/register"
              element={
                <FeatureGuardedRoute
                  featureKey="user_registration"
                  featureName="User Registration"
                  message="Student self-registration is currently disabled by system administrator. Please contact your Department Manager or Lab Instructor to receive account credentials."
                >
                  <Register />
                </FeatureGuardedRoute>
              }
            />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes wrapped inside Enterprise AppLayout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-duties"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <AppLayout>
                    <StudentDutiesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/swaps"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <FeatureGuardedRoute
                    featureKey="shift_swaps"
                    featureName="Shift Swap Portal"
                    wrapWithLayout
                  >
                    <AppLayout>
                      <SwapPortal />
                    </AppLayout>
                  </FeatureGuardedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-bill"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <FeatureGuardedRoute
                    featureKey="billing_claims"
                    featureName="Duty Payroll Claims"
                    wrapWithLayout
                  >
                    <AppLayout>
                      <StudentBillSubmitPage />
                    </AppLayout>
                  </FeatureGuardedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/overview"
              element={
                <ProtectedRoute allowedRoles={['Faculty', 'DeptManager']}>
                  <AppLayout>
                    <FacultyPortal />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/duties"
              element={
                <ProtectedRoute allowedRoles={['LabManager', 'DeptManager', 'Faculty']}>
                  <AppLayout>
                    <DutyManager />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/student-calendars"
              element={
                <ProtectedRoute allowedRoles={['LabManager', 'DeptManager', 'Faculty']}>
                  <AppLayout>
                    <StudentCalendarInspector />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/master-calendar"
              element={
                <ProtectedRoute allowedRoles={['LabManager', 'DeptManager']}>
                  <AppLayout>
                    <MasterCalendarPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/attendance/*"
              element={
                <ProtectedRoute allowedRoles={['LabManager', 'DeptManager', 'Faculty']}>
                  <AppLayout>
                    <AttendanceManagerPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['DeptManager']}>
                  <AppLayout>
                    <UserManagementPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/billing"
              element={
                <ProtectedRoute allowedRoles={['Faculty', 'DeptManager']}>
                  <FeatureGuardedRoute
                    featureKey="billing_claims"
                    featureName="Billing & Payroll Management"
                    wrapWithLayout
                  >
                    <AppLayout>
                      <AdminBilling />
                    </AppLayout>
                  </FeatureGuardedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['DeptManager']}>
                  <AppLayout>
                    <SystemSettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/semesters"
              element={
                <ProtectedRoute allowedRoles={['DeptManager']}>
                  <AppLayout>
                    <SemesterManagementPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/archive"
              element={
                <ProtectedRoute allowedRoles={['DeptManager', 'LabManager', 'Faculty']}>
                  <AppLayout>
                    <HistoricalArchiveHubPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        </SemesterProvider>
      </AuthProvider>
    </FeatureFlagProvider>
  );
};

export default App;
