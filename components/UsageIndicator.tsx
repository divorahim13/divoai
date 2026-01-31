import React from 'react';
import { USAGE_LIMIT_USD } from '../constants';
import { Zap } from 'lucide-react';

interface UsageIndicatorProps {
  currentUsage: number;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({ currentUsage }) => {
  const percentage = Math.min((currentUsage / USAGE_LIMIT_USD) * 100, 100);
  const isLimitReached = currentUsage >= USAGE_LIMIT_USD;

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center text-gray-700 font-medium">
          <div className={`p-1.5 rounded-lg mr-2 ${isLimitReached ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span>Free Tier Usage</span>
        </div>
        <span className={`font-mono text-xs font-semibold px-2 py-1 rounded-md ${isLimitReached ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
          ${currentUsage.toFixed(5)} <span className="text-gray-400">/</span> ${USAGE_LIMIT_USD}
        </span>
      </div>
      
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full transition-all duration-700 ease-out rounded-full ${
            isLimitReached 
              ? 'bg-gradient-to-r from-red-500 to-orange-500' 
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {isLimitReached && (
        <p className="text-xs text-red-500 mt-2 text-center font-semibold animate-pulse">
          Limit reached. Please upgrade to continue chatting.
        </p>
      )}
    </div>
  );
};