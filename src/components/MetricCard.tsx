import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  badgeText?: string;
  isCurrency?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  gradient,
  iconColor,
  badgeText,
  isCurrency = true,
}) => {
  const formattedValue =
    typeof value === 'number'
      ? isCurrency
        ? `₹${value.toLocaleString('en-IN')}`
        : value.toString()
      : value;

  return (
    <div className={`relative overflow-hidden rounded-2xl glass-card p-4 border border-slate-800/80 shadow-lg`}>
      {/* Decorative Gradient Glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-15 blur-2xl ${gradient}`} />

      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
        <div className={`p-2 rounded-xl ${iconColor} border border-white/5`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-1">
        <h3 className="font-heading font-extrabold text-2xl text-white tracking-tight">
          {formattedValue}
        </h3>
        {badgeText && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {badgeText}
          </span>
        )}
      </div>

      {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
    </div>
  );
};
