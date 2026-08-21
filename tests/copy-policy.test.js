import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);

async function filesUnder(relative) {
  const start = fileURLToPath(new URL(relative, root));
  const result = [];
  async function visit(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const full = join(path, entry.name);
      if (entry.isDirectory()) await visit(full);
      else if ([".html", ".js", ".md"].includes(extname(entry.name))) result.push(full);
    }
  }
  await visit(start);
  return result;
}

test("funnel, email, form, and recruitment copy contain no em dashes", async () => {
  const files = [
    ...(await filesUnder("founding-families/")),
    new URL("../lib/email.js", import.meta.url),
    new URL("../FIRST-WAVE-RECRUITMENT.md", import.meta.url),
  ];
  for (const file of files) {
    const content = await readFile(file, "utf8");
    assert.equal(content.includes("\u2014"), false, `Em dash found in ${file}`);
  }
});
