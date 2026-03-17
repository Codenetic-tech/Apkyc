// ReferralIncentive.tsx (updated)
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Users, IndianRupee, Package, TrendingUp, Activity, ArrowUpRight, Download, Filter, Search, RefreshCw, User } from 'lucide-react';

import {
  ReferralData,
  ApiResponse,
  SummaryData,
  DateRange,
  Tab,
} from '@/utils/referral';
import {
  COLORS,
  processReferralData,
  applyQuickRange
} from '@/utils/referral';
import DateRangePicker from '@/components/ManagementReport/DateRangePicker';
import OverviewTab from '@/components/ReferralIncentive/OverviewTab';
import ClientDetailsTab from '@/components/ReferralIncentive/ClientDetailsTab';
import LedgerTab from '@/components/ReferralIncentive/LedgerTab';
import ProfileTab from '@/components/ReferralIncentive/ProfileTab';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ReferralIncentive: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '',
    end: ''
  });
  const [referralData, setReferralData] = useState<ReferralData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, logout } = useAuth();

  // Get actual user credentials from auth context
  const clientid = user?.clientid || '';
  const token = user?.token || '';

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Initialize with empty/zero data
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalApplications: 0,
    pendingIncentives: 0,
    paidIncentives: 0,
    totalIncentiveAmount: 0,
    tradedApplications: 0,
    eSignCompleted: 0
  });

  const [clientDetails, setClientDetails] = useState<ReferralData[]>([]);
  const [ledger, setLedger] = useState<ReferralData[]>([]);

  // Initialize default date range (start of current month to today)
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const formatDateForInput = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setDateRange({
      start: formatDateForInput(firstDayOfMonth),
      end: formatDateForInput(today)
    });
  }, []);

  // Fetch data when dateRange changes
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchReferralData();
    }
  }, [dateRange]);

  const fetchReferralData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/method/crm.api.referral.handle_referral_webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          source: 'getreport',
          start_date: dateRange.start,
          end_date: dateRange.end,
          clientid: user.clientid,
          token: user.token
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data: ApiResponse = await response.json();

      // Updated to handle both response structures
      const parsedData = Array.isArray(data?.message) ? data.message : (data?.message as any)?.data;
      if (parsedData && Array.isArray(parsedData)) {
        setReferralData(parsedData);
        const processed = processReferralData(parsedData);
        setSummaryData(processed.summary);
        setClientDetails(processed.clientDetails);
        setLedger(processed.ledger);
      } else {
        setReferralData([]);
        const processed = processReferralData([]);
        setSummaryData(processed.summary);
        setClientDetails(processed.clientDetails);
        setLedger(processed.ledger);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching referral data:', err);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Update tabs to include Profile
  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'client-details', label: 'Client Details', icon: Users },
    { id: 'ledger', label: 'Ledger', icon: Package },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  // Loading overlay component
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">Loading Incentive data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="w-full p-2">

        {/* Date Range Picker */}
        {/* <DateRangePicker
          dateRange={dateRange}
          setDateRange={setDateRange}
          loading={loading}
        /> */}

        {/* Desktop Tabs & User Menu - Hidden on mobile */}
        <div className="hidden lg:flex justify-between items-center bg-white rounded-xl shadow-lg shadow-blue-50 mb-6 border border-gray-100 pr-2">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSearchParams({ tab: tab.id })}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center hover:bg-slate-100 ml-4 h-auto">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user?.user_code?.charAt(0).toUpperCase() || user?.clientid?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden xl:block">
                  <div className="text-sm font-medium text-slate-800">
                    {user?.user_code || user?.clientid}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSearchParams({ tab: 'profile' })}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'overview' && (
            <OverviewTab
              summaryData={summaryData}
              isInitialLoading={isInitialLoading}
              clientDetails={clientDetails}
              ledger={ledger}
            />
          )}
          {activeTab === 'client-details' && (
            <ClientDetailsTab
              data={clientDetails}
              loading={loading}
            />
          )}
          {activeTab === 'ledger' && (
            <LedgerTab
              data={ledger}
              loading={loading}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileTab
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralIncentive;