import type { Metadata } from "next";
import FeedbackPanelBody from "@/components/closedbeta/FeedbackPanelBody";
import { getCurrentTesterFocus, getCurrentTesterName } from "@/lib/beta/actions";
import { readCurrentStage } from "@/lib/beta/gate";

export const metadata: Metadata = {
  title: "Submit Feedback — ZcashNames Beta",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function FeedbackPopoutPage() {
  const [testerName, stage, focus] = await Promise.all([
    getCurrentTesterName(),
    readCurrentStage(),
    getCurrentTesterFocus(),
  ]);
  const activeStage = stage ?? "testnet";

  return (
    <main className="fixed inset-0">
      <FeedbackPanelBody
        mode="popout"
        stage={activeStage}
        initialTesterName={testerName}
        initialFocus={focus}
      />
    </main>
  );
}
