'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'default';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'button button-press-feedback rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap gap-2';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    default:
      'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 focus-visible:ring-gray-300 shadow-xs dark:bg-[#0d2236] dark:text-slate-200 dark:border-cyan-500/30 dark:hover:bg-[#102a40] dark:hover:border-cyan-400/60 dark:active:bg-[#163452] dark:focus-visible:ring-cyan-400 dark:shadow-[0_0_14px_rgba(0,184,255,.08)]',
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500 shadow-xs dark:bg-[#168bff] dark:hover:bg-[#00b8ff] dark:active:bg-[#006bd6] dark:focus-visible:ring-cyan-400 dark:shadow-[0_0_16px_rgba(0,184,255,.22)]',
    accent:
      'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 focus-visible:ring-blue-500 shadow-xs dark:bg-[#00b8ff] dark:text-[#04111f] dark:hover:bg-[#00d9ff] dark:active:bg-[#168bff] dark:focus-visible:ring-cyan-300 dark:shadow-[0_0_16px_rgba(0,217,255,.22)]',
    secondary:
      'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 focus-visible:ring-gray-300 shadow-xs dark:bg-[#0b1b2b] dark:text-slate-200 dark:border-cyan-500/25 dark:hover:bg-[#102a40] dark:hover:border-cyan-400/55 dark:active:bg-[#163452] dark:focus-visible:ring-cyan-400 dark:shadow-xs',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-xs dark:bg-[#ff334f] dark:hover:bg-[#ff5252] dark:active:bg-[#d91f3a] dark:focus-visible:ring-rose-300 dark:shadow-[0_0_16px_rgba(255,51,79,.2)]',
  };

  return (
    <button
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
