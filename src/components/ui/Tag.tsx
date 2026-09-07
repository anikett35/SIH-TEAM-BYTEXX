import React, { ReactNode } from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  prefix?: boolean | ReactNode;
  prefixClass?: string;
  suffix?: boolean | ReactNode;
  suffixClass?: string;
  className?: string;
}

export default function Tag({
  children,
  prefix,
  prefixClass,
  suffix,
  suffixClass,
  className = '',
  ...rest
}: TagProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 ${className}`}
      {...rest}
    >
      {prefix && typeof prefix === 'boolean' && prefixClass && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${prefixClass}`} />
      )}
      {typeof prefix === 'object' && prefix}
      {children}
      {suffix && typeof suffix === 'boolean' && suffixClass && (
        <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${suffixClass}`} />
      )}
      {typeof suffix === 'object' && suffix}
    </span>
  );
}
