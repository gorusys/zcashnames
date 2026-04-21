import type { Metadata } from "next";
import Link from "next/link";
import BetaApplicationForm from "@/components/closedbeta/BetaApplicationForm";

export const metadata: Metadata = {
  title: "Apply to the Closed Beta — ZcashNames",
  description: "Apply for a spot in the ZcashNames closed beta.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function BetaApplyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-6 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-3"
          style={{
            background: "var(--color-accent-green-light)",
            color: "var(--color-accent-green)",
          }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" /> Closed Beta
        </span>
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight"
          style={{ color: "var(--fg-heading)", marginBottom: "0.75rem" }}
        >
          No longer accepting applications
        </h1>
        <p
          className="text-base"
          style={{ color: "var(--fg-body)", lineHeight: 1.65 }}
        >
          The closed beta application window is currently closed. If you already
          submitted, we&rsquo;ll follow up using your preferred contact method if
          a spot opens or we need more information.
        </p>
        <p
          className="text-sm mt-3"
          style={{ color: "var(--fg-muted)" }}
        >
          Already invited?{" "}
          <Link
            href="/closedbeta"
            className="underline"
            style={{ color: "var(--fg-body)" }}
          >
            Read the brief
          </Link>
          .
        </p>
      </header>

      <section
        className="mb-8 rounded-2xl border px-5 py-4 text-left"
        style={{
          background: "var(--color-raised)",
          borderColor: "var(--border-muted)",
        }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--fg-heading)" }}
        >
          Applications are closed.
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--fg-body)", lineHeight: 1.65 }}>
          The original form remains below for reference only. New submissions are
          not being actively accepted at this time.
        </p>
      </section>

      <BetaApplicationForm />
    </div>
  );
}
