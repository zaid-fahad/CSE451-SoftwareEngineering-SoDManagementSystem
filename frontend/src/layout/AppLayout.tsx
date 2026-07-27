import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useNotifications } from '../services/useNotifications';
import { DemoRoleBar } from '../component/UI/DemoRoleBar';
import {
  LayoutDashboard,
  CalendarDays,
  ArrowRightLeft,
  GraduationCap,
  Building2,
  CalendarSearch,
  Calendar,
  ClipboardCheck,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  UserCheck,
  Bell,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);

  const role = user?.role || 'Student';

  // Navigation Links Definition conditioned on role
  const navItems = [
    {
      label: 'Dashboard Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Student', 'Faculty', 'LabManager', 'DeptManager'],
    },
    {
      label: 'My Assigned Duties',
      path: '/my-duties',
      icon: CalendarDays,
      roles: ['Student'],
    },
    {
      label: 'Shift Swap Portal',
      path: '/swaps',
      icon: ArrowRightLeft,
      roles: ['Student'],
    },
    {
      label: 'Faculty Supervision',
      path: '/faculty/overview',
      icon: GraduationCap,
      roles: ['Faculty', 'DeptManager'],
    },
    {
      label: 'Duty Slot Manager',
      path: '/manager/duties',
      icon: Building2,
      roles: ['LabManager', 'DeptManager', 'Faculty'],
    },
    {
      label: 'Student Calendars',
      path: '/manager/student-calendars',
      icon: CalendarSearch,
      roles: ['LabManager', 'DeptManager', 'Faculty'],
    },
    {
      label: 'Master Department Schedule',
      path: '/manager/master-calendar',
      icon: Calendar,
      roles: ['LabManager', 'DeptManager'],
    },
    {
      label: 'Duty Attendance & Hours',
      path: '/manager/attendance',
      icon: ClipboardCheck,
      roles: ['LabManager', 'DeptManager', 'Faculty'],
    },
    {
      label: 'User Administration',
      path: '/admin/users',
      icon: UserCheck,
      roles: ['DeptManager'],
    },
    {
      label: 'Billing & Payroll',
      path: '/admin/billing',
      icon: FileSpreadsheet,
      roles: ['Faculty', 'DeptManager'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Demo Role Switcher Toolbar */}
      <DemoRoleBar />

      {/* Top Mobile & Desktop Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-blue-600 text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">SoD Enterprise Portal</span>
              <span className="text-[10px] text-slate-500 block leading-none">Dept. of Computer Science & Engineering</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Inbox Icon */}
          {user?.role === 'Student' && (
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer relative"
                title="Inbox Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full text-[9px] font-bold px-1 min-w-[15px] h-[15px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden text-left animate-fadeIn">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Inbox Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-blue-600 font-bold">{unreadCount} unread</span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(String(n.id));
                            setIsNotifOpen(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.is_read ? 'bg-blue-50/50 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          <div className="font-bold text-slate-800 flex items-center justify-between">
                            <span>{n.title}</span>
                            {!n.is_read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            )}
                          </div>
                          <p className="mt-1 text-slate-600 leading-normal">{n.message}</p>
                          <span className="text-[9px] text-slate-400 block mt-1.5">{n.created_at}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-900 font-bold">{user?.name}</span>
            <span className="text-[10px] text-blue-800 uppercase tracking-wider font-bold bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
              {role}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body Layout: Side Navbar + Main Area */}
      <div className="flex flex-1 relative">
        
        {/* Responsive Side Navigation Panel */}
        <aside
          className={`fixed md:sticky top-16 z-20 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Navigation Links List */}
          <div className="p-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Main Menu ({role})
            </div>

            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Footer User Info */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-left">
            <div className="text-[11px] font-bold text-slate-900 truncate">{user?.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
          </div>
        </aside>

        {/* Backdrop for Mobile Sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 z-10 md:hidden"
          />
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 text-left">
          {children}
        </main>

      </div>
    </div>
  );
};
