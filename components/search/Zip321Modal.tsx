"use client";

import { useState, useEffect, useRef } from "react";
import { type Action, getNetworkConstants } from "@/lib/types";
import { validateAddress, type AddressValidationResult } from "@/lib/zns/name";
import { buildZcashUri } from "@/lib/payment/zip321";
import { generateSessionId, buildZvsMemo } from "@/lib/payment/memo";
import { buildTransaction } from "@/lib/zns/transaction";
import { useStatus } from "@/components/StatusToggle";
import { QRCodeSVG } from "qrcode.react";

/** Parse a price string into a positive number, or null if garbage. */
function parseAmount(raw: string): number | null {
  const n = raw.replace(/,/g, "").trim();
  if (!n) return null;
  const num = Number(n);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export interface ModalTarget {
  name: string;
  action: Action;
  registrationAddress?: string;
  network?: "testnet" | "mainnet";
}

interface Zip321ModalProps {
  target: ModalTarget | null;
  usdPerZec: number | null;
  onClose: () => void;
}

const ACTION_DISPLAY: Record<Action, string> = {
  claim: "Claim",
  buy: "Buy",
  update: "Update",
  list: "List for Sale",
  delist: "Delist",
};

function getAddressFieldState(
  hasValue: boolean,
  validation: AddressValidationResult,
) {
  if (!hasValue)
    return { hint: "Enter your Unified address (u1...).", hintColor: "text-fg-dim", borderColor: "border-border-light" };
  if (validation.rejected)
    return { hint: validation.warning, hintColor: "text-red-500", borderColor: "border-red-400" };
  if (validation.valid && validation.warning)
    return { hint: validation.warning, hintColor: "text-yellow-600", borderColor: "border-yellow-400" };
  if (validation.valid)
    return { hint: "Looks good \u2014 valid Unified address.", hintColor: "text-green-600", borderColor: "border-green-400" };
  return { hint: "Invalid address format.", hintColor: "text-red-500", borderColor: "border-red-400" };
}

export default function Zip321Modal({
  target,
  usdPerZec,
  onClose,
}: Zip321ModalProps) {
  const { networkPassword } = useStatus();
  const { ZIP321_RECIPIENT_ADDRESS, OTP_SIGNIN_ADDR, OTP_AMOUNT, OTP_MAX_ATTEMPTS } = getNetworkConstants(target?.network ?? "testnet");
  const [phase, setPhase] = useState<"input" | "otp" | "payment">("input");
  const [userAddress, setUserAddress] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");
  const [signedMemo, setSignedMemo] = useState("");
  const [signedAmountZec, setSignedAmountZec] = useState(0);

  // OTP state
  const [otpMemo, setOtpMemo] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  const addressRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const action = target?.action ?? "claim";
  const actionLabel = ACTION_DISPLAY[action];
  const needsAddress = action === "claim" || action === "buy" || action === "update";
  const needsPrice = action === "list";
  const needsOtp = action === "update" || action === "list" || action === "delist";
  const displayName = target ? `${target.name}.zcash` : "";

  // Reset state when modal opens
  useEffect(() => {
    if (target) {
      setUserAddress("");
      setCustomAmount("");
      setPhase("input");
      setSigning(false);
      setSignError("");
      setSignedMemo("");
      setSignedAmountZec(0);
      setOtpMemo("");
      setOtpCode("");
      setOtpError("");
      setOtpAttempts(0);
      setOtpVerifying(false);
      setCopied(false);

      if (needsAddress) {
        addressRef.current?.focus();
      } else if (needsPrice) {
        amountRef.current?.focus();
      }
    }
  }, [target, needsAddress, needsPrice]);

  // Escape key
  useEffect(() => {
    if (!target) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [target, onClose]);

  if (!target) return null;

  const addrTrimmed = userAddress.trim();
  const addrValidation = needsAddress && addrTrimmed
    ? validateAddress(addrTrimmed)
    : { valid: false, warning: "", rejected: false };
  const hasAddrValue = needsAddress && addrTrimmed.length > 0;

  const parsedAmount = needsPrice ? parseAmount(customAmount) : null;

  const addrField = getAddressFieldState(hasAddrValue, addrValidation);

  const currentUri = phase === "otp"
    ? buildZcashUri(OTP_SIGNIN_ADDR, OTP_AMOUNT, otpMemo)
    : buildZcashUri(ZIP321_RECIPIENT_ADDRESS, String(signedAmountZec), signedMemo);


  async function handleContinue() {
    if (signing) return;

    if (needsAddress && !addrValidation.valid) {
      addressRef.current?.focus();
      return;
    }
    if (needsPrice && parsedAmount === null) {
      amountRef.current?.focus();
      return;
    }

    setSigning(true);
    setSignError("");

    try {
      if (!needsOtp) {
        // Claim / Buy — sign directly, no OTP
        const result = await buildTransaction({
          name: target!.name,
          action,
          address: addrTrimmed,
          network: target!.network,
          password: networkPassword,
        });
        if (!result.ok) throw new Error(result.error || "Transaction failed.");
        setSignedMemo(result.memo!);
        setSignedAmountZec(result.amountZec!);
        setPhase("payment");
      } else {
        // Update / List / Delist — use address from target
        const regAddress = target!.registrationAddress;
        if (!regAddress) throw new Error("Could not find the registered address for this name.");

        const sid = generateSessionId();
        const memo = buildZvsMemo(sid, regAddress);
        setOtpMemo(memo);
        setPhase("otp");
      }
    } catch (err) {
      setSignError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSigning(false);
    }
  }

  async function handleVerifyOtp() {
    if (otpVerifying) return;
    if (otpCode.length !== 6) {
      setOtpError("Enter the 6-digit code from your wallet.");
      return;
    }
    if (otpAttempts >= OTP_MAX_ATTEMPTS) {
      setOtpError("Too many attempts. Start over.");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");

    try {
      const result = await buildTransaction({
        name: target!.name,
        action,
        address: needsAddress ? addrTrimmed : undefined,
        priceZats: needsPrice && parsedAmount !== null
          ? Math.round(parsedAmount * 100_000_000)
          : undefined,
        network: target!.network,
        password: networkPassword,
        memo: otpMemo,
        otp: otpCode,
      });

      if (!result.ok) {
        setOtpAttempts((a) => a + 1);
        setOtpError(result.error || "Invalid code.");
        return;
      }

      setSignedMemo(result.memo!);
      setSignedAmountZec(result.amountZec!);
      setPhase("payment");
    } catch (err) {
      setOtpAttempts((a) => a + 1);
      setOtpError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setOtpVerifying(false);
    }
  }

  function handleStartOver() {
    const sid = generateSessionId();
    const memo = buildZvsMemo(sid, target!.registrationAddress!);
    setOtpMemo(memo);
    setOtpCode("");
    setOtpError("");
    setOtpAttempts(0);
  }

  async function handleCopyUri() {
    const text = currentUri.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard API failed — user can copy from the code block.
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-[min(520px,100%)] rounded-2xl border border-border-muted bg-card shadow-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`${actionLabel} ${displayName}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-bold text-fg-heading">
            {actionLabel} {displayName}
          </h2>
          <button
            type="button"
            className="text-sm font-semibold text-fg-muted hover:text-fg-heading cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Phase 1: Input */}
          {phase === "input" && (
            <>
              {needsAddress && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="zip321-address-input"
                    className="text-sm font-semibold text-fg-body"
                  >
                    {action === "update"
                      ? "New Unified Address"
                      : "Your Unified Address"}
                  </label>
                  <input
                    ref={addressRef}
                    id="zip321-address-input"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="u1..."
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${addrField.borderColor}`}
                  />
                  <p className={`text-xs ${addrField.hintColor}`}>
                    {addrField.hint}
                  </p>
                </div>
              )}

              {needsPrice && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="zip321-custom-amount"
                    className="text-sm font-semibold text-fg-body"
                  >
                    Sale Price (ZEC)
                  </label>
                  <input
                    ref={amountRef}
                    id="zip321-custom-amount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.001"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none ${
                      customAmount.trim() && parsedAmount === null
                        ? "border-red-400"
                        : "border-border-light"
                    }`}
                  />
                  {customAmount.trim() && parsedAmount === null && (
                    <p className="text-xs text-red-500">
                      Enter a valid number.
                    </p>
                  )}
                </div>
              )}

              {action === "delist" && (
                <p className="text-sm text-fg-muted">
                  Remove <strong>{displayName}</strong> from the marketplace? This
                  will send a delist transaction (0.001 ZEC network fee).
                </p>
              )}

              {signError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                  {signError}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 border border-border-light rounded-lg px-4 py-2.5 text-sm font-semibold text-fg-body bg-surface cursor-pointer hover:bg-raised"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 border-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-fg-heading cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleContinue}
                  disabled={signing}
                >
                  {signing
                    ? "Working..."
                    : needsOtp
                      ? "Continue"
                      : "Generate Payment"}
                </button>
              </div>
            </>
          )}

          {/* Phase 2: OTP Verification */}
          {phase === "otp" && (
            <>
              <p className="text-sm text-fg-muted">
                Scan this QR code with your wallet to receive a 6-digit verification
                code. Send <strong>{OTP_AMOUNT} ZEC</strong> to prove you own this name.
              </p>

              <QRCodeSVG value={currentUri} size={200} role="img" aria-label="OTP verification QR code" className="mx-auto rounded-lg" />

              <code className="block w-full break-all text-xs bg-surface border border-border-light rounded-lg px-3 py-2 text-fg-body">
                {currentUri}
              </code>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="zip321-otp-input"
                  className="text-sm font-semibold text-fg-body"
                >
                  Enter 6-digit code from your wallet
                </label>
                <input
                  id="zip321-otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-blue"
                />
                {otpAttempts > 0 && (
                  <p className="text-xs text-fg-dim">
                    Attempts: {otpAttempts}/{OTP_MAX_ATTEMPTS}
                  </p>
                )}
              </div>

              {otpError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                  {otpError}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 border border-border-light rounded-lg px-4 py-2.5 text-sm font-semibold text-fg-body bg-surface cursor-pointer hover:bg-raised"
                  onClick={handleStartOver}
                >
                  Start Over
                </button>
                <button
                  type="button"
                  className="flex-1 border-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-fg-heading cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleVerifyOtp}
                  disabled={otpVerifying || otpAttempts >= OTP_MAX_ATTEMPTS}
                >
                  {otpVerifying ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </>
          )}

          {/* Phase 3: Payment */}
          {phase === "payment" && (
            <>
              <p className="text-sm text-fg-muted">
                Scan the QR code or copy the URI into your Zcash wallet to complete
                the transaction.
              </p>

              <QRCodeSVG value={currentUri} size={200} role="img" aria-label="ZIP321 QR code" className="mx-auto rounded-lg" />

              <code className="block w-full break-all text-xs bg-surface border border-border-light rounded-lg px-3 py-2 text-fg-body">
                {currentUri}
              </code>

              <p className="text-sm text-fg-body text-center font-semibold">
                Amount: {signedAmountZec} ZEC
                {signedAmountZec > 0 && usdPerZec != null && (
                  <span className="text-fg-dim font-normal ml-2">
                    {`($${(signedAmountZec * usdPerZec).toFixed(2)} USD)`}
                  </span>
                )}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 border border-border-light rounded-lg px-4 py-2.5 text-sm font-semibold text-fg-body bg-surface cursor-pointer hover:bg-raised"
                  onClick={handleCopyUri}
                >
                  {copied ? "Copied!" : "Copy URI"}
                </button>
                <button
                  type="button"
                  className="flex-1 border-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-fg-heading cursor-pointer hover:opacity-90"
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
