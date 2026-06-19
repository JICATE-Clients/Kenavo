import React from 'react';
import { CheckCircle, AlertCircle, Info, ChevronRight, type LucideIcon } from 'lucide-react';

/**
 * Shared, minimal building blocks for the admin "Import" tab.
 * Flat purple, neutral borders, no gradients — matches AdminShell.
 */

export const FILE_INPUT_CLS =
  'w-full rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 file:mr-4 file:cursor-pointer file:border-0 file:bg-[#4E2E8C] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-[#3d2370] focus:outline-none focus:ring-2 focus:ring-[#4E2E8C]/30 transition-colors';

export const PRIMARY_BTN_CLS =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4E2E8C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3d2370] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E2E8C]/40 sm:w-auto';

export const OUTLINE_BTN_CLS =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E2E8C]/40 disabled:cursor-not-allowed disabled:opacity-50';

export const FIELD_LABEL_CLS = 'mb-1.5 block text-sm font-medium text-neutral-700';

export type ImportMessage = { type: 'success' | 'error' | 'warning'; text: string };

export function ImportStatus({ message }: { message: ImportMessage }) {
  const tone =
    message.type === 'success'
      ? 'border-green-200 bg-green-50 text-green-700'
      : message.type === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-red-200 bg-red-50 text-red-700';
  const Icon = message.type === 'success' ? CheckCircle : AlertCircle;
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm ${tone}`}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span className="whitespace-pre-line leading-relaxed">{message.text}</span>
    </div>
  );
}

export function ImportCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4E2E8C]/10 text-[#4E2E8C]">
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function ImportNote({ children }: { children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-neutral-200 bg-neutral-50 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 font-medium text-neutral-600">
        <Info size={15} className="text-[#4E2E8C]" />
        How it works
        <ChevronRight size={15} className="ml-auto text-neutral-400 transition-transform group-open:rotate-90" />
      </summary>
      <div className="border-t border-neutral-200 px-3.5 py-3 text-neutral-600">{children}</div>
    </details>
  );
}
