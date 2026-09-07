'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger';
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
    primary:
      'bg-primary text-white hover:bg-primary-deep active:bg-primary-deep focus-visible:ring-primary shadow-xs',
    accent:
      'bg-primary-mild text-white hover:bg-primary-deep active:bg-primary-deep focus-visible:ring-primary shadow-xs',
    secondary:
      'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 focus-visible:ring-gray-300 shadow-xs',
    danger:
      'bg-error text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-error shadow-xs',
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
