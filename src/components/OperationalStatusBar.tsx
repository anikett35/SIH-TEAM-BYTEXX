'use client';

import React, { useEffect, useState } from 'react';
import { formatIST } from '@/lib/format-datetime';

export default function OperationalStatusBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 px-5 lg:px-8 py-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
        System operational
      </span>
      <span className="hidden sm:inline text-slate-300">|</span>
      <span className="hidden sm:inline">Data updated moments ago</span>
      <span className="hidden md:inline text-slate-300">|</span>
      <span className="hidden md:inline font-mono" suppressHydrationWarning>
        {now ? formatIST(now) : '—'}
      </span>
    </div>
  );
}
