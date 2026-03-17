import React, { useMemo, useState } from 'react';
import { useKyc, KycItem } from '@/contexts/KycContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Badge } from '@/components/ui/badge';
import { UserCheck, FileText, Clock, AlertCircle, RefreshCcw, Search, ChevronLeft, ChevronRight, Calendar, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRangePicker } from 'rsuite';
import 'rsuite/DateRangePicker/styles/index.css';
import { isWithinInterval, parse } from 'date-fns';
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

const Kyc: React.FC = () => {
    const { token } = useAuth();
    const { kycData, isLoading, error, count, refreshKycData } = useKyc();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof KycItem; direction: 'asc' | 'desc' } | null>(null);

    const loadKycData = React.useCallback(async (page: number, currentSearch: string, currentStatus: string, currentDates: [Date, Date] | null) => {
        if (!token) return;

        const params: any = {
            limit_start: (page - 1) * ITEMS_PER_PAGE,
            limit_page_length: ITEMS_PER_PAGE
        };

        if (currentSearch) {
            // Determine if search is UCC or App ID based on prefix.
            // If it starts with letters, assume UCC, else Application ID.
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

        // We aren't doing the API status filter right now as it isn't specified, but keeping local state ready
        await refreshKycData(params);
    }, [refreshKycData]);

    const handleSort = (key: keyof KycItem) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadKycData(currentPage, searchQuery, statusFilter, dateRange);
        } finally {
            setIsRefreshing(false);
        }
    };


    const debouncedSearchQuery = useDebounce(searchQuery, 400);

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

    const filteredData = useMemo(() => {
        if (!kycData) return [];

        let result = [...kycData];

        if (sortConfig) {
            result.sort((a, b) => {
                let aValue: any = a[sortConfig.key] || '';
                let bValue: any = b[sortConfig.key] || '';

                // Handle status mapping for sorting if needed
                if (sortConfig.key === 'application_status') {
                    aValue = aValue || 'IN PROGRESS';
                    bValue = bValue || 'IN PROGRESS';
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [kycData, sortConfig]);

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

    // We no longer slice locally, the data is already paginated by the API
    const paginatedData = filteredData;

    const formatValue = (value: string | null) => {
        return value || '-';
    };

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

    return (
        <div className="space-y-6 mt-4 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">KYC Status</h1>
                    <p className="text-slate-500 text-sm">Monitor and track your KYC application progress</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-[280px]">
                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            placeholder="Filter by Modified Date"
                            className="w-full bg-white/50 border-slate-200 focus:ring-blue-500 rounded-xl custom-date-picker"
                            appearance="default"
                            block
                        />
                    </div>
                    <div className="w-[200px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full bg-white/50 border-slate-200 focus:ring-blue-500 rounded-xl">
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
                        <Input
                            placeholder="Search Application ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/50 border-slate-200 focus:ring-blue-500 rounded-xl"
                        />
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing || isLoading}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg px-6 font-semibold gap-2 border-none h-[40px]"
                    >
                        <RefreshCcw className={cn("w-4 h-4", (isRefreshing || isLoading) && "animate-spin")} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md px-4 py-2 flex items-center gap-3 rounded-xl border border-white/20">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider leading-none">Total Applications</p>
                            <p className="text-lg font-bold text-slate-900 leading-tight">{count}</p>
                        </div>
                    </Card>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <Card className="border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl border border-white/20">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead
                                className="font-semibold text-slate-600 cursor-pointer select-none group/col"
                                onClick={() => handleSort('application_id')}
                            >
                                <div className="flex items-center gap-1">
                                    Application ID
                                    {sortConfig?.key === 'application_id' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400 transition-colors" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="font-semibold text-slate-600 cursor-pointer select-none group/col"
                                onClick={() => handleSort('ucc')}
                            >
                                <div className="flex items-center gap-1">
                                    UCC
                                    {sortConfig?.key === 'ucc' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400 transition-colors" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="font-semibold text-slate-600 cursor-pointer select-none group/col"
                                onClick={() => handleSort('user_name')}
                            >
                                <div className="flex items-center gap-1">
                                    User Name
                                    {sortConfig?.key === 'user_name' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400 transition-colors" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="font-semibold text-slate-600 cursor-pointer select-none group/col"
                                onClick={() => handleSort('kyc_stage')}
                            >
                                <div className="flex items-center gap-1">
                                    KYC Stage
                                    {sortConfig?.key === 'kyc_stage' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400 transition-colors" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="font-semibold text-slate-600 cursor-pointer select-none group/col"
                                onClick={() => handleSort('application_status')}
                            >
                                <div className="flex items-center  gap-1">
                                    Status
                                    {sortConfig?.key === 'application_status' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400 transition-colors" />
                                    )}
                                </div>
                            </TableHead>
                            {/* <TableHead className="font-semibold text-slate-600">Refer</TableHead> */}
                            <TableHead className="font-semibold text-slate-600 text-center">Source</TableHead>
                            <TableHead className="font-semibold text-slate-600 text-center">Tag</TableHead>
                            <TableHead className="font-semibold text-slate-600 text-center">NSE</TableHead>
                            <TableHead className="font-semibold text-slate-600 text-center">BSE</TableHead>
                            <TableHead className="font-semibold text-slate-600 text-center">NFO</TableHead>
                            <TableHead className="font-semibold text-slate-600 text-center">BFO</TableHead>
                            <TableHead className="font-semibold text-slate-600 text-center">MCX</TableHead>
                            <TableHead className="font-semibold text-slate-600 text-center">Trade Status</TableHead>
                            {/* <TableHead
                                className="font-semibold text-slate-600 text-center cursor-pointer select-none group/col"
                                onClick={() => handleSort('application_created_date')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    Created Date
                                    {sortConfig?.key === 'application_created_date' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400 transition-colors" />
                                    )}
                                </div>
                            </TableHead> */}
                            {/* <TableHead
                                className="font-semibold text-slate-600 text-center cursor-pointer select-none group/col"
                                onClick={() => handleSort('application_modified_date_time')}
                            >
                                <div className="flex items-center justify-center gap-1">
                                    Modified Date
                                    {sortConfig?.key === 'application_modified_date_time' ? (
                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
                                    ) : (
                                        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover/col:text-slate-400 transition-colors" />
                                    )}
                                </div>
                            </TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(isLoading && !kycData) ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={14}>
                                        <div className="h-10 bg-slate-100 rounded-md"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((row: KycItem, index: number) => (
                                <TableRow
                                    key={index}
                                    className="border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                    onClick={() => setSelectedAppId(row.application_id)}
                                >
                                    <TableCell className="font-medium text-slate-900">
                                        {formatValue(row.application_id)}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm font-medium text-slate-700">
                                        {row.ucc || '-'}
                                    </TableCell>
                                    <TableCell className="text-slate-700">
                                        {formatValue(row.user_name)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 py-0.5">
                                                {row.kyc_stage === 'END PAGE' ? 'ESIGN COMPLETED' : formatValue(row.kyc_stage)}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Badge
                                            className={cn(
                                                "capitalize font-bold px-3 py-1 rounded-full border-none shadow-sm",
                                                row.application_status === 'ACCOUNT OPENED' || row.application_status === 'Approved' ? "bg-green-100 text-green-700 hover:bg-green-100 flex-shrink-0" :
                                                    row.application_status === 'REJECTED' || row.application_status === 'Rejected' ? "bg-red-100 text-red-700 hover:bg-red-100 flex-shrink-0" :
                                                        row.application_status === 'PENDING FOR APPROVAL' ? "bg-purple-100 text-purple-700 hover:bg-purple-100 flex-shrink-0" :
                                                            "bg-amber-100 text-amber-700 hover:bg-amber-100 flex-shrink-0"
                                            )}
                                        >
                                            {row.application_status || 'IN PROGRESS'}
                                        </Badge>
                                    </TableCell>
                                    {/* <TableCell className="text-slate-500 font-mono text-xs">
                                        {formatValue(row.refer)}
                                    </TableCell> */}
                                    <TableCell className="text-center">{row.src}</TableCell>
                                    <TableCell className="text-center">{row.tag}</TableCell>
                                    <TableCell className="text-center">{renderSegmentBadge(row.nse)}</TableCell>
                                    <TableCell className="text-center">{renderSegmentBadge(row.bse)}</TableCell>
                                    <TableCell className="text-center">{renderSegmentBadge(row.nfo)}</TableCell>
                                    <TableCell className="text-center">{renderSegmentBadge(row.bfo)}</TableCell>
                                    <TableCell className="text-center">{renderSegmentBadge(row.mcx)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            className={cn(
                                                "capitalize font-bold px-3 py-1 rounded-full border-none shadow-sm",
                                                row.client_mapping ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                                            )}
                                        >
                                            {row.client_mapping ? 'Ready to Trade' : 'Not Ready'}
                                        </Badge>
                                    </TableCell>
                                    {/* <TableCell className="text-center text-slate-500 text-xs">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatValue(row.application_created_date)}
                                        </div>
                                    </TableCell> */}
                                    {/* <TableCell className="text-center text-slate-500 text-xs">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatValue(row.application_modified_date_time)}
                                        </div>
                                    </TableCell> */}
                                </TableRow>
                            ))
                        ) : !isLoading && (
                            <TableRow>
                                <TableCell colSpan={14} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <UserCheck className="w-12 h-12 mb-4 opacity-20" />
                                        <p>No KYC applications found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing <span className="text-slate-900 font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, count)}</span> of <span className="text-slate-900 font-bold">{count}</span> results
                        </p>
                        <Pagination className="w-auto mx-0">
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
            </Card>

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
                    <div className="flex-1 overflow-hidden px-6 pb-6">
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

export default Kyc;

