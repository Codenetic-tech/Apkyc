// OverviewTab.tsx
import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as BarChart3Icon } from 'recharts';
import { Clock, Activity, ArrowUpRight, FileCheck, XCircle, CheckCircle2, UserCheck, FileText, BarChart3 } from 'lucide-react';
import { SummaryData, ReferralData, COLORS } from '@/utils/referral';
import { useKyc } from '@/contexts/KycContext';

interface OverviewTabProps {
  summaryData: SummaryData;
  isInitialLoading: boolean;
  clientDetails: ReferralData[];
  ledger: ReferralData[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  summaryData, 
  isInitialLoading, 
  clientDetails,
  ledger
}) => {
  const { count: kycCount, statusCount, isLoading: kycLoading } = useKyc();

  const statusCards = [
    { 
      label: 'Total Applications', 
      value: kycCount, 
      icon: FileText, 
      color: 'blue',
      iconBg: 'bg-blue-500',
      hoverGradient: 'hover:from-blue-500 hover:to-blue-600',
      shadow: 'shadow-blue-100 hover:shadow-blue-500/40',
      trendBg: 'bg-blue-100',
      trendText: 'text-blue-600',
    },
    { 
      label: 'In Progress', 
      value: statusCount['IN PROGRESS'], 
      icon: Clock, 
      color: 'amber',
      iconBg: 'bg-amber-500',
      hoverGradient: 'hover:from-amber-500 hover:to-amber-600',
      shadow: 'shadow-amber-100 hover:shadow-amber-500/40',
      trendBg: 'bg-amber-100',
      trendText: 'text-amber-600',
    },
    { 
      label: 'Pending Approval', 
      value: statusCount['PENDING FOR APPROVAL'], 
      icon: FileCheck, 
      color: 'purple',
      iconBg: 'bg-purple-500',
      hoverGradient: 'hover:from-purple-500 hover:to-purple-600',
      shadow: 'shadow-purple-100 hover:shadow-purple-500/40',
      trendBg: 'bg-purple-100',
      trendText: 'text-purple-600',
    },
    { 
      label: 'Rejected', 
      value: statusCount['REJECTED'], 
      icon: XCircle, 
      color: 'red',
      iconBg: 'bg-red-500',
      hoverGradient: 'hover:from-red-500 hover:to-red-600',
      shadow: 'shadow-red-100 hover:shadow-red-500/40',
      trendBg: 'bg-red-100',
      trendText: 'text-red-600',
    },
    { 
      label: 'Approved', 
      value: statusCount['APPROVED'], 
      icon: CheckCircle2, 
      color: 'green',
      iconBg: 'bg-green-500',
      hoverGradient: 'hover:from-green-500 hover:to-green-600',
      shadow: 'shadow-green-100 hover:shadow-green-500/40',
      trendBg: 'bg-green-100',
      trendText: 'text-green-600',
    },
    { 
      label: 'Account Opened', 
      value: statusCount['ACCOUNT OPENED'], 
      icon: UserCheck, 
      color: 'emerald',
      iconBg: 'bg-emerald-500',
      hoverGradient: 'hover:from-emerald-500 hover:to-emerald-600',
      shadow: 'shadow-emerald-100 hover:shadow-emerald-500/40',
      trendBg: 'bg-emerald-100',
      trendText: 'text-emerald-600',
    },
  ];

  // Chart data for status distribution
  const chartData = [
    { name: 'In Progress', value: statusCount['IN PROGRESS'] || 0, color: '#f59e0b' },
    { name: 'Pending Approval', value: statusCount['PENDING FOR APPROVAL'] || 0, color: '#8b5cf6' },
    { name: 'Rejected', value: statusCount['REJECTED'] || 0, color: '#ef4444' },
    { name: 'Approved', value: statusCount['APPROVED'] || 0, color: '#10b981' },
    { name: 'Account Opened', value: statusCount['ACCOUNT OPENED'] || 0, color: '#0ea5e9' }
  ].filter(item => item.value > 0);

  // Monthly trend mock data (since we don't have historical API)
  const monthlyData = [
    { month: 'Current', applications: kycCount }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-bold text-gray-800">Overview</h2>
      </div>

      {/* Desktop View - 6 status cards in a grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-xl shadow-lg ${card.shadow} p-6 text-gray-800 transition-all duration-300 hover:bg-gradient-to-br ${card.hoverGradient} hover:text-white group`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.iconBg} p-2 rounded-lg transition-colors duration-300 group-hover:bg-white/20 backdrop-blur-sm`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium opacity-80 mb-1">{card.label}</h3>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Mobile View - 2 column grid */}
      <div className="lg:hidden grid grid-cols-2 gap-3">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`${card.iconBg} p-2 rounded-lg`}>
                  <Icon size={16} className="text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className="text-lg font-bold text-gray-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      {!kycLoading && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Status Distribution Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-50/50 p-8 border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Status Distribution</h3>
                <p className="text-xs text-slate-500 font-medium">Application lifecycle breakdown</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <Activity size={18} className="text-blue-600" />
              </div>
            </div>
            
            <div className="relative flex-1 min-h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="75%"
                    outerRadius="100%"
                    paddingAngle={8}
                    cornerRadius={40}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Info Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{kycCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-slate-50">
                {chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{item.name}</span>
                            <span className="text-sm font-bold text-slate-700">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Applications Bar Chart */}
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-50/50 p-8 border border-slate-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Application Trend</h3>
                <p className="text-xs text-slate-500 font-medium">Monthly performance overview</p>
              </div>
              <div className="bg-indigo-50 p-2 rounded-lg">
                <BarChart3 size={18} className="text-indigo-600" />
              </div>
            </div>

            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC', radius: 8 }}
                    contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '4px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                  />
                  <Bar 
                    dataKey="applications" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 8, 8]} 
                    maxBarSize={45} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;