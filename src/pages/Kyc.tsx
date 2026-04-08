import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useKyc, KycItem } from '@/contexts/KycContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFilter } from '@/contexts/FilterContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    UserCheck,
    FileText,
    Clock,
    AlertCircle,
    RefreshCcw,
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    CheckCircle2,
    ShieldCheck,
    Filter,
    Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRangePicker } from 'rsuite';
import 'rsuite/DateRangePicker/styles/index.css';
import KycTimeline from '@/components/KycTimeline';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

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

const Kyc: React.FC = () => {
    const { token } = useAuth();
    const { selectedHierarchy } = useFilter();
    const { kycData, isLoading, error, count, statusCount, refreshKycData } = useKyc();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof KycItem; direction: 'asc' | 'desc' } | null>(null);

    const loadKycData = useCallback(async (page: number, currentSearch: string, currentStatus: string, currentDates: [Date, Date] | null, currentHierarchy: string[]) => {
        if (!token) return;

        const params: any = {
            limit_start: (page - 1) * ITEMS_PER_PAGE,
            limit_page_length: ITEMS_PER_PAGE
        };

        if (currentHierarchy && currentHierarchy.length > 0) {
            params.refer_list = currentHierarchy;
        }

        if (currentSearch) {
            if (/^[a-zA-Z]/.test(currentSearch)) {
                params.ucc_field = currentSearch;
            } else {
                params.application_id = currentSearch;
            }
        }

        if (currentDates?.[0] && currentDates?.[1]) {
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

    const handleSort = (key: keyof KycItem) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadKycData(currentPage, searchQuery, statusFilter, dateRange, selectedHierarchy);
        } finally {
            setIsRefreshing(false);
        }
    };

    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, dateRange, statusFilter]);

    useEffect(() => {
        if (token) {
            loadKycData(currentPage, debouncedSearchQuery, statusFilter, dateRange, selectedHierarchy);
        }
    }, [currentPage, debouncedSearchQuery, dateRange, statusFilter, selectedHierarchy, token, loadKycData]);

    const filteredData = useMemo(() => {
        if (!kycData) return [];
        let result = [...kycData];
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = (a[sortConfig.key] || '').toString();
                const bValue = (b[sortConfig.key] || '').toString();
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [kycData, sortConfig]);

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

    const formatValue = (value: string | null) => value || '-';

    const renderSegmentBadge = (status: string | null | undefined) => {
        const isActive = status === 'Active';
        return (
            <Badge
                variant="outline"
                className={cn(
                    "py-0 text-[10px] px-2 h-5 rounded-full font-bold uppercase tracking-tight transition-colors w-16 justify-center border",
                    isActive
                        ? "bg-green-100/50 text-green-700 border-green-200"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                )}
            >
                {isActive ? 'Active' : '-'}
            </Badge>
        );
    };

    return (
        <div className="p-4 h-full flex flex-col overflow-hidden space-y-6">
            {/* Header & Summary Section */}
            <div className="shrink-0 space-y-4">
                {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">KYC Applications</h1>
                        <p className="text-slate-500 text-sm">Manage and track customer onboarding status</p>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing || isLoading}
                        variant="outline"
                        className="rounded-xl px-4 font-semibold gap-2 h-10 border-slate-200 bg-white hover:bg-slate-50 transition-all"
                    >
                        <RefreshCcw className={cn("w-4 h-4", (isRefreshing || isLoading) && "animate-spin")} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                </div> */}

                {/* Status Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="p-4 border-border shadow-sm bg-white border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <FileText className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl font-bold text-slate-900">{count}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Applications</p>
                        </div>
                    </Card>

                    <Card className="p-4 border-border shadow-sm bg-white border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Approved</span>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl font-bold text-slate-900">{statusCount['APPROVED']}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Ready for review</p>
                        </div>
                    </Card>

                    <Card className="p-4 border-border shadow-sm bg-white border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <ShieldCheck className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Opened</span>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl font-bold text-slate-900">{statusCount['ACCOUNT OPENED']}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Live accounts</p>
                        </div>
                    </Card>

                    <Card className="p-4 border-border shadow-sm bg-white border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-violet-50 rounded-lg">
                                <UserCheck className="w-4 h-4 text-violet-600" />
                            </div>
                            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Pending</span>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl font-bold text-slate-900">{statusCount['PENDING FOR APPROVAL']}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Awaiting action</p>
                        </div>
                    </Card>

                    <Card className="p-4 border-border shadow-sm bg-white border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Progress</span>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl font-bold text-slate-900">{statusCount['IN PROGRESS']}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Active sessions</p>
                        </div>
                    </Card>

                    <Card className="p-4 border-border shadow-sm bg-white border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                            </div>
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Rejected</span>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl font-bold text-slate-900">{statusCount['REJECTED']}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Action required</p>
                        </div>
                    </Card>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50/50 border border-slate-200 rounded-2xl backdrop-blur-sm relative z-20">
                    <div className="w-[260px]">
                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            placeholder="Modified Date Range"
                            className="w-full bg-white border-slate-200 focus:ring-purple-500 rounded-xl custom-date-picker h-10"
                            appearance="default"
                            block
                        />
                    </div>
                    <div className="w-[180px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-white border-slate-200 focus:ring-purple-500 rounded-xl h-10">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                                <SelectItem value="PENDING FOR APPROVAL">Pending Approval</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="ACCOUNT OPENED">Account Opened</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search Application ID or UCC..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white border-slate-200 focus:ring-purple-500 rounded-xl h-10"
                        />
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing || isLoading}
                        variant="outline"
                        className="rounded-xl px-4 font-semibold gap-2 h-10 border-slate-200 bg-white hover:bg-slate-50 transition-all"
                    >
                        <RefreshCcw className={cn("w-4 h-4", (isRefreshing || isLoading) && "animate-spin")} />
                    </Button>

                    <div className="flex items-center gap-2 ml-auto border-l pl-3 border-slate-200">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="h-9 w-9 p-0 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1.5 px-3 h-9 bg-white border border-slate-200 rounded-xl">
                            <span className="text-sm font-bold text-purple-600">{currentPage}</span>
                            <span className="text-xs text-slate-400 font-bold">/</span>
                            <span className="text-xs text-slate-500 font-bold">{totalPages || 1}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                            className="h-9 w-9 p-0 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                </div>
            )}

            {/* Table Section */}
            <Card className="flex-1 min-h-0 flex flex-col border-none shadow-sm overflow-hidden bg-white rounded-2xl border border-slate-100">
                <ScrollArea className="flex-1">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10">
                            <tr className="border-b border-slate-100">
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 cursor-pointer select-none group/col" onClick={() => handleSort('application_id')}>
                                    <div className="flex items-center gap-2">
                                        App ID
                                        {sortConfig?.key === 'application_id' ? (
                                            sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />
                                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400" />}
                                    </div>
                                </th>
                                <th className="font-semibold text-slate-600 text-center">Number</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 cursor-pointer select-none group/col" onClick={() => handleSort('ucc')}>
                                    <div className="flex items-center gap-2">
                                        UCC
                                        {sortConfig?.key === 'ucc' ? (
                                            sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />
                                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400" />}
                                    </div>
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600 cursor-pointer select-none group/col" onClick={() => handleSort('user_name')}>
                                    <div className="flex items-center gap-2">
                                        User Name
                                        {sortConfig?.key === 'user_name' ? (
                                            sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />
                                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400" />}
                                    </div>
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600">Refer</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600">Stage</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                                {/* <th className="text-center py-3 px-4 font-semibold text-slate-600">NSE</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600">BSE</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600">NFO</th>
                                <th className="text-center py-3 px-4 font-semibold text-slate-600">Ready</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(isLoading && !kycData) ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={9} className="p-4">
                                            <div className="h-8 bg-slate-50 rounded-lg"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredData.length > 0 ? (
                                filteredData.map((row: KycItem, index: number) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedAppId(row.application_id)}
                                    >
                                        <td className="py-3 px-4 font-medium text-slate-900">{formatValue(row.application_id)}</td>
                                        <td className="py-3 px-4 font-mono text-sm font-medium text-slate-700">
                                            {row.mobile_number
                                                ? `${row.mobile_number.slice(0, 2)}******${row.mobile_number.slice(-2)}`
                                                : '-'}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-xs text-slate-600">{row.ucc || '-'}</td>
                                        <td className="py-3 px-4 text-slate-700">{formatValue(row.user_name)}</td>
                                        <td className="py-3 px-4 text-slate-700">{formatValue(row.refer)}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-100 py-0.5 text-[10px]">
                                                {row.kyc_stage === 'END PAGE' ? 'ESIGN COMPLETED' : formatValue(row.kyc_stage)}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                className={cn(
                                                    "capitalize font-bold px-2.5 py-0.5 rounded-full border-none text-[10px]",
                                                    row.application_status === 'ACCOUNT OPENED' || row.application_status === 'Approved' ? "bg-green-100 text-green-700" :
                                                        row.application_status === 'REJECTED' || row.application_status === 'Rejected' ? "bg-red-100 text-red-700" :
                                                            row.application_status === 'PENDING FOR APPROVAL' ? "bg-purple-100 text-purple-700" :
                                                                "bg-amber-100 text-amber-700"
                                                )}
                                            >
                                                {row.application_status || 'IN PROGRESS'}
                                            </Badge>
                                        </td>
                                        {/* <td className="py-3 px-4 text-center">{renderSegmentBadge(row.nse)}</td>
                                        <td className="py-3 px-4 text-center">{renderSegmentBadge(row.bse)}</td>
                                        <td className="py-3 px-4 text-center">{renderSegmentBadge(row.nfo)}</td>
                                        <td className="py-3 px-4 text-center">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full mx-auto",
                                                row.client_mapping ? "bg-green-500" : "bg-red-400 opacity-30"
                                            )} />
                                        </td> */}
                                    </tr>
                                ))
                            ) : !isLoading && (
                                <tr>
                                    <td colSpan={9} className="h-48 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <UserCheck className="w-10 h-10 mb-2 opacity-10" />
                                            <p className="text-sm font-medium">No results found matching your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </ScrollArea>

                {/* Status Info Footer */}
                <div className="shrink-0 py-2 px-4 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                    <p className="text-[11px] text-slate-500 font-medium">
                        Showing <span className="text-slate-900 font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, count)}</span> of <span className="text-slate-900 font-bold">{count}</span> applications
                    </p>
                </div>
            </Card>

            {/* Timeline Sheet */}
            <Sheet open={!!selectedAppId} onOpenChange={(open) => !open && setSelectedAppId(null)}>
                <SheetContent side="right" className="w-full sm:max-w-md border-l-0 p-0 overflow-hidden flex flex-col bg-white">
                    <SheetHeader className="p-6 border-b bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 border-2 border-white">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold text-slate-900">Application Timeline</SheetTitle>
                                <SheetDescription className="text-slate-500 font-medium">
                                    ID: <span className="text-purple-600 font-bold">{selectedAppId}</span>
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
                        {selectedAppId && (
                            <KycTimeline
                                applicationId={selectedAppId}
                                applicationStatus={kycData?.find(k => k.application_id === selectedAppId)?.application_status || ''}
                                historyData={kycData?.find(k => k.application_id === selectedAppId)?.kyc_stage_history || []}
                            />
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Kyc;
