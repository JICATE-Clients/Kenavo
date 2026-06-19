'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Eye,
  PencilLine,
} from 'lucide-react';
import ReunionArticle from '@/components/reunion/ReunionArticle';
import {
  DEFAULT_REUNION_CONTENT,
  REUNION_SLUG,
  type ReunionContent,
  type Para,
  type Quote,
  type DayBlock,
} from '@/lib/reunion-content';

const PURPLE = '#4E2E8C';
const inputCls =
  'w-full px-3 py-2 rounded-lg bg-white text-neutral-800 placeholder-neutral-400 border border-neutral-200 focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 focus:outline-none text-sm transition-colors';
const labelCls = 'block text-sm font-semibold text-[#4E2E8C] mb-1.5';
const iconBtnCls =
  'inline-flex items-center justify-center rounded-md border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E2E8C]/40';

/* ──────────────────────────── Small field helpers ─────────────────────────── */

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function AreaField({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea className={`${inputCls} resize-y leading-relaxed`} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

/* ──────────────────────────── Collapsible section ──────────────────────────── */

function Section({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E2E8C]/40 rounded-xl"
        aria-expanded={open}
      >
        <ChevronRight
          size={18}
          className={`shrink-0 text-[#4E2E8C] transition-transform motion-reduce:transition-none ${open ? 'rotate-90' : ''}`}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-neutral-900">{title}</span>
          {subtitle && <span className="block truncate text-xs text-neutral-500">{subtitle}</span>}
        </span>
      </button>
      {open && <div className="space-y-4 border-t border-neutral-100 px-4 py-4">{children}</div>}
    </div>
  );
}

/* ──────────────────────────── Paragraph list editor ────────────────────────── */

function ParagraphListEditor({
  paragraphs,
  onChange,
  allowLead = false,
  allowBold = false,
}: {
  paragraphs: Para[];
  onChange: (next: Para[]) => void;
  allowLead?: boolean;
  allowBold?: boolean;
}) {
  const update = (i: number, patch: Partial<Para>) =>
    onChange(paragraphs.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const remove = (i: number) => onChange(paragraphs.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= paragraphs.length) return;
    const next = [...paragraphs];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...paragraphs, { text: '' }]);

  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 p-2.5">
          {allowLead && (
            <input
              className={`${inputCls} mb-2`}
              value={p.lead ?? ''}
              placeholder="Accent prefix (optional), e.g. “Prelude: ”"
              onChange={(e) => update(i, { lead: e.target.value || undefined })}
            />
          )}
          <textarea
            className={`${inputCls} resize-y leading-relaxed`}
            rows={Math.min(8, Math.max(2, Math.ceil((p.text?.length || 0) / 90)))}
            value={p.text}
            onChange={(e) => update(i, { text: e.target.value })}
            placeholder="Paragraph text…"
          />
          <div className="mt-2 flex items-center gap-2">
            {allowBold && (
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
                <input
                  type="checkbox"
                  className="accent-[#4E2E8C]"
                  checked={!!p.bold}
                  onChange={(e) => update(i, { bold: e.target.checked || undefined })}
                />
                Bold
              </label>
            )}
            <span className="ml-auto flex items-center gap-1">
              <button type="button" className={iconBtnCls} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <ChevronUp size={15} />
              </button>
              <button type="button" className={iconBtnCls} onClick={() => move(i, 1)} disabled={i === paragraphs.length - 1} aria-label="Move down">
                <ChevronDown size={15} />
              </button>
              <button type="button" className={iconBtnCls} onClick={() => remove(i)} aria-label="Delete paragraph">
                <Trash2 size={15} />
              </button>
            </span>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-[#4E2E8C] hover:bg-[#4E2E8C]/5 transition-colors"
      >
        <Plus size={15} /> Add paragraph
      </button>
    </div>
  );
}

/* ──────────────────────────── Quote editor ─────────────────────────────────── */

function QuoteEditor({
  quote,
  onChange,
  removable = true,
}: {
  quote: Quote | undefined;
  onChange: (q: Quote | undefined) => void;
  removable?: boolean;
}) {
  if (!quote) {
    return (
      <button
        type="button"
        onClick={() => onChange({ text: '' })}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-[#4E2E8C] hover:bg-[#4E2E8C]/5 transition-colors"
      >
        <Plus size={15} /> Add blockquote
      </button>
    );
  }
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Blockquote</span>
        {removable && (
          <button type="button" className={iconBtnCls} onClick={() => onChange(undefined)} aria-label="Remove blockquote">
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <textarea
        className={`${inputCls} resize-y`}
        rows={2}
        value={quote.text}
        onChange={(e) => onChange({ ...quote, text: e.target.value })}
        placeholder="Quote text (use Enter for line breaks)"
      />
      <input
        className={inputCls}
        value={quote.footer ?? ''}
        onChange={(e) => onChange({ ...quote, footer: e.target.value || undefined })}
        placeholder="Attribution (optional), e.g. — Our School Song"
      />
    </div>
  );
}

/* ──────────────────────────── Day block editor ─────────────────────────────── */

function DayBlockEditor({
  block,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: {
  block: DayBlock;
  onChange: (b: DayBlock) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <select
          className={`${inputCls} w-auto`}
          value={block.style}
          onChange={(e) => onChange({ ...block, style: e.target.value as DayBlock['style'] })}
        >
          <option value="card">Boxed card</option>
          <option value="section">Plain section</option>
        </select>
        <span className="ml-auto flex items-center gap-1">
          <button type="button" className={iconBtnCls} onClick={() => onMove(-1)} disabled={isFirst} aria-label="Move block up">
            <ChevronUp size={15} />
          </button>
          <button type="button" className={iconBtnCls} onClick={() => onMove(1)} disabled={isLast} aria-label="Move block down">
            <ChevronDown size={15} />
          </button>
          <button type="button" className={iconBtnCls} onClick={onRemove} aria-label="Delete block">
            <Trash2 size={15} />
          </button>
        </span>
      </div>

      {block.style === 'card' && (
        <Field label="Eyebrow (small label above heading)" value={block.eyebrow ?? ''} onChange={(v) => onChange({ ...block, eyebrow: v || undefined })} placeholder="e.g. Evening, 9:30 AM" />
      )}
      <Field label="Heading" value={block.heading} onChange={(v) => onChange({ ...block, heading: v })} />

      <div>
        <label className={labelCls}>Paragraphs</label>
        <ParagraphListEditor paragraphs={block.paragraphs} onChange={(paragraphs) => onChange({ ...block, paragraphs })} />
      </div>

      {block.style === 'card' && (
        <div>
          <label className={labelCls}>Blockquote</label>
          <QuoteEditor
            quote={block.quote}
            onChange={(quote) =>
              onChange({
                ...block,
                quote,
                quoteAfter: quote ? (block.quoteAfter ?? block.paragraphs.length - 1) : undefined,
              })
            }
          />
          {block.quote && (
            <label className="mt-2 block text-xs text-neutral-500">
              Show quote after paragraph #
              <input
                type="number"
                min={1}
                max={Math.max(1, block.paragraphs.length)}
                className="ml-2 w-16 rounded border border-neutral-200 px-2 py-1 text-sm"
                value={(block.quoteAfter ?? block.paragraphs.length - 1) + 1}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (!Number.isNaN(n)) onChange({ ...block, quoteAfter: Math.max(0, n - 1) });
                }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── Main tab ─────────────────────────────────────── */

export default function ReunionPageEditorTab() {
  const [content, setContent] = useState<ReunionContent | null>(null);
  const [snapshot, setSnapshot] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/page-content/${REUNION_SLUG}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && data.content) {
          setContent(data.content);
          setSnapshot(JSON.stringify(data.content));
        } else {
          setContent(DEFAULT_REUNION_CONTENT);
          setSnapshot(JSON.stringify(DEFAULT_REUNION_CONTENT));
        }
      } catch {
        setContent(DEFAULT_REUNION_CONTENT);
        setSnapshot(JSON.stringify(DEFAULT_REUNION_CONTENT));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dirty = useMemo(
    () => content !== null && JSON.stringify(content) !== snapshot,
    [content, snapshot]
  );

  // Immutable update helper: structuredClone the draft, mutate, set.
  const mutate = (fn: (draft: ReunionContent) => void) =>
    setContent((prev) => {
      if (!prev) return prev;
      const next: ReunionContent = structuredClone(prev);
      fn(next);
      return next;
    });

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/page-content/${REUNION_SLUG}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSnapshot(JSON.stringify(content));
      setMessage({ type: 'success', text: 'Saved. Your changes are now live on the reunion page.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('Reset all fields to the original published text? Unsaved edits will be lost. (You still need to Save to apply.)')) return;
    setContent(structuredClone(DEFAULT_REUNION_CONTENT));
    setMessage(null);
  };

  if (loading || !content) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-500">
        <Loader2 size={22} className="mr-2 animate-spin text-[#4E2E8C]" />
        Loading page content…
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#4E2E8C]">Reunion Page</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Edit the content of the <span className="font-medium">/reunion-2025</span> story. The preview updates as you type.
          </p>
        </div>
        <a
          href="/reunion-2025"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          <ExternalLink size={16} /> View live page
        </a>
      </div>

      {/* Mobile form/preview toggle */}
      <div className="flex rounded-lg border border-neutral-200 p-1 lg:hidden">
        {(['form', 'preview'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setMobileView(v)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors ${
              mobileView === v ? 'bg-[#4E2E8C] text-white' : 'text-neutral-600'
            }`}
          >
            {v === 'form' ? <PencilLine size={15} /> : <Eye size={15} />}
            {v === 'form' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor column */}
        <div className={`space-y-3 ${mobileView === 'preview' ? 'hidden lg:block' : ''}`}>
          {/* Hero */}
          <Section title="Hero" subtitle="Title & byline" defaultOpen>
            <Field label="Title" value={content.hero.title} onChange={(v) => mutate((d) => { d.hero.title = v; })} />
            <Field
              label="Accent word (coloured part of the title)"
              value={content.hero.accent ?? ''}
              onChange={(v) => mutate((d) => { d.hero.accent = v || undefined; })}
              placeholder="e.g. 25th"
            />
            <Field label="Byline" value={content.hero.byline} onChange={(v) => mutate((d) => { d.hero.byline = v; })} />
          </Section>

          {/* Intro */}
          <Section title="Introduction" subtitle={`${content.intro.length} paragraph(s)`}>
            <ParagraphListEditor paragraphs={content.intro} allowLead onChange={(intro) => mutate((d) => { d.intro = intro; })} />
          </Section>

          {/* Days */}
          {content.days.map((day, di) => (
            <Section key={di} title={`Day ${di + 1} — ${day.heading || day.dateLabel}`} subtitle={day.dateLabel}>
              <Field label="Date label" value={day.dateLabel} onChange={(v) => mutate((d) => { d.days[di].dateLabel = v; })} />
              <Field label="Heading" value={day.heading} onChange={(v) => mutate((d) => { d.days[di].heading = v; })} />

              <div>
                <label className={labelCls}>Opening paragraphs</label>
                <ParagraphListEditor paragraphs={day.lead} allowLead onChange={(lead) => mutate((d) => { d.days[di].lead = lead; })} />
              </div>

              <div className="space-y-3">
                <label className={labelCls}>Sub-sections &amp; cards</label>
                {day.blocks.map((block, bi) => (
                  <DayBlockEditor
                    key={bi}
                    block={block}
                    isFirst={bi === 0}
                    isLast={bi === day.blocks.length - 1}
                    onChange={(b) => mutate((d) => { d.days[di].blocks[bi] = b; })}
                    onRemove={() => mutate((d) => { d.days[di].blocks.splice(bi, 1); })}
                    onMove={(dir) =>
                      mutate((d) => {
                        const blocks = d.days[di].blocks;
                        const j = bi + dir;
                        if (j < 0 || j >= blocks.length) return;
                        [blocks[bi], blocks[j]] = [blocks[j], blocks[bi]];
                      })
                    }
                  />
                ))}
                <button
                  type="button"
                  onClick={() => mutate((d) => { d.days[di].blocks.push({ style: 'card', heading: '', paragraphs: [{ text: '' }] }); })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-[#4E2E8C] hover:bg-[#4E2E8C]/5 transition-colors"
                >
                  <Plus size={15} /> Add card / section
                </button>
              </div>
            </Section>
          ))}

          {/* Tribute */}
          <Section title="Tribute" subtitle="The Heart Behind the Event">
            <Field label="Heading" value={content.tribute.heading} onChange={(v) => mutate((d) => { d.tribute.heading = v; })} />
            <div>
              <label className={labelCls}>Paragraphs</label>
              <ParagraphListEditor
                paragraphs={content.tribute.paragraphs}
                allowBold
                onChange={(paragraphs) => mutate((d) => { d.tribute.paragraphs = paragraphs; })}
              />
            </div>
            <div>
              <label className={labelCls}>Blockquote</label>
              <QuoteEditor
                quote={content.tribute.quote}
                removable={false}
                onChange={(q) => mutate((d) => { d.tribute.quote = q ?? { text: '' }; })}
              />
              <label className="mt-2 block text-xs text-neutral-500">
                Show quote after paragraph #
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, content.tribute.paragraphs.length)}
                  className="ml-2 w-16 rounded border border-neutral-200 px-2 py-1 text-sm"
                  value={(content.tribute.quoteAfter ?? content.tribute.paragraphs.length - 1) + 1}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (!Number.isNaN(n)) mutate((d) => { d.tribute.quoteAfter = Math.max(0, n - 1); });
                  }}
                />
              </label>
            </div>
          </Section>

          {/* Closing */}
          <Section title="Closing" subtitle="Final lines & signature">
            <Field label="Heading" value={content.closing.heading} onChange={(v) => mutate((d) => { d.closing.heading = v; })} />
            <div>
              <label className={labelCls}>Paragraphs</label>
              <ParagraphListEditor paragraphs={content.closing.paragraphs} onChange={(paragraphs) => mutate((d) => { d.closing.paragraphs = paragraphs; })} />
            </div>
            <AreaField
              label="Signature lines (one per line)"
              value={content.closing.signature.join('\n')}
              rows={3}
              onChange={(v) => mutate((d) => { d.closing.signature = v.split('\n'); })}
            />
            <Field label="Signature title" value={content.closing.signatureTitle} onChange={(v) => mutate((d) => { d.closing.signatureTitle = v; })} />
            <AreaField label="PS note (optional)" value={content.closing.ps ?? ''} rows={2} onChange={(v) => mutate((d) => { d.closing.ps = v || undefined; })} />
          </Section>

          {/* Thank You */}
          <Section title="Thank You note" subtitle="Cream closing section">
            <Field label="Logo image URL" value={content.thankYou.logoUrl} onChange={(v) => mutate((d) => { d.thankYou.logoUrl = v; })} />
            <AreaField label="Heading" value={content.thankYou.heading} rows={2} hint="Use Enter for line breaks" onChange={(v) => mutate((d) => { d.thankYou.heading = v; })} />
            <div>
              <label className={labelCls}>Paragraphs</label>
              <ParagraphListEditor paragraphs={content.thankYou.paragraphs} onChange={(paragraphs) => mutate((d) => { d.thankYou.paragraphs = paragraphs; })} />
            </div>
            <AreaField label="Highlighted box" value={content.thankYou.highlight} rows={4} onChange={(v) => mutate((d) => { d.thankYou.highlight = v; })} />
            <AreaField label="Closing paragraph" value={content.thankYou.closingParagraph} rows={4} onChange={(v) => mutate((d) => { d.thankYou.closingParagraph = v; })} />
            <Field label="Sign-off line" value={content.thankYou.signoff} onChange={(v) => mutate((d) => { d.thankYou.signoff = v; })} />
            <Field label="Sign-off title" value={content.thankYou.signoffTitle} onChange={(v) => mutate((d) => { d.thankYou.signoffTitle = v; })} />
          </Section>
        </div>

        {/* Live preview column (the signature element) */}
        <div className={`${mobileView === 'form' ? 'hidden lg:block' : ''}`}>
          <div className="lg:sticky lg:top-20">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <Eye size={14} /> Live preview
            </div>
            <div
              className="max-h-[72vh] overflow-y-auto rounded-xl border border-neutral-200"
              style={{ backgroundColor: 'rgba(78,46,140,1)' }}
            >
              <ReunionArticle content={content} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {message && (
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}
          {!message && dirty && <span className="text-sm text-neutral-500">Unsaved changes</span>}
          {!message && !dirty && <span className="text-sm text-neutral-400">All changes saved</span>}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              <RotateCcw size={15} /> Reset to original
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4E2E8C] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#3d2370] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
