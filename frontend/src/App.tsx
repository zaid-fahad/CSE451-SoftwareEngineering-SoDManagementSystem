import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import { ProtectedRoute } from './component/Auth/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
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
                <AppLayout>
                  <SwapPortal />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit-bill"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <AppLayout>
                  <StudentBillSubmitPage />
                </AppLayout>
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
                <AppLayout>
                  <AdminBilling />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
