import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import "../docs.css";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: "ZcashNames Docs",
  description: "Documentation for the Zcash Name Service",
  icons: { icon: "/landing/z5.png" },
};

const navbar = (
  <Navbar
    logo={
      <span className="docs-navbar-logo" aria-label="ZcashNames Docs">
        <img
          src="/landing/zcashnames-primary-logo-black-transparent.png"
          alt=""
          width={28}
          height={30}
          className="docs-navbar-logo-mark"
        />
        <b>ZcashNames Docs</b>
      </span>
    }
    projectLink="https://github.com/zcashme/zcashnames"
  />
);

const footer = (
  <Footer>MIT {new Date().getFullYear()} © ZcashMe</Footer>
);

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout
      navbar={navbar}
      pageMap={await getPageMap("/docs")}
      docsRepositoryBase="https://github.com/zcashme/zcashnames/tree/main/content/docs"
      footer={footer}
    >
      {children}
    </Layout>
  );
}
