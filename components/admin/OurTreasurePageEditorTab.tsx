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
import OurTreasureArticle from '@/components/treasure/OurTreasureArticle';
import {
  DEFAULT_OUR_TREASURE_CONTENT,
  OUR_TREASURE_SLUG,
  videoEmbedSrc,
  type OurTreasureContent,
  type TreasureVideo,
  type VideoKind,
  type Para,
} from '@/lib/treasure-content';

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-white text-neutral-800 placeholder-neutral-400 border border-neutral-200 focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 focus:outline-none text-sm transition-colors';
const labelCls = 'block text-sm font-semibold text-[#4E2E8C] mb-1.5';
const iconBtnCls =
  'inline-flex items-center justify-center rounded-md border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E2E8C]/40';

/* ──────────────────────────── Field helpers ───────────────────────────────── */

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

/** Minimal paragraph-list editor (text only) for intro / closing copy. */
function ParagraphListEditor({
  paragraphs,
  onChange,
}: {
  paragraphs: Para[];
  onChange: (next: Para[]) => void;
}) {
  const update = (i: number, text: string) =>
    onChange(paragraphs.map((p, idx) => (idx === i ? { ...p, text } : p)));
  const remove = (i: number) => onChange(paragraphs.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= paragraphs.length) return;
    const next = [...paragraphs];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 p-2.5">
          <textarea
            className={`${inputCls} resize-y leading-relaxed`}
            rows={Math.min(8, Math.max(2, Math.ceil((p.text?.length || 0) / 90)))}
            value={p.text}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Paragraph text…"
          />
          <div className="mt-2 flex items-center justify-end gap-1">
            <button type="button" className={iconBtnCls} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
              <ChevronUp size={15} />
            </button>
            <button type="button" className={iconBtnCls} onClick={() => move(i, 1)} disabled={i === paragraphs.length - 1} aria-label="Move down">
              <ChevronDown size={15} />
            </button>
            <button type="button" className={iconBtnCls} onClick={() => remove(i)} aria-label="Delete paragraph">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...paragraphs, { text: '' }])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-[#4E2E8C] hover:bg-[#4E2E8C]/5 transition-colors"
      >
        <Plus size={15} /> Add paragraph
      </button>
    </div>
  );
}

/* ──────────────────────────── Video editor ────────────────────────────────── */

const KIND_LABELS: Record<VideoKind, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  drive: 'Google Drive',
  file: 'Direct video file',
};

const KIND_HINTS: Record<VideoKind, string> = {
  youtube: 'Paste any YouTube link — watch, share (youtu.be), shorts, or embed.',
  vimeo: 'Paste the Vimeo link, e.g. vimeo.com/123456789.',
  drive: 'Paste the Google Drive share link. The file must be shared as “Anyone with the link”.',
  file: 'Paste a direct URL to an .mp4/.webm file (e.g. Supabase storage or a CDN).',
};

function VideoEditor({
  video,
  index,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: {
  video: TreasureVideo;
  index: number;
  onChange: (v: TreasureVideo) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const embed = videoEmbedSrc(video);
  const hasUrl = Boolean(video.url?.trim());

  return (
    <div className="rounded-lg border border-neutral-200 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Video {index + 1}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button type="button" className={iconBtnCls} onClick={() => onMove(-1)} disabled={isFirst} aria-label="Move video up">
            <ChevronUp size={15} />
          </button>
          <button type="button" className={iconBtnCls} onClick={() => onMove(1)} disabled={isLast} aria-label="Move video down">
            <ChevronDown size={15} />
          </button>
          <button type="button" className={iconBtnCls} onClick={onRemove} aria-label="Delete video">
            <Trash2 size={15} />
          </button>
        </span>
      </div>

      <div>
        <label className={labelCls}>Source</label>
        <select
          className={inputCls}
          value={video.kind}
          onChange={(e) => onChange({ ...video, kind: e.target.value as VideoKind })}
        >
          {(Object.keys(KIND_LABELS) as VideoKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Video link</label>
        <input
          className={inputCls}
          value={video.url}
          onChange={(e) => onChange({ ...video, url: e.target.value })}
          placeholder="Paste the link here…"
        />
        <p className="mt-1 text-xs text-neutral-400">{KIND_HINTS[video.kind]}</p>
        {hasUrl && !embed && (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
            <AlertCircle size={13} /> Couldn’t read a video ID from that link — double-check the source type and URL.
          </p>
        )}
      </div>

      <Field label="Title" value={video.title} onChange={(v) => onChange({ ...video, title: v })} placeholder="e.g. Our Treasure — Part One" />
      <div>
        <label className={labelCls}>Caption (optional)</label>
        <textarea
          className={`${inputCls} resize-y`}
          rows={2}
          value={video.caption ?? ''}
          onChange={(e) => onChange({ ...video, caption: e.target.value || undefined })}
          placeholder="A short line shown under the video"
        />
      </div>
    </div>
  );
}

/* ──────────────────────────── Main tab ─────────────────────────────────────── */

export default function OurTreasurePageEditorTab() {
  const [content, setContent] = useState<OurTreasureContent | null>(null);
  const [snapshot, setSnapshot] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/page-content/${OUR_TREASURE_SLUG}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && data.content) {
          setContent(data.content);
          setSnapshot(JSON.stringify(data.content));
        } else {
          setContent(DEFAULT_OUR_TREASURE_CONTENT);
          setSnapshot(JSON.stringify(DEFAULT_OUR_TREASURE_CONTENT));
        }
      } catch {
        setContent(DEFAULT_OUR_TREASURE_CONTENT);
        setSnapshot(JSON.stringify(DEFAULT_OUR_TREASURE_CONTENT));
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
  const mutate = (fn: (draft: OurTreasureContent) => void) =>
    setContent((prev) => {
      if (!prev) return prev;
      const next: OurTreasureContent = structuredClone(prev);
      fn(next);
      return next;
    });

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/page-content/${OUR_TREASURE_SLUG}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSnapshot(JSON.stringify(content));
      setMessage({ type: 'success', text: 'Saved. Your changes are now live on the Our Treasure page.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('Reset all fields to the original content? Unsaved edits will be lost. (You still need to Save to apply.)')) return;
    setContent(structuredClone(DEFAULT_OUR_TREASURE_CONTENT));
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
          <h2 className="text-2xl font-bold tracking-tight text-[#4E2E8C]">Our Treasure Page</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Edit the content and videos of the <span className="font-medium">/our-treasure</span> page. The preview updates as you type.
          </p>
        </div>
        <a
          href="/our-treasure"
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
              placeholder="e.g. Treasure"
            />
            <Field label="Byline" value={content.hero.byline} onChange={(v) => mutate((d) => { d.hero.byline = v; })} />
          </Section>

          {/* Intro */}
          <Section title="Introduction" subtitle={`${content.intro.length} paragraph(s)`}>
            <ParagraphListEditor paragraphs={content.intro} onChange={(intro) => mutate((d) => { d.intro = intro; })} />
          </Section>

          {/* Videos */}
          <Section title="Videos" subtitle={`${content.videos.length} video(s)`} defaultOpen>
            <div className="space-y-3">
              {content.videos.map((video, vi) => (
                <VideoEditor
                  key={vi}
                  video={video}
                  index={vi}
                  isFirst={vi === 0}
                  isLast={vi === content.videos.length - 1}
                  onChange={(v) => mutate((d) => { d.videos[vi] = v; })}
                  onRemove={() => mutate((d) => { d.videos.splice(vi, 1); })}
                  onMove={(dir) =>
                    mutate((d) => {
                      const j = vi + dir;
                      if (j < 0 || j >= d.videos.length) return;
                      [d.videos[vi], d.videos[j]] = [d.videos[j], d.videos[vi]];
                    })
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => mutate((d) => { d.videos.push({ kind: 'youtube', url: '', title: '' }); })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-[#4E2E8C] hover:bg-[#4E2E8C]/5 transition-colors"
              >
                <Plus size={15} /> Add video
              </button>
            </div>
          </Section>

          {/* Closing */}
          <Section title="Closing" subtitle="Final lines & signature">
            <Field label="Heading" value={content.closing.heading} onChange={(v) => mutate((d) => { d.closing.heading = v; })} />
            <div>
              <label className={labelCls}>Paragraphs</label>
              <ParagraphListEditor paragraphs={content.closing.paragraphs} onChange={(paragraphs) => mutate((d) => { d.closing.paragraphs = paragraphs; })} />
            </div>
            <Field
              label="Signature (optional)"
              value={content.closing.signature ?? ''}
              onChange={(v) => mutate((d) => { d.closing.signature = v || undefined; })}
              placeholder="e.g. Kenavo — Always"
            />
          </Section>
        </div>

        {/* Live preview column */}
        <div className={`${mobileView === 'form' ? 'hidden lg:block' : ''}`}>
          <div className="lg:sticky lg:top-20">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <Eye size={14} /> Live preview
            </div>
            <div
              className="max-h-[72vh] overflow-y-auto rounded-xl border border-neutral-200"
              style={{ backgroundColor: 'rgba(78,46,140,1)' }}
            >
              <OurTreasureArticle content={content} />
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
