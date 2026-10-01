import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { useNotifications } from '../services/useNotifications';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { DemoRoleBar } from '../component/UI/DemoRoleBar';
import { FeatureSettingsModal } from '../component/UI/FeatureSettingsModal';
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
  DollarSign,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { isFeatureEnabled } = useFeatureFlags();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sod_nav_collapsed') === 'true';
  });
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('sod_nav_collapsed', String(isDesktopCollapsed));
  }, [isDesktopCollapsed]);

  const role = user?.role || 'Student';

  // Navigation Links Definition with categories for enterprise clean look
  const navItems = [
    // Core
    {
      label: 'Dashboard Overview',
      shortLabel: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      section: 'Overview',
      roles: ['Student', 'Faculty', 'LabManager', 'DeptManager'],
      enabled: true,
    },
    {
      label: 'My Profile & Credentials',
      shortLabel: 'Profile',
      path: '/profile',
      icon: UserIcon,
      section: 'Overview',
      roles: ['Student', 'Faculty', 'LabManager', 'DeptManager'],
      enabled: true,
    },
    // Student Actions
    {
      label: 'My Assigned Duties',
      shortLabel: 'My Duties',
      path: '/my-duties',
      icon: CalendarDays,
      section: 'My Duties',
      roles: ['Student'],
      enabled: true,
    },
    {
      label: 'Shift Swap Portal',
      shortLabel: 'Swaps',
      path: '/swaps',
      icon: ArrowRightLeft,
      section: 'My Duties',
      roles: ['Student'],
      enabled: isFeatureEnabled('shift_swaps'),
    },
    {
      label: 'Payroll Claims',
      shortLabel: 'Payroll Claims',
      path: '/submit-bill',
      icon: DollarSign,
      section: 'My Duties',
      roles: ['Student'],
      enabled: isFeatureEnabled('billing_claims'),
    },
    // Faculty / Supervision
    {
      label: 'Faculty Supervision',
      shortLabel: 'Supervision',
      path: '/faculty/overview',
      icon: GraduationCap,
      section: 'Supervision',
      roles: ['Faculty', 'DeptManager'],
      enabled: true,
    },
    // Operations & Scheduling
    {
      label: 'Duty Slot Manager',
      shortLabel: 'Duty Slots',
      path: '/manager/duties',
      icon: Building2,
      section: 'Operations',
      roles: ['LabManager', 'DeptManager', 'Faculty'],
      enabled: true,
    },
    {
      label: 'Student Calendars',
      shortLabel: 'Calendars',
      path: '/manager/student-calendars',
      icon: CalendarSearch,
      section: 'Operations',
      roles: ['LabManager', 'DeptManager', 'Faculty'],
      enabled: true,
    },
    {
      label: 'Department Schedule',
      shortLabel: 'Schedule',
      path: '/manager/master-calendar',
      icon: Calendar,
      section: 'Operations',
      roles: ['LabManager', 'DeptManager'],
      enabled: true,
    },
    {
      label: 'Attendance & Kiosk',
      shortLabel: 'Attendance',
      path: '/manager/attendance',
      icon: ClipboardCheck,
      section: 'Operations',
      roles: ['LabManager', 'DeptManager', 'Faculty'],
      enabled: isFeatureEnabled('rfid_kiosk'),
    },
    // Administration & Records
    {
      label: 'User Directory',
      shortLabel: 'Users',
      path: '/admin/users',
      icon: UserCheck,
      section: 'Administration',
      roles: ['DeptManager'],
      enabled: true,
    },
    {
      label: 'Billing & Approvals',
      shortLabel: 'Billing',
      path: '/admin/billing',
      icon: FileSpreadsheet,
      section: 'Administration',
      roles: ['Faculty', 'DeptManager'],
      enabled: isFeatureEnabled('billing_claims'),
    },
    {
      label: 'Academic Semesters',
      shortLabel: 'Semesters',
      path: '/admin/semesters',
      icon: CalendarDays,
      section: 'Administration',
      roles: ['DeptManager'],
      enabled: true,
    },
    {
      label: 'Historical Archive Hub',
      shortLabel: 'Archive',
      path: '/admin/archive',
      icon: History,
      section: 'Administration',
      roles: ['DeptManager', 'LabManager', 'Faculty'],
      enabled: true,
    },
    {
      label: 'System Settings',
      shortLabel: 'Settings',
      path: '/admin/settings',
      icon: Settings,
      section: 'Administration',
      roles: ['DeptManager'],
      enabled: true,
    },
  ];

  const filteredNavItems = navItems
    .filter((item) => item.enabled)
    .filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Demo Role Switcher Toolbar - only visible if demo_mode is enabled */}
      {isFeatureEnabled('demo_mode') && <DemoRoleBar />}

      {/* Top Mobile & Desktop Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3.5">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs shadow-blue-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight">SoD Portal</span>
                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Enterprise</span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 block leading-tight">Dept. of Computer Science & Engineering</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Notifications Inbox Icon */}
          {user?.role === 'Student' && (
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center relative"
                title="Inbox Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full text-[9px] font-bold px-1 min-w-[16px] h-[16px] flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-left animate-fadeIn">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Inbox Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 border border-blue-200/70 px-1.5 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-xs text-slate-400">
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
                            !n.is_read ? 'bg-blue-50/40 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          <div className="font-bold text-slate-800 flex items-center justify-between">
                            <span>{n.title}</span>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            )}
                          </div>
                          <p className="mt-1 text-slate-600 leading-normal text-[11px]">{n.message}</p>
                          <span className="text-[9px] text-slate-400 block mt-1.5">{n.created_at}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Settings Icon for DeptManager */}
          {user?.role === 'DeptManager' && (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center"
              title="Feature Flags & System Settings"
            >
              <Settings className="w-4 h-4 text-slate-700" />
            </button>
          )}

          {/* User Profile Pill -> Link to /profile */}
          <Link
            to="/profile"
            className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-medium transition-colors cursor-pointer"
            title="View & Edit My Profile"
          >
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-slate-900 font-semibold truncate max-w-[130px]">{user?.name}</span>
            <span className="text-[10px] text-blue-700 uppercase tracking-wider font-bold bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
              {role}
            </span>
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer flex items-center justify-center"
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
          className={`fixed md:sticky top-16 z-20 h-[calc(100vh-4rem)] bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-xs ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } ${isDesktopCollapsed ? 'md:w-[72px] w-64' : 'w-64'}`}
        >
          {/* Scrollable Navigation Sections List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin">
            {/* Collapse / Expand Control Header */}
            <div className={`hidden md:flex items-center ${isDesktopCollapsed ? 'justify-center' : 'justify-between px-2'} pb-1`}>
              {!isDesktopCollapsed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Navigation
                </span>
              )}
              <button
                onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer border border-transparent hover:border-slate-200"
                title={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isDesktopCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Nav Items Grouped by Section */}
            {Array.from(new Set(filteredNavItems.map((item) => item.section))).map((sectionName) => {
              const sectionItems = filteredNavItems.filter((item) => item.section === sectionName);
              if (sectionItems.length === 0) return null;

              return (
                <div key={sectionName} className="space-y-1">
                  {!isDesktopCollapsed ? (
                    <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {sectionName}
                    </div>
                  ) : (
                    <div className="hidden md:block my-2 border-t border-slate-100" />
                  )}

                  {sectionItems.map((item) => {
                    const isActive =
                      item.path === '/dashboard'
                        ? location.pathname === '/dashboard'
                        : location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                      <div key={item.path} className="relative group">
                        <Link
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center rounded-lg text-xs font-semibold transition-all duration-150 ${
                            isDesktopCollapsed
                              ? 'md:justify-center md:h-10 md:w-10 md:mx-auto px-3 py-2.5 gap-3'
                              : 'px-3 py-2.5 gap-3'
                          } ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
                          <span className={`truncate ${isDesktopCollapsed ? 'md:hidden inline' : 'inline'}`}>
                            {item.label}
                          </span>
                        </Link>

                        {/* Floating tooltip on hover when collapsed on desktop */}
                        {isDesktopCollapsed && (
                          <div className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none items-center gap-1.5 animate-fadeIn">
                            <span>{item.label}</span>
                            <div className="w-1.5 h-1.5 bg-slate-900 absolute -left-0.5 top-1/2 -translate-y-1/2 rotate-45" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer User Info -> Link to /profile */}
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/60 text-left">
            {!isDesktopCollapsed ? (
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors group cursor-pointer"
                title="View & Edit My Profile"
              >
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{user?.email}</div>
                </div>
              </Link>
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center relative group">
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:scale-105 transition-transform"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Link>
                {/* Floating tooltip for user profile */}
                <div className="hidden md:group-hover:flex absolute left-full bottom-0 ml-3.5 z-50 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl whitespace-nowrap pointer-events-none flex-col gap-0.5 animate-fadeIn">
                  <div className="font-bold text-white leading-tight">{user?.name}</div>
                  <div className="text-[10px] text-slate-300 leading-tight">{user?.email}</div>
                  <div className="text-[9px] text-blue-300 font-semibold uppercase tracking-wider mt-1">{role} (Click to open profile)</div>
                  <div className="w-1.5 h-1.5 bg-slate-900 absolute -left-0.5 bottom-3 rotate-45" />
                </div>
              </div>
            )}
            {/* Mobile Fallback for User Info when drawer open */}
            {isDesktopCollapsed && (
              <Link
                to="/profile"
                className="md:hidden flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate leading-tight">{user?.name}</div>
                  <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{user?.email}</div>
                </div>
              </Link>
            )}
          </div>
        </aside>

        {/* Backdrop for Mobile Sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-10 md:hidden"
          />
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 text-left">
          {children}
        </main>

      </div>

      {/* Feature Settings Quick Modal for DeptManager */}
      <FeatureSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};
