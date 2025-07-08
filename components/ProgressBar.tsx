

import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
      <div
        className="bg-primary-600 h-4 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );
};