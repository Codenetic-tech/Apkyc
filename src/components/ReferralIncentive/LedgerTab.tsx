// LedgerTab.tsx
import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Search, Filter, Download, IndianRupee, ChevronRight } from 'lucide-react';
import { ReferralData } from '@/utils/referral';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface LedgerTabProps {
  data: ReferralData[];
  loading: boolean;
}

const LedgerTab: React.FC<LedgerTabProps> = ({ data, loading }) => {
  const [searchValue, setSearchValue] = useState('');

  const columns: ColumnDef<ReferralData>[] = [
    {
      accessorKey: 'application_no',
      header: 'Application No',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue('application_no')}
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Application Date',
      cell: ({ row }) => (
        <div className="text-gray-600">
          {new Date(row.getValue('date')).toLocaleDateString('en-IN')}
        </div>
      ),
    },
    {
      accessorKey: 'masked_mobile',
      header: 'Mobile',
      cell: ({ row }) => (
        <div className="text-gray-600">
          {row.getValue('masked_mobile')}
        </div>
      ),
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ row }) => {
        const stage = row.getValue('stage') as string;
        let bgColor = 'bg-gray-100 text-gray-800';
        
        if (stage === 'E sign') bgColor = 'bg-blue-100 text-blue-800';
        if (stage === 'Nominee') bgColor = 'bg-green-100 text-green-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
            {stage}
          </span>
        );
      },
    },
    {
      accessorKey: 'trade',
      header: 'Traded',
      cell: ({ row }) => {
        const traded = row.getValue('trade') === 'TRUE';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            traded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {traded ? 'Yes' : 'No'}
          </span>
        );
      },
    },
    {
      accessorKey: 'incentive_paid_date',
      header: 'Paid Date',
      cell: ({ row }) => (
        <div className="text-gray-600">
          {row.getValue('incentive_paid_date') 
            ? new Date(row.getValue('incentive_paid_date')).toLocaleDateString('en-IN')
            : '-'
          }
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="font-semibold text-green-600 flex items-center gap-1">
          <IndianRupee size={14} />
          {row.getValue('amount') || '0'}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Filter data based on search
  const filteredData = data.filter(item =>
    item.application_no.toLowerCase().includes(searchValue.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    table.getState().pagination.pageIndex * 10,
    (table.getState().pagination.pageIndex + 1) * 10
  );

  // Calculate total amount
  const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);

  // Mobile Card View
  const MobileCardView = () => (
    <div className="space-y-4 lg:hidden">
      {paginatedData.map((item, index) => {
        const stage = item.stage;
        const traded = item.trade === 'TRUE';
        let stageBgColor = 'bg-gray-100 text-gray-800';
        
        if (stage === 'E sign') stageBgColor = 'bg-blue-100 text-blue-800';
        if (stage === 'Nominee') stageBgColor = 'bg-green-100 text-green-800';

        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Application No</div>
                <div className="font-semibold text-gray-900">{item.application_no}</div>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Date</div>
                <div className="text-sm text-gray-900">
                  {new Date(item.date).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Mobile</div>
                <div className="text-sm text-gray-900">{item.masked_mobile}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Paid Date</div>
                <div className="text-sm text-gray-900">
                  {item.incentive_paid_date 
                    ? new Date(item.incentive_paid_date).toLocaleDateString('en-IN')
                    : '-'
                  }
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Amount</div>
                <div className="font-semibold text-green-600 flex items-center gap-1">
                  <IndianRupee size={12} />
                  {item.amount || '0'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Stage:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stageBgColor}`}>
                  {stage}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Traded:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  traded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {traded ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading ledger data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div></div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search applications..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchValue}
              onChange={e => {
                setSearchValue(e.target.value);
                table.getColumn('application_no')?.setFilterValue(e.target.value);
              }}
            />
          </div>
          <div className="flex gap-3">
            {/*<button className="flex-1 sm:flex-initial px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>*/}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <MobileCardView />

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {table.getRowModel().rows.length} of {data.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className="lg:hidden bg-white rounded-lg shadow border border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-700">
            Showing {paginatedData.length} of {filteredData.length} results
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of {Math.ceil(filteredData.length / 10)}
          </span>
          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>

      {data.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <IndianRupee className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No paid incentives</h3>
          <p className="text-gray-600">No incentive payments have been processed yet.</p>
        </div>
      )}
    </div>
  );
};

export default LedgerTab;