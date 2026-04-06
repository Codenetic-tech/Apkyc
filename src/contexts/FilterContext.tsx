import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface DateRange {
  start: string | null;
  end: string | null;
}

interface FilterContextType {
  selectedHierarchy: string[];
  setSelectedHierarchy: (hierarchy: string[]) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [selectedHierarchy, setSelectedHierarchy] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], // Default last 7 days
    end: new Date().toISOString().split('T')[0]
  });

  const clearFilters = () => {
    setSelectedHierarchy([]);
    setDateRange({
      start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
  };

  // Reset filters on logout
  useEffect(() => {
    if (!isAuthenticated) {
      clearFilters();
    }
  }, [isAuthenticated]);

  return (
    <FilterContext.Provider value={{
      selectedHierarchy,
      setSelectedHierarchy,
      dateRange,
      setDateRange,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
