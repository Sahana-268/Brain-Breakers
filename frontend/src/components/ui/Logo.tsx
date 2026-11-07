import React from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  to?: string;
  className?: string;
}

export default function Logo({
  size = 'md',
  showText = true,
  to = '/',
  className,
}: LogoProps) {
  const imageSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  const content = (
    <div className={clsx('flex items-center gap-2.5 select-none', className)}>
      <div className={clsx(imageSizes[size], 'rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-white border border-primary-200/60 p-0.5 flex items-center justify-center')}>
        <img
          src="/logo.jpg"
          alt="Brain Breakers Academy Logo"
          className="w-full h-full object-cover object-bottom rounded-lg"
        />
      </div>

      {showText && (
        <div className="leading-none">
          <div className="flex items-center gap-1">
            <span className={clsx('font-black tracking-tight text-[#156e3b]', titleSizes[size])}>
              BRAIN
            </span>
            <span className={clsx('font-black tracking-tight text-[#ff781f]', titleSizes[size])}>
              BREAKERS
            </span>
          </div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#156e3b] block mt-0.5">
            Academy
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block hover:opacity-95 transition-opacity">{content}</Link>;
  }

  return content;
}

