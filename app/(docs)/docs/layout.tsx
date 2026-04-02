import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: "ZcashNames Docs",
  description: "Documentation for the Zcash Name Service",
};

const navbar = (
  <Navbar
    logo={<b>ZcashNames Docs</b>}
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
