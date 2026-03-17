import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Menu, X, Home, Users, BarChart3, Settings, LogOut, Activity, Package, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Check if we're on the referral page to show referral tabs
  const isReferralPage = location.pathname.includes('/dashboard');

  // Regular Navigation Items
  const regularNavItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Users, label: 'Clients', href: '/' },
    { icon: BarChart3, label: 'Ledger', href: '/' },
    { icon: Share2, label: 'link', href: '/' },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: handleLogout,
      className: 'text-red-600 hover:text-red-700'
    },
  ];

  // Referral Page Navigation Items
  const referralNavItems = [
    {
      icon: Activity,
      label: 'Overview',
      onClick: () => navigate('/dashboard?tab=overview'),
      active: location.search.includes('overview') || !location.search.includes('tab=')
    },
    {
      icon: Users,
      label: 'Clients',
      onClick: () => navigate('/dashboard?tab=client-details'),
      active: location.search.includes('client-details')
    },
    {
      icon: Package,
      label: 'Ledger',
      onClick: () => navigate('/dashboard?tab=ledger'),
      active: location.search.includes('ledger')
    },
    {
      icon: Share2,
      label: 'link',
      onClick: () => navigate('/dashboard?tab=profile'),
      active: location.search.includes('profile')
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: handleLogout,
      className: 'text-red-600 hover:text-red-700'
    },
  ];

  // Use referral nav items when on referral page, otherwise use regular nav
  const mobileNavItems = isReferralPage ? referralNavItems : regularNavItems;

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-slate-50 overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          {/* <AppSidebar /> */}
        </div>

        <div className="flex-1 flex flex-col w-full">

          {/* Mobile Slide-out Menu */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Slide-out Menu */}
              <div className="lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <nav className="p-4 space-y-2">
                  {mobileNavItems.map((item) => {
                    if (item.onClick) {
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            item.onClick?.();
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left ${item.className || ''
                            } ${(item as any).active ? 'bg-blue-50 text-blue-600' : ''
                            }`}
                        >
                          <item.icon
                            size={20}
                            className={
                              item.className?.includes('red') ? 'text-red-600' :
                                (item as any).active ? 'text-blue-600' : 'text-gray-600'
                            }
                          />
                          <span className={
                            item.className?.includes('red') ? 'text-red-600 font-medium' :
                              (item as any).active ? 'text-blue-600 font-medium' : 'text-gray-900 font-medium'
                          }>{item.label}</span>
                        </button>
                      );
                    }

                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon size={20} className="text-gray-600" />
                        <span className="text-gray-900 font-medium">{item.label}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            </>
          )}



          {/* Main Content */}
          <main className="flex-1 relative overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-0.5 pb-20 lg:pb-0.5">
                {children}
              </div>
            </ScrollArea>
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <nav className="flex items-center justify-around px-2 py-3">
              {mobileNavItems.map((item) => {
                if (item.onClick) {
                  return (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-w-0 flex-1 ${item.className || ''
                        } ${(item as any).active ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                    >
                      <item.icon
                        size={20}
                        className={
                          item.className?.includes('red') ? 'text-red-600' :
                            (item as any).active ? 'text-blue-600' : 'text-gray-600'
                        }
                      />
                      <span className={`text-xs truncate ${item.className?.includes('red') ? 'text-red-600' :
                        (item as any).active ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                        {item.label}
                      </span>
                    </button>
                  );
                }

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-w-0 flex-1"
                  >
                    <item.icon size={20} className="text-gray-600" />
                    <span className="text-xs text-gray-600 truncate">{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;