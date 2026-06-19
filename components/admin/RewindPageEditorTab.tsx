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
import RewindArticle from '@/components/echoes/RewindArticle';
import {
  DEFAULT_REWIND_CONTENT,
  REWIND_SLUG,
  type RewindContent,
  type Para,
  type Song,
} from '@/lib/rewind-content';

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-white text-neutral-800 placeholder-neutral-400 border border-neutral-200 focus:border-[#4E2E8C] focus:ring-2 focus:ring-[#4E2E8C]/20 focus:outline-none text-sm transition-colors';
const labelCls = 'block text-sm font-semibold text-[#4E2E8C] mb-1.5';
const iconBtnCls =
  'inline-flex items-center justify-center rounded-md border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E2E8C]/40';
const addBtnCls =
  'inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-[#4E2E8C] hover:bg-[#4E2E8C]/5 transition-colors';

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
}: {
  paragraphs: Para[];
  onChange: (next: Para[]) => void;
  allowLead?: boolean;
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
              placeholder="Accent prefix (optional)"
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
      <button type="button" onClick={add} className={addBtnCls}>
        <Plus size={15} /> Add paragraph
      </button>
    </div>
  );
}

/* ──────────────────────────── Song list editor ─────────────────────────────── */

function SongListEditor({ songs, onChange }: { songs: Song[]; onChange: (next: Song[]) => void }) {
  const update = (i: number, patch: Partial<Song>) =>
    onChange(songs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => onChange(songs.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= songs.length) return;
    const next = [...songs];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...songs, { title: '' }]);

  return (
    <div className="space-y-3">
      {songs.map((song, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-7 items-center justify-center rounded bg-[#4E2E8C]/10 text-xs font-bold text-[#4E2E8C]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="truncate text-sm font-medium text-neutral-700">{song.title || 'Untitled track'}</span>
            <span className="ml-auto flex items-center gap-1">
              <button type="button" className={iconBtnCls} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move song up">
                <ChevronUp size={15} />
              </button>
              <button type="button" className={iconBtnCls} onClick={() => move(i, 1)} disabled={i === songs.length - 1} aria-label="Move song down">
                <ChevronDown size={15} />
              </button>
              <button type="button" className={iconBtnCls} onClick={() => remove(i)} aria-label="Delete song">
                <Trash2 size={15} />
              </button>
            </span>
          </div>

          <Field label="Title" value={song.title} onChange={(v) => update(i, { title: v })} placeholder="Song title" />
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Artist" value={song.artist ?? ''} onChange={(v) => update(i, { artist: v || undefined })} placeholder="Artist" />
            <Field label="Year" value={song.year ?? ''} onChange={(v) => update(i, { year: v || undefined })} placeholder="e.g. 1999" />
          </div>
          <Field
            label="Memory note (optional)"
            value={song.note ?? ''}
            onChange={(v) => update(i, { note: v || undefined })}
            placeholder="A line about why this one matters"
          />
          <Field
            label="Listen link (optional)"
            value={song.url ?? ''}
            onChange={(v) => update(i, { url: v || undefined })}
            placeholder="https://open.spotify.com/… or YouTube link"
          />
        </div>
      ))}
      <button type="button" onClick={add} className={addBtnCls}>
        <Plus size={15} /> Add song
      </button>
    </div>
  );
}

/* ──────────────────────────── Main tab ─────────────────────────────────────── */

export default function RewindPageEditorTab() {
  const [content, setContent] = useState<RewindContent | null>(null);
  const [snapshot, setSnapshot] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/page-content/${REWIND_SLUG}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && data.content) {
          setContent(data.content);
          setSnapshot(JSON.stringify(data.content));
        } else {
          setContent(DEFAULT_REWIND_CONTENT);
          setSnapshot(JSON.stringify(DEFAULT_REWIND_CONTENT));
        }
      } catch {
        setContent(DEFAULT_REWIND_CONTENT);
        setSnapshot(JSON.stringify(DEFAULT_REWIND_CONTENT));
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
  const mutate = (fn: (draft: RewindContent) => void) =>
    setContent((prev) => {
      if (!prev) return prev;
      const next: RewindContent = structuredClone(prev);
      fn(next);
      return next;
    });

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/page-content/${REWIND_SLUG}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSnapshot(JSON.stringify(content));
      setMessage({ type: 'success', text: 'Saved. Your changes are now live on the Rewind page.' });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('Reset all fields to the original content? Unsaved edits will be lost. (You still need to Save to apply.)')) return;
    setContent(structuredClone(DEFAULT_REWIND_CONTENT));
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-neutral-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#4E2E8C]">Rewind Page</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Manage the playlist on the{' '}
            <span className="font-medium">Echoes &amp; Memories → Rewind</span> page. The preview updates as you type.
          </p>
        </div>
        <a
          href="/echoes-and-memories/rewind"
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
              placeholder="e.g. Rewind"
            />
            <Field label="Byline" value={content.hero.byline} onChange={(v) => mutate((d) => { d.hero.byline = v; })} />
          </Section>

          {/* Intro */}
          <Section title="Introduction" subtitle={`${content.intro.length} paragraph(s)`}>
            <ParagraphListEditor paragraphs={content.intro} allowLead onChange={(intro) => mutate((d) => { d.intro = intro; })} />
          </Section>

          {/* Playlist */}
          <Section title="Playlist" subtitle={`${content.songs.length} song(s)`} defaultOpen>
            <Field
              label="Section heading"
              value={content.songsHeading}
              onChange={(v) => mutate((d) => { d.songsHeading = v; })}
              placeholder="e.g. The Playlist"
            />
            <div>
              <label className={labelCls}>Embedded player URL (optional)</label>
              <input
                className={inputCls}
                value={content.playlistEmbedUrl ?? ''}
                onChange={(e) => mutate((d) => { d.playlistEmbedUrl = e.target.value || undefined; })}
                placeholder="Spotify/YouTube EMBED url, e.g. https://open.spotify.com/embed/playlist/…"
              />
              <p className="mt-1 text-xs text-neutral-400">
                Paste an <span className="font-medium">embed</span> link (Spotify: Share → Embed playlist). Leave blank to hide the player.
              </p>
            </div>
            <div>
              <label className={labelCls}>Songs</label>
              <SongListEditor songs={content.songs} onChange={(songs) => mutate((d) => { d.songs = songs; })} />
            </div>
          </Section>

          {/* Closing */}
          <Section title="Closing" subtitle="Footer note">
            <Field label="Heading" value={content.closing.heading} onChange={(v) => mutate((d) => { d.closing.heading = v; })} />
            <div>
              <label className={labelCls}>Paragraphs</label>
              <ParagraphListEditor paragraphs={content.closing.paragraphs} onChange={(paragraphs) => mutate((d) => { d.closing.paragraphs = paragraphs; })} />
            </div>
          </Section>
        </div>

        {/* Live preview column */}
        <div className={`${mobileView === 'form' ? 'hidden lg:block' : ''}`}>
          <div className="lg:sticky lg:top-20">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <Eye size={14} /> Live preview
            </div>
            <div
              className="max-h-[72vh] overflow-y-auto rounded-xl border border-neutral-200 shadow-sm"
              style={{ backgroundColor: 'rgba(78,46,140,1)' }}
            >
              <RewindArticle content={content} />
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
