import { Head } from "nextra/components";
import { Manrope } from "next/font/google";

const uiSans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

export default function DocsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body className={uiSans.variable}>{children}</body>
    </html>
  );
}
