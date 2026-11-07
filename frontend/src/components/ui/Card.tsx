import clsx from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-2xl shadow-sm border border-primary-100 p-5',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon, iconBg = 'bg-primary-100', trend, trendUp }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-navy-900">{value}</p>
        {trend && (
          <p className={clsx('text-xs mt-0.5 font-medium', trendUp ? 'text-green-500' : 'text-red-500')}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
    </div>
  );
}

