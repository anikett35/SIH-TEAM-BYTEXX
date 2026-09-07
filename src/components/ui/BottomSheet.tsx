'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  alwaysVisible?: boolean;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  alwaysVisible = true,
}: BottomSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[550] flex justify-end items-end sm:items-stretch font-sans animate-in fade-in duration-200">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (Side drawer on desktop, bottom sheet on mobile) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full sm:max-w-md bg-white border-t sm:border-t-0 sm:border-l border-gray-200 text-gray-900 rounded-t-2xl sm:rounded-t-none sm:rounded-l-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-full h-auto sm:h-full animate-in slide-in-from-bottom sm:slide-in-from-right duration-250"
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex items-center justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1 rounded-full bg-gray-300" aria-hidden="true" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <h3 className="font-bold text-sm text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto p-5 flex-1 bg-white text-gray-800 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
