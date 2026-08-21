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
