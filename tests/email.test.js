import test from "node:test";
import assert from "node:assert/strict";
import { acceptedEmail } from "../lib/email.js";

test("acceptance email names and formats the feedback deadline clearly", () => {
  process.env.PUBLIC_SITE_URL = "https://preview.example";
  const message = acceptedEmail({
    firstName: "Erik",
    deadline: "2026-08-29",
    token: "test-token",
  });

  assert.match(message.html, /send your feedback by <strong>29 August 2026<\/strong>/);
  assert.match(message.text, /send your feedback by 29 August 2026/);
  assert.match(message.text, /https:\/\/preview\.example\/founding-families\/download\/#token=test-token/);
});

test("preview emails use Vercel's stable branch URL instead of production", () => {
  process.env.PUBLIC_SITE_URL = "https://erikastrand.com";
  process.env.VERCEL_ENV = "preview";
  process.env.VERCEL_BRANCH_URL = "a-nordic-childhood-git-pilot-example.vercel.app";

  const message = acceptedEmail({
    firstName: "Erik",
    deadline: "2026-08-29",
    token: "test-token",
  });

  assert.match(message.text, /https:\/\/a-nordic-childhood-git-pilot-example\.vercel\.app\/founding-families\/download\/#token=test-token/);
  assert.doesNotMatch(message.text, /https:\/\/erikastrand\.com\/founding-families\/download/);

  delete process.env.VERCEL_ENV;
  delete process.env.VERCEL_BRANCH_URL;
});
