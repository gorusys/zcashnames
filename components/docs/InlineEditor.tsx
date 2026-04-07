"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loadMdx, saveMdx } from "../../lib/docs-editor/actions";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "loaded"; file: string }
  | { kind: "saving" }
  | { kind: "saved"; file: string }
  | { kind: "error"; message: string };

export function InlineEditor({ slug }: { slug: string[] }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [original, setOriginal] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  async function openEditor() {
    setOpen(true);
    setStatus({ kind: "loading" });
    try {
      const { body, file } = await loadMdx(slug);
      setBody(body);
      setOriginal(body);
      setStatus({ kind: "loaded", file });
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  async function save() {
    setStatus({ kind: "saving" });
    try {
      const { file } = await saveMdx(slug, body);
      setOriginal(body);
      setStatus({ kind: "saved", file });
      startTransition(() => router.refresh());
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const dirty = body !== original;

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-orange-500"
        title="Edit this MDX file"
      >
        Edit MDX
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="flex h-full w-full max-w-2xl flex-col border-l border-neutral-300 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Edit MDX
                </div>
                <div className="truncate font-mono text-xs text-neutral-500">
                  {status.kind === "loaded" || status.kind === "saved"
                    ? status.file
                    : `/${slug.join("/")}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {dirty && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">unsaved</span>
                )}
                <button
                  type="button"
                  onClick={save}
                  disabled={!dirty || status.kind === "saving" || status.kind === "loading"}
                  className="rounded bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status.kind === "saving" ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              {status.kind === "loading" ? (
                <div className="p-4 text-sm text-neutral-500">Loading…</div>
              ) : status.kind === "error" ? (
                <div className="p-4 text-sm text-red-600 dark:text-red-400">
                  {status.message}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  spellCheck={false}
                  className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-neutral-900 outline-none dark:text-neutral-100"
                />
              )}
            </div>
            <div className="border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-800">
              {status.kind === "saved" && !dirty
                ? `Saved · ${isPending ? "refreshing…" : "page reloaded"}`
                : "⌘S to save · Esc to close"}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
