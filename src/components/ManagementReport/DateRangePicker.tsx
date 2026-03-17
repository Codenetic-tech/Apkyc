import React, { useState } from 'react';
import { Calendar, ChevronDown, RefreshCw } from 'lucide-react';
import { DateRange, QuickRange } from '@/utils/types';
import { quickRanges, formatDate, applyQuickRange } from '@/utils/types';
import { Button } from '@/components/ui/button';

interface DateRangePickerProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  loading: boolean;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  setDateRange,
  loading
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleApplyQuickRange = (range: QuickRange) => {
    const newDateRange = applyQuickRange(range);
    setDateRange(newDateRange);
    setShowDatePicker(false);
  };

  return (
    <div className="bg-white rounded-xl lg:rounded-2xl shadow-md lg:shadow-lg lg:shadow-blue-50 p-4 lg:p-6 mb-4 lg:mb-6 border border-gray-100 lg:hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
        {/* Date Display Section */}
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-2 lg:gap-3 flex-1 lg:flex-initial">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-md">
              <Calendar className="text-white" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase tracking-wide">Date Range</h3>
              <p className="text-sm lg:text-lg font-bold text-gray-800 truncate">
                {dateRange.start ? formatDate(dateRange.start) : ''} - {dateRange.end ? formatDate(dateRange.end) : ''}
              </p>
              {loading && (
                <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Loading...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
          {/* Quick Range Buttons - Compact on mobile */}
          <div className="flex gap-1.5 lg:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickRanges.slice(0, 4).map((range) => (
              <button
                key={range.label}
                onClick={() => handleApplyQuickRange(range)}
                disabled={loading}
                className="px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap flex-shrink-0"
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range and User Section */}
          <div className="flex gap-2 items-center">
            {/* Custom Date Range Button */}
            <div className="relative flex-1 sm:flex-initial">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 lg:gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto sm:min-w-[140px] disabled:opacity-50"
              >
                <Calendar size={14} className="lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Custom Range</span>
                <span className="sm:hidden">Custom</span>
                <ChevronDown size={14} className={`lg:w-4 lg:h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Date Picker - Full screen on mobile */}
              {showDatePicker && (
                <>
                  {/* Mobile Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setShowDatePicker(false)}
                  />
                  
                  {/* Date Picker Panel */}
                  <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 lg:absolute lg:inset-x-auto lg:top-full lg:right-0 lg:translate-y-0 lg:mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 w-auto lg:min-w-[320px] max-w-md mx-auto lg:mx-0">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 text-sm lg:text-base">Select Date Range</h4>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 lg:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">End Date</label>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 lg:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {quickRanges.slice(4).map((range) => (
                        <button
                          key={range.label}
                          onClick={() => handleApplyQuickRange(range)}
                          className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Button Placeholder for consistency, but menu removed */}
            <div className="hidden lg:block w-4"></div>
          </div>
        </div>
      </div>

      {/* Add CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;