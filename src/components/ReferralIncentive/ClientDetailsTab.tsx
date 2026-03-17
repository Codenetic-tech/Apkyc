// ClientDetailsTab.tsx
import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, UserCheck, FileText, RefreshCcw } from 'lucide-react';
import { useKyc, KycItem } from '@/contexts/KycContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from 'rsuite';
import 'rsuite/DateRangePicker/styles/index.css';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import KycTimeline from '@/components/KycTimeline';


// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const ITEMS_PER_PAGE = 50;

interface ClientDetailsTabProps {
  data: any[];
  loading: boolean;
}

const ClientDetailsTab: React.FC<ClientDetailsTabProps> = ({ data, loading }) => {
  const { token } = useAuth();
  const { kycData, isLoading, count, refreshKycData } = useKyc();
  
  const [kycSearch, setKycSearch] = useState('');
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [kycSortConfig, setKycSortConfig] = useState<{ key: keyof KycItem; direction: 'asc' | 'desc' } | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadKycData = React.useCallback(async (page: number, currentSearch: string, currentStatus: string, currentDates: [Date, Date] | null) => {
    if (!token) return;

    const params: any = {
      limit_start: (page - 1) * ITEMS_PER_PAGE,
      limit_page_length: ITEMS_PER_PAGE
    };

    if (currentSearch) {
      if (/^[a-zA-Z]/.test(currentSearch)) {
        params.ucc_field = currentSearch;
      } else {
        params.application_id = currentSearch;
      }
    }

    if (currentDates && currentDates[0] && currentDates[1]) {
      const startStr = currentDates[0].toISOString().split('T')[0] + " 00:00:00";
      const endStr = currentDates[1].toISOString().split('T')[0] + " 23:59:59";
      params.from_application_modified_date_time = startStr;
      params.to_application_modified_date_time = endStr;
    }

    if (currentStatus !== 'ALL') {
      params.application_status = currentStatus;
    }

    await refreshKycData(params);
  }, [refreshKycData, token]);

  const debouncedSearchQuery = useDebounce(kycSearch, 400);

  // Reset page when search query or date range changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, dateRange, statusFilter]);

  // Fetch data whenever pagination or filters change
  React.useEffect(() => {
    if (token) {
        loadKycData(currentPage, debouncedSearchQuery, statusFilter, dateRange);
    }
  }, [currentPage, debouncedSearchQuery, dateRange, statusFilter, token, loadKycData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
        await loadKycData(currentPage, debouncedSearchQuery, statusFilter, dateRange);
    } finally {
        setIsRefreshing(false);
    }
  };

  const handleKycSort = (key: keyof KycItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (kycSortConfig && kycSortConfig.key === key && kycSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setKycSortConfig({ key, direction });
  };

  const filteredKycData = useMemo(() => {
    if (!kycData) return [];
    let result = [...kycData];

    if (kycSortConfig) {
      result.sort((a, b) => {
        let aValue: any = a[kycSortConfig.key] || '';
        let bValue: any = b[kycSortConfig.key] || '';
        
        if (kycSortConfig.key === 'application_status') {
          aValue = aValue || 'IN PROGRESS';
          bValue = bValue || 'IN PROGRESS';
        }

        if (aValue < bValue) return kycSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return kycSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [kycData, kycSortConfig]);

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const paginatedData = filteredKycData;

  const formatValue = (value: string | null) => value || '-';

  const renderSegmentBadge = (status: string | null | undefined) => {
    const isActive = status === 'Active';
    return (
      <Badge
        variant="outline"
        className={cn(
          "py-0 text-[10px] px-2 h-5 rounded-full font-bold uppercase tracking-tight transition-colors w-16 justify-center",
          isActive
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-slate-50 text-slate-400 border-slate-200"
        )}
      >
        {isActive ? 'Active' : '-'}
      </Badge>
    );
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: keyof KycItem }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 transition-colors"
      onClick={() => handleKycSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-3 h-3 text-slate-300" />
      </div>
    </th>
  );

  if (isLoading && !kycData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading client details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-2 rounded-lg text-white font-bold flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">KYC Applications</h3>
            <p className="text-xs text-gray-500">Total: {count}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-[280px]">
              <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Filter by Modified Date"
                  className="w-full bg-white border-slate-200 focus:ring-blue-500 rounded-lg custom-date-picker"
                  appearance="default"
                  block
              />
          </div>
          <div className="w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-white border-slate-200 focus:ring-blue-500 rounded-lg h-[36px]">
                      <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      <SelectItem value="ALL">ALL STATUS</SelectItem>
                      <SelectItem value="IN PROGRESS">IN PROGRESS</SelectItem>
                      <SelectItem value="PENDING FOR APPROVAL">PENDING FOR APPROVAL</SelectItem>
                      <SelectItem value="REJECTED">REJECTED</SelectItem>
                      <SelectItem value="APPROVED">APPROVED</SelectItem>
                      <SelectItem value="ACCOUNT OPENED">ACCOUNT OPENED</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                  placeholder="Search Application ID, UCC..."
                  value={kycSearch}
                  onChange={(e) => setKycSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 h-[36px] text-sm"
              />
          </div>
          <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium h-[36px] min-w-[120px]"
          >
              <RefreshCcw className={cn("w-4 h-4", (isRefreshing || isLoading) && "animate-spin")} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {paginatedData.length > 0 ? (
          paginatedData.map((row, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAppId(row.application_id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Application #{row.application_id}</div>
                  <div className="font-semibold text-gray-900">{formatValue(row.user_name)}</div>
                </div>
                <Badge
                  className={cn(
                    "capitalize font-bold px-3 py-1 rounded-full border-none shadow-sm text-xs",
                    row.application_status === 'ACCOUNT OPENED' ? "bg-green-100 text-green-700" :
                    row.application_status === 'REJECTED' ? "bg-red-100 text-red-700" :
                    row.application_status === 'PENDING FOR APPROVAL' ? "bg-purple-100 text-purple-700" :
                    "bg-amber-100 text-amber-700"
                  )}
                >
                  {row.application_status || 'IN PROGRESS'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div><span className="text-gray-500 text-xs">UCC:</span> <span className="font-mono font-medium">{row.ucc || '-'}</span></div>
                <div><span className="text-gray-500 text-xs">Stage:</span> <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 py-0 text-xs">{row.kyc_stage === 'END PAGE' ? 'ESIGN COMPLETED' : formatValue(row.kyc_stage)}</Badge></div>
                <div><span className="text-gray-500 text-xs">Source:</span> <span>{row.src || '-'}</span></div>
                <div><span className="text-gray-500 text-xs">Tag:</span> <span>{row.tag || '-'}</span></div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-500 mr-1">Segments:</span>
                {renderSegmentBadge(row.nse)}
                {renderSegmentBadge(row.bse)}
                {renderSegmentBadge(row.nfo)}
                {renderSegmentBadge(row.bfo)}
                {renderSegmentBadge(row.mcx)}
                <Badge className={cn(
                  "capitalize font-bold px-2 py-0 rounded-full border-none shadow-sm text-[10px] ml-auto",
                  row.client_mapping ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {row.client_mapping ? 'Ready' : 'Not Ready'}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <UserCheck className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No KYC applications found.</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <SortHeader label="App ID" sortKey="application_id" />
                <SortHeader label="UCC" sortKey="ucc" />
                <SortHeader label="User Name" sortKey="user_name" />
                <SortHeader label="KYC Stage" sortKey="kyc_stage" />
                <SortHeader label="Status" sortKey="application_status" />
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Source</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Tag</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">NSE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">BSE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">NFO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">BFO</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">MCX</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Trade Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAppId(row.application_id)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 text-sm">{formatValue(row.application_id)}</td>
                    <td className="px-4 py-3 font-mono text-sm font-medium text-slate-700">{row.ucc || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatValue(row.user_name)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 py-0.5 text-xs">
                        {row.kyc_stage === 'END PAGE' ? 'ESIGN COMPLETED' : formatValue(row.kyc_stage)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          "capitalize font-bold px-3 py-1 rounded-full border-none shadow-sm text-xs",
                          row.application_status === 'ACCOUNT OPENED' || row.application_status === 'Approved' ? "bg-green-100 text-green-700 hover:bg-green-100" :
                          row.application_status === 'REJECTED' || row.application_status === 'Rejected' ? "bg-red-100 text-red-700 hover:bg-red-100" :
                          row.application_status === 'PENDING FOR APPROVAL' ? "bg-purple-100 text-purple-700 hover:bg-purple-100" :
                          "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        )}
                      >
                        {row.application_status || 'IN PROGRESS'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{row.src || '-'}</td>
                    <td className="px-4 py-3 text-center text-sm">{row.tag || '-'}</td>
                    <td className="px-4 py-3 text-center">{renderSegmentBadge(row.nse)}</td>
                    <td className="px-4 py-3 text-center">{renderSegmentBadge(row.bse)}</td>
                    <td className="px-4 py-3 text-center">{renderSegmentBadge(row.nfo)}</td>
                    <td className="px-4 py-3 text-center">{renderSegmentBadge(row.bfo)}</td>
                    <td className="px-4 py-3 text-center">{renderSegmentBadge(row.mcx)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        className={cn(
                          "capitalize font-bold px-3 py-1 rounded-full border-none shadow-sm text-xs",
                          row.client_mapping ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                        )}
                      >
                        {row.client_mapping ? 'Ready to Trade' : 'Not Ready'}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <UserCheck className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm">No KYC applications found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
      {/* Pagination Container */}
      {totalPages > 1 && (
          <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
                  Showing <span className="text-slate-900 font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, count)}</span> of <span className="text-slate-900 font-bold">{count}</span> results
              </p>
              <Pagination className="w-auto mx-0 sm:ml-auto">
                  <PaginationContent>
                      <PaginationItem>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="gap-1 rounded-xl"
                          >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                          </Button>
                      </PaginationItem>
                      <div className="flex items-center gap-1 mx-2">
                          <span className="text-sm font-medium text-slate-500">Page</span>
                          <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 py-0.5 px-3 rounded-lg font-bold">
                              {currentPage}
                          </Badge>
                          <span className="text-sm font-medium text-slate-500">of {totalPages}</span>
                      </div>
                      <PaginationItem>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              className="gap-1 rounded-xl"
                          >
                              Next
                              <ChevronRight className="h-4 w-4" />
                          </Button>
                      </PaginationItem>
                  </PaginationContent>
              </Pagination>
          </div>
      )}

      {/* KYC Timeline Sheet */}
      <Sheet open={!!selectedAppId} onOpenChange={(open) => !open && setSelectedAppId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md border-l-0 p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-6 border-b bg-slate-50/50">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold text-slate-900">KYC Timeline</SheetTitle>
                <SheetDescription className="text-slate-500 font-medium">
                  Application: {selectedAppId}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-hidden px-6 pb-6 mt-4">
            {selectedAppId && (
              <KycTimeline
                applicationId={selectedAppId}
                token={token}
                createdDate={kycData?.find(k => k.application_id === selectedAppId)?.application_created_date}
                applicationStatus={kycData?.find(k => k.application_id === selectedAppId)?.application_status}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClientDetailsTab;