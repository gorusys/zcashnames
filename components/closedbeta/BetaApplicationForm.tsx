"use client";

import { useState, useTransition } from "react";
import { submitBetaApplication } from "@/lib/beta/actions";
import {
  CONTACT_KINDS,
  CONTACT_LABEL,
  CONTACT_PLACEHOLDER,
  type ContactKind,
} from "@/lib/contact-methods";

interface ContactRow {
  uid: string; // stable react key, distinct from kind so user can change kind
  kind: ContactKind;
  value: string;
}

function nextUnusedKind(rows: ContactRow[]): ContactKind | null {
  return CONTACT_KINDS.find((k) => !rows.some((r) => r.kind === k)) ?? null;
}

const inputStyle: React.CSSProperties = {
  background: "var(--color-raised)",
  border: "1.5px solid var(--faq-border)",
  color: "var(--fg-heading)",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  paddingRight: "2rem",
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='gray' stroke-width='2'><polyline points='3 5 6 8 9 5'/></svg>\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.6rem center",
  backgroundSize: "0.8rem",
};

const labelStyle: React.CSSProperties = {
  color: "var(--fg-muted)",
  fontSize: "0.72rem",
  fontWeight: 600,
  marginBottom: "0.35rem",
  display: "block",
};

const primaryBtnStyle: React.CSSProperties = {
  background: "var(--home-result-primary-bg)",
  color: "var(--home-result-primary-fg)",
  boxShadow: "var(--home-result-primary-shadow)",
};

type FocusArea = "user" | "sdk";

export default function BetaApplicationForm() {
  const [displayName, setDisplayName] = useState("");
  const [why, setWhy] = useState("");
  const [focusUser, setFocusUser] = useState(false);
  const [focusSdk, setFocusSdk] = useState(false);
  const [experience, setExperience] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [contacts, setContacts] = useState<ContactRow[]>(() => [
    { uid: "c0", kind: "email", value: "" },
  ]);
  const [bestContactUid, setBestContactUid] = useState<string>("c0");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const canAddMore = contacts.length < CONTACT_KINDS.length;

  function addContact() {
    const kind = nextUnusedKind(contacts);
    if (!kind) return;
    const uid = `c${Date.now()}`;
    setContacts((prev) => [...prev, { uid, kind, value: "" }]);
  }

  function removeContact(uid: string) {
    setContacts((prev) => {
      const next = prev.filter((c) => c.uid !== uid);
      // If we removed the best one, fall back to the first remaining row.
      if (uid === bestContactUid && next.length > 0) {
        setBestContactUid(next[0].uid);
      }
      return next;
    });
  }

  function updateContact(uid: string, patch: Partial<Pick<ContactRow, "kind" | "value">>) {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.uid !== uid) return c;
        // If switching kind to one that's already used, swap kinds.
        if (patch.kind && patch.kind !== c.kind) {
          const collision = prev.find((other) => other.uid !== uid && other.kind === patch.kind);
          if (collision) {
            // Swap: this row takes the new kind, the collision row takes our old kind.
            // Done in two passes — return only the patched row here, the swap below.
            return { ...c, ...patch };
          }
        }
        return { ...c, ...patch };
      }),
    );
    // Second pass: if there was a collision swap, the other row needs its kind updated.
    if (patch.kind) {
      setContacts((prev) => {
        const target = prev.find((c) => c.uid === uid);
        const collisions = prev.filter((c) => c.uid !== uid && c.kind === patch.kind);
        if (collisions.length <= 1 || !target) return prev;
        // Take the first non-self row with the target kind and give it our old kind.
        const other = collisions.find((c) => c.uid !== uid)!;
        const oldKind = CONTACT_KINDS.find(
          (k) => k !== patch.kind && !prev.some((row) => row.uid !== other.uid && row.kind === k),
        );
        if (!oldKind) return prev;
        return prev.map((c) => (c.uid === other.uid ? { ...c, kind: oldKind } : c));
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    const filled = contacts.filter((c) => c.value.trim().length > 0);
    if (filled.length === 0) {
      setError("Add at least one contact method.");
      return;
    }
    if (!focusUser && !focusSdk) {
      setError("Pick at least one thing you want to test.");
      return;
    }
    const best = filled.find((c) => c.uid === bestContactUid) ?? filled[0];

    const focus: FocusArea[] = [];
    if (focusUser) focus.push("user");
    if (focusSdk) focus.push("sdk");

    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("display_name", displayName);
      formData.set("why", why);
      formData.set("focus_areas", focus.join(","));
      formData.set("experience", experience);
      formData.set("referral_source", referralSource);
      // Send one column per kind
      for (const kind of CONTACT_KINDS) {
        const row = filled.find((c) => c.kind === kind);
        formData.set(`contact_${kind}`, row?.value.trim() ?? "");
      }
      formData.set("best_contact_kind", best.kind);

      try {
        const result = await submitBetaApplication(formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSuccess(true);
      } catch {
        setError("Something went wrong. Try again.");
      }
    });
  }

  if (success) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center text-center gap-4"
        style={{
          background: "var(--feature-card-bg)",
          border: "1px solid var(--faq-border)",
        }}
      >
        <span
          className="flex items-center justify-center w-14 h-14 rounded-full"
          style={{
            background: "var(--color-accent-green-light)",
            color: "var(--color-accent-green)",
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="text-xl font-bold" style={{ color: "var(--fg-heading)" }}>
          Application received
        </h2>
        <p className="text-sm" style={{ color: "var(--fg-body)", lineHeight: 1.7 }}>
          Thanks for applying. If there&rsquo;s a spot for you, we&rsquo;ll reach
          out via your preferred contact with an invite code and the next steps.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 md:p-8 flex flex-col gap-5"
      style={{
        background: "var(--feature-card-bg)",
        border: "1px solid var(--faq-border)",
      }}
    >
      {/* Display name */}
      <div>
        <label style={labelStyle}>Display name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="What should we call you?"
          maxLength={60}
          required
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
      </div>

      {/* Contacts */}
      <div>
        <label style={labelStyle}>How to reach you</label>
        <p className="text-xs mb-2" style={{ color: "var(--fg-muted)", lineHeight: 1.5 }}>
          Add one or more contact methods. Mark which one you&rsquo;d prefer we use.
        </p>
        <div className="flex flex-col gap-2">
          {contacts.map((c) => {
            const isBest = c.uid === bestContactUid;
            return (
              <div key={c.uid} className="flex items-center gap-2">
                {contacts.length > 1 && (
                  <label
                    className="flex items-center justify-center shrink-0 cursor-pointer"
                    title={isBest ? "Preferred contact" : "Mark as preferred"}
                    style={{ width: 24 }}
                  >
                    <input
                      type="radio"
                      name="best_contact"
                      checked={isBest}
                      onChange={() => setBestContactUid(c.uid)}
                      className="sr-only"
                    />
                    <span
                      className="block rounded-full transition-all"
                      style={{
                        width: 14,
                        height: 14,
                        border: `2px solid ${isBest ? "var(--color-accent-green)" : "var(--border-muted)"}`,
                        background: isBest ? "var(--color-accent-green)" : "transparent",
                        boxShadow: isBest ? "inset 0 0 0 2px var(--color-raised)" : "none",
                      }}
                    />
                  </label>
                )}
                <select
                  value={c.kind}
                  onChange={(e) => updateContact(c.uid, { kind: e.target.value as ContactKind })}
                  className="rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer"
                  style={{ ...selectStyle, minWidth: 130 }}
                >
                  {CONTACT_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {CONTACT_LABEL[k]}
                    </option>
                  ))}
                </select>
                <input
                  type={c.kind === "email" ? "email" : "text"}
                  value={c.value}
                  onChange={(e) => updateContact(c.uid, { value: e.target.value })}
                  placeholder={CONTACT_PLACEHOLDER[c.kind]}
                  maxLength={200}
                  className="flex-1 min-w-0 rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={inputStyle}
                />
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(c.uid)}
                    aria-label="Remove this contact"
                    className="shrink-0 text-2xl leading-none opacity-60 hover:opacity-100 cursor-pointer px-1"
                    style={{ color: "var(--fg-body)" }}
                  >
                    &times;
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {canAddMore && (
          <button
            type="button"
            onClick={addContact}
            className="mt-2 text-xs font-semibold underline cursor-pointer"
            style={{ color: "var(--fg-body)" }}
          >
            + Add another contact method
          </button>
        )}
      </div>

      {/* Why */}
      <div>
        <label style={labelStyle}>
          Why do you want to join? <span style={{ color: "var(--accent-red, #e05252)" }}>*</span>
        </label>
        <textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          rows={4}
          minLength={20}
          maxLength={2000}
          required
          placeholder="What do you hope to test or contribute? Help us understand who you are and why ZcashNames matters to you."
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-y"
          style={inputStyle}
        />
        <p className="text-xs mt-1" style={{ color: "var(--fg-muted)" }}>
          {why.length} / 2000
        </p>
      </div>

      {/* What do you want to test */}
      <div>
        <label style={labelStyle}>
          What do you want to test? <span style={{ color: "var(--accent-red, #e05252)" }}>*</span>
        </label>
        <p className="text-xs mb-2" style={{ color: "var(--fg-muted)", lineHeight: 1.55 }}>
          Pick one or both.
        </p>
        <div className="flex flex-col gap-2">
          <label
            className="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors"
            style={{
              background: focusUser ? "var(--color-raised)" : "transparent",
              border: `1.5px solid ${focusUser ? "var(--color-accent-green)" : "var(--faq-border)"}`,
            }}
          >
            <span
              className="relative flex items-center justify-center shrink-0 rounded mt-0.5"
              style={{
                width: 18,
                height: 18,
                background: focusUser ? "var(--color-accent-green)" : "var(--color-surface)",
                border: `1.5px solid ${focusUser ? "var(--color-accent-green)" : "var(--border-muted)"}`,
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <input
                type="checkbox"
                checked={focusUser}
                onChange={(e) => setFocusUser(e.target.checked)}
                className="absolute inset-0 opacity-0 cursor-pointer m-0"
              />
              {focusUser && (
                <svg viewBox="0 0 10 8" width="10" height="8" fill="none" stroke="var(--color-background, #1a1a1a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 4l2.5 2.5L9 1" />
                </svg>
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug" style={{ color: "var(--fg-heading)" }}>
                User flow
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)", lineHeight: 1.55 }}>
                Claiming names, listing them for sale, buying, transferring &mdash; the wallet-side experience.
              </p>
            </div>
          </label>

          <label
            className="flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors"
            style={{
              background: focusSdk ? "var(--color-raised)" : "transparent",
              border: `1.5px solid ${focusSdk ? "var(--color-accent-green)" : "var(--faq-border)"}`,
            }}
          >
            <span
              className="relative flex items-center justify-center shrink-0 rounded mt-0.5"
              style={{
                width: 18,
                height: 18,
                background: focusSdk ? "var(--color-accent-green)" : "var(--color-surface)",
                border: `1.5px solid ${focusSdk ? "var(--color-accent-green)" : "var(--border-muted)"}`,
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <input
                type="checkbox"
                checked={focusSdk}
                onChange={(e) => setFocusSdk(e.target.checked)}
                className="absolute inset-0 opacity-0 cursor-pointer m-0"
              />
              {focusSdk && (
                <svg viewBox="0 0 10 8" width="10" height="8" fill="none" stroke="var(--color-background, #1a1a1a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 4l2.5 2.5L9 1" />
                </svg>
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug" style={{ color: "var(--fg-heading)" }}>
                Software development kit
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)", lineHeight: 1.55 }}>
                Resolving names and verifying identities programmatically via the SDK / JSON-RPC.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Experience */}
      <div>
        <label style={labelStyle}>Zcash / development experience</label>
        <textarea
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="A sentence or two about your background"
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-y"
          style={inputStyle}
        />
      </div>

      {/* Referral source */}
      <div>
        <label style={labelStyle}>Where did you hear about this?</label>
        <input
          type="text"
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
          maxLength={2000}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={inputStyle}
        />
      </div>

      {error && (
        <p className="text-sm font-semibold" style={{ color: "var(--accent-red, #e05252)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={primaryBtnStyle}
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>

      <p className="text-xs text-center" style={{ color: "var(--fg-muted)", lineHeight: 1.6 }}>
        We&rsquo;ll only contact you if there&rsquo;s a spot. No spam, ever.
      </p>
    </form>
  );
}
