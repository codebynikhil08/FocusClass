import React from 'react';
import { getStatusColor } from '../../utils/formatters';

interface BadgeProps {
  status?: string;
  label?: string;
  variant?: 'status' | 'demo' | 'neutral' | 'accent';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  status = 'active', 
  label, 
  variant = 'status',
  size = 'sm' 
}) => {
  if (variant === 'demo') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {label || 'Demo / Simulated Data'}
      </span>
    );
  }

  if (variant === 'accent') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        {label}
      </span>
    );
  }

  const colors = getStatusColor(status);
  const displayLabel = label || status.toUpperCase();

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${colors.bg} ${colors.text} border ${colors.border} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${status.toLowerCase() === 'active' ? 'animate-pulse' : ''}`} />
      {displayLabel}
    </span>
  );
};
