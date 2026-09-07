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
      'bg-[#0d2236] text-slate-200 border border-cyan-500/30 hover:bg-[#102a40] hover:border-cyan-400/60 active:bg-[#163452] focus-visible:ring-cyan-400 shadow-[0_0_14px_rgba(0,184,255,.08)]',
    primary:
      'bg-[#168bff] text-white hover:bg-[#00b8ff] active:bg-[#006bd6] focus-visible:ring-cyan-400 shadow-[0_0_16px_rgba(0,184,255,.22)]',
    accent:
      'bg-[#00b8ff] text-[#04111f] hover:bg-[#00d9ff] active:bg-[#168bff] focus-visible:ring-cyan-300 shadow-[0_0_16px_rgba(0,217,255,.22)]',
    secondary:
      'bg-[#0b1b2b] text-slate-200 border border-cyan-500/25 hover:bg-[#102a40] hover:border-cyan-400/55 active:bg-[#163452] focus-visible:ring-cyan-400 shadow-xs',
    danger:
      'bg-[#ff334f] text-white hover:bg-[#ff5252] active:bg-[#d91f3a] focus-visible:ring-rose-300 shadow-[0_0_16px_rgba(255,51,79,.2)]',
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
