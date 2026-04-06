import React from 'react';
import { Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const KYCTracker = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 transition-colors">
            <Shield size={14} className="fill-green-500/20" />
            <span className="text-xs font-bold uppercase tracking-wider">KYC Tracked</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">All systems operational</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
