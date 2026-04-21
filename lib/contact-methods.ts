export const CONTACT_KINDS = ["email", "signal", "discord", "x", "telegram", "forum"] as const;

export type ContactKind = (typeof CONTACT_KINDS)[number];

export const CONTACT_LABEL: Record<ContactKind, string> = {
  email: "Email",
  signal: "Signal",
  discord: "Discord",
  x: "X / Twitter",
  telegram: "Telegram",
  forum: "Zcash Community Forum",
};

export const CONTACT_PLACEHOLDER: Record<ContactKind, string> = {
  email: "you@example.com",
  signal: "@yourhandle or signal username",
  discord: "@yourhandle",
  x: "@yourhandle",
  telegram: "@yourhandle",
  forum: "@username on forum.zcashcommunity.com",
};
