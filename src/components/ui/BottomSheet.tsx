'use client';

import React from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Render on all breakpoints instead of only below `lg`. */
  alwaysVisible?: boolean;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  alwaysVisible = false,
}: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[550] flex items-end justify-center ${alwaysVisible ? '' : 'lg:hidden'}`}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-h-[85vh] bg-[#0B0F19] border-t border-slate-800 text-slate-100 rounded-t-card shadow-modal overflow-hidden flex flex-col ds-sheet-enter"
      >
        <div className="flex items-center justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1 rounded-full bg-slate-700" aria-hidden="true" />
        </div>
        {title && (
          <div className="px-4 pb-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <h3 className="font-bold text-sm text-white">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-4 py-3.5 flex-1 bg-[#090D16]">{children}</div>
      </div>
    </div>
  );
}
