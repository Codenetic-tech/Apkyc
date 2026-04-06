import React, { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Building2,
  Ticket,
  IndianRupee,
  ShieldCheck,
  Drum,
  MessageSquareDot,
  Sparkles,
  User,
  AlarmClockCheck,
  LogOut,
  ChevronDown,
  LineChart,
  ClipboardList,
  Briefcase,
  PieChart,
  Wand2,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define all possible menu items adapted for Trading Web
const allMenuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    roles: ['manager', 'employee', 'admin']
  },
  {
    title: 'KYC Status',
    url: '/kyc',
    icon: ShieldCheck,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    roles: ['manager', 'employee', 'admin']
  },
  {
    title: 'Order Book',
    url: '/orderbook',
    icon: ClipboardList,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    roles: ['manager', 'employee', 'admin']
  },
  {
    title: 'Positions',
    url: '/positions',
    icon: LineChart,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    roles: ['manager', 'employee', 'admin']
  },
  {
    title: 'Holdings',
    url: '/holdings',
    icon: Briefcase,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    roles: ['manager', 'employee', 'admin']
  },
  {
    title: 'Mutual Funds',
    url: '/mutualfunds',
    icon: PieChart,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    roles: ['manager', 'employee', 'admin']
  },
  {
    title: 'Strategy Builder',
    url: '/strategy-builder',
    icon: Wand2,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    roles: ['manager', 'employee', 'admin']
  },
  {
    title: 'Profile',
    url: '/settings',
    icon: User,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    roles: ['manager', 'employee', 'admin']
  },
];

const apps = [
  {
    id: 'crm',
    name: 'CRM App',
    icon: Building2,
    color: 'text-emerald-600',
    gradient: 'from-emerald-600 to-teal-700',
    items: ['KYC Status'],
    url: '/kyc'
  },
  {
    id: 'Ticketing',
    name: 'Ticketing',
    icon: Ticket,
    color: 'text-purple-600',
    gradient: 'from-purple-600 to-violet-700',
    items: ['Ticketing'],
    url: '/ticketing'
  },
  // {
  //   id: 'HRMS',
  //   name: 'HRMS',
  //   icon: User,
  //   color: 'text-slate-600',
  //   gradient: 'from-slate-600 to-slate-800',
  //   items: ['HRMS'],
  //   url: '/hrms'
  // }
];

const commonItems = ["Profile"];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();

  const [activeAppId, setActiveAppId] = useState(() => {
    if (currentPath.includes('settings')) return 'settings';
    if (currentPath.includes('kyc')) return 'crm';
    return 'crm';
  });

  const handleAppChange = (appId: string, url: string) => {
    setActiveAppId(appId);
    navigate(url);
  };

  const activeApp = useMemo(() => apps.find(a => a.id === activeAppId) || apps[0], [activeAppId]);

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === 'collapsed';

  // Filter menu items based on active app and common items
  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => {
      // Step 1: Role check (simplified for Trading Web)
      const hasRole = true; // Most items available to all for now
      if (!hasRole) return false;

      // Step 2: App/Common check
      return activeApp.items.includes(item.title) || commonItems.includes(item.title);
    });
  }, [user, activeApp]);

  // if (!user) return null; // Removed to prevent layout shift during initial load

  const initials = user?.user_code?.[0]?.toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <Sidebar
      className="transition-all duration-300 ease-in-out border-r border-slate-200/60 bg-white shadow-none"
      collapsible="icon"
    >
      <SidebarContent className="bg-transparent">
        {/* Enhanced Sidebar Header with Dropdown */}
        <SidebarHeader className={`h-16 border-b border-slate-200/60 flex items-center justify-center p-0 ${isCollapsed ? 'px-0' : 'px-2'}`}>
          <SidebarMenu className={isCollapsed ? "flex flex-col items-center w-full" : "pl-2"}>
            <SidebarMenuItem className={isCollapsed ? "w-full flex justify-center" : ""}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-300 h-12 ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <div className={`flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br ${activeApp.gradient} text-white shadow-md`}>
                      <activeApp.icon className="size-5" />
                    </div>
                    {!isCollapsed && (
                      <>
                        <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                          <span className="truncate font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent text-lg">{activeApp.name}</span>
                          <span className="truncate text-[10px] text-slate-500 font-medium">Switch App</span>
                        </div>
                        <ChevronDown className="ml-auto size-4 text-slate-400" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-xl border-slate-200/60 p-2"
                  align="start"
                  side="bottom"
                  sideOffset={8}
                >
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Application
                  </div>
                  {apps.filter(app => app.id !== activeAppId).map((app) => (
                    <DropdownMenuItem
                      key={app.id}
                      onClick={() => handleAppChange(app.id, app.url)}
                      className="gap-3 p-2.5 rounded-lg focus:bg-slate-50 focus:text-slate-900 transition-colors cursor-pointer"
                    >
                      <div className={`flex size-8 items-center justify-center rounded-lg bg-gradient-to-br ${app.gradient} text-white shadow-sm`}>
                        <app.icon className="size-5 shrink-0" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{app.name}</span>
                        <span className="text-[10px] text-slate-400 leading-none">
                          Switch to {app.name}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Enhanced Navigation Menu - Centered icons in collapsed view */}
        <SidebarGroup className={`transition-all duration-300 ${isCollapsed ? 'px-0 py-4 mt-4' : 'px-3 py-5 mt-6'}`}>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className={`space-y-2 ${isCollapsed ? 'flex flex-col items-center w-full' : ''}`}>
              {menuItems.map((item) => {
                const isItemActive = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title} className={isCollapsed ? 'w-full flex justify-center' : ''}>
                    <SidebarMenuButton
                      asChild
                      tooltip={isCollapsed ? item.title : undefined}
                      className={isCollapsed ? 'w-auto' : ''}
                    >
                      <NavLink
                        to={item.url}
                        className={`group relative transition-all duration-200 ${isItemActive
                          ? "text-purple-700 font-semibold"
                          : ""
                          } ${isCollapsed ? 'w-14 h-14 flex items-center justify-center' : ''}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className={`flex items-center transition-all duration-200 ${isCollapsed ? 'justify-center' : 'space-x-3 py-3 px-3'
                          } rounded-xl relative z-10`}>
                          <div className={` ${isCollapsed ? 'p-2' : 'p-2 rounded-lg'
                            } ${isItemActive
                              ? 'bg-purple-500/20'
                              : item.bgColor
                            }`}>
                            <item.icon
                              className={`flex-shrink-0 transition-all duration-200 ${isCollapsed ? 'h-5 w-5' : 'h-5 w-5'
                                } ${isItemActive ? 'text-purple-600' : item.color}`}
                            />
                          </div>
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0 transition-all duration-300">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold truncate">{item.title}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Enhanced User Profile & Logout Section - Centered in collapsed view */}
        <div className={`mt-auto transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'} border-t border-slate-200/60 bg-white`}>
          {user ? (
            <div className="transition-all duration-300">
              {!isCollapsed ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8 rounded-lg border-2 border-white shadow-sm ring-1 ring-slate-200">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-[10px] font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{user.user_code}</p>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {user.type === "U-AP"
                          ? "Referral Partner"
                          : user.type === "AP"
                            ? "Authorized Person"
                            : user.type || "User"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-red-200"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-600 transition-colors duration-200" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleLogout}
                    className="w-10 h-10 flex items-center justify-center bg-red-50/50 hover:bg-red-50 rounded-full transition-all duration-200 group border border-transparent hover:border-red-100"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4 text-red-500 transition-colors duration-200" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Skeleton Loading State for Footer */
            <div className="transition-all duration-300 animate-pulse">
              {!isCollapsed ? (
                <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="h-8 w-8 rounded-lg bg-slate-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                    <div className="h-2 w-24 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                  <div className="h-10 w-10 rounded-full bg-slate-100"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
