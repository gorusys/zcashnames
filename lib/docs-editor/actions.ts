"use server";

import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content");

function assertDev() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("docs editor is dev-only");
  }
}

function resolveMdxPath(slug: string[]): string {
  for (const segment of slug) {
    if (segment.includes("/") || segment.includes("\\") || segment === ".." || segment === ".") {
      throw new Error(`invalid slug segment: ${segment}`);
    }
  }
  const base = path.resolve(CONTENT_DIR, ...slug);
  if (base !== CONTENT_DIR && !base.startsWith(CONTENT_DIR + path.sep)) {
    throw new Error("path escapes content dir");
  }
  return base;
}

async function findMdxFile(slug: string[]): Promise<string> {
  const base = resolveMdxPath(slug);
  const candidates = [`${base}.mdx`, path.join(base, "index.mdx")];
  for (const c of candidates) {
    try {
      const stat = await fs.stat(c);
      if (stat.isFile()) return c;
    } catch {}
  }
  throw new Error(`no mdx file for slug: /${slug.join("/")}`);
}

export async function loadMdx(slug: string[]): Promise<{ body: string; file: string }> {
  assertDev();
  const file = await findMdxFile(slug);
  const body = await fs.readFile(file, "utf8");
  return { body, file: path.relative(process.cwd(), file) };
}

export async function saveMdx(slug: string[], body: string): Promise<{ file: string }> {
  assertDev();
  const file = await findMdxFile(slug);
  await fs.writeFile(file, body, "utf8");
  return { file: path.relative(process.cwd(), file) };
}
