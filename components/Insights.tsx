
import React from 'react';
import { LightbulbIcon } from './Icons';

interface InsightsProps {
  insight: string;
  onRefresh: () => void;
  isLoading: boolean;
}

const Insights: React.FC<InsightsProps> = ({ insight, onRefresh, isLoading }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-5 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
            <LightbulbIcon className="h-6 w-6 text-yellow-300" />
            <h3 className="text-lg font-bold text-white">AI Financial Insight</h3>
        </div>
        <button onClick={onRefresh} disabled={isLoading} className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50">
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <p className="text-slate-300">
        {isLoading && !insight ? 'Generating your first insight...' : insight}
      </p>
    </div>
  );
};

export default Insights;
