'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  confirming?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  confirming = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md bg-white border border-slate-200 rounded-card shadow-modal overflow-hidden"
      >
        <div className="p-5 space-y-3.5">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-control bg-red-50 text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h3 id="confirm-dialog-title" className="font-bold text-base text-slate-900">
                {title}
              </h3>
              {description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>}
            </div>
          </div>

          {children && (
            <div className="rounded-control bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 space-y-1.5">
              {children}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? 'Processing…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
