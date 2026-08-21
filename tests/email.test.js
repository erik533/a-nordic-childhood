import test from "node:test";
import assert from "node:assert/strict";
import { acceptedEmail, feedbackCompleteEmail, noUseEmail, reminderEmail } from "../lib/email.js";

test("acceptance email names the deadline and links to the personal page", () => {
  process.env.PUBLIC_SITE_URL = "https://preview.example";
  const message = acceptedEmail({ firstName: "Erik", deadline: "2026-08-29", token: "test-token" });
  assert.match(message.html, /August 29, 2026/);
  assert.match(message.text, /https:\/\/preview\.example\/founding-families\/download\/#token=test-token/);
  assert.match(message.html, /first-numbers-restrained\.png/);
});

test("preview emails use the stable Vercel branch URL", () => {
  process.env.PUBLIC_SITE_URL = "https://erikastrand.com";
  process.env.VERCEL_ENV = "preview";
  process.env.VERCEL_BRANCH_URL = "a-nordic-childhood-git-pilot-example.vercel.app";
  const message = acceptedEmail({ firstName: "Erik", deadline: "2026-08-29", token: "test-token" });
  assert.match(message.text, /a-nordic-childhood-git-pilot-example\.vercel\.app/);
  assert.doesNotMatch(message.text, /erikastrand\.com\/founding-families\/download/);
  delete process.env.VERCEL_ENV;
  delete process.env.VERCEL_BRANCH_URL;
});

test("day 3 message changes according to download state", () => {
  process.env.PUBLIC_SITE_URL = "https://preview.example";
  const participant = { adult_first_name: "Erik", personal_deadline: "2026-08-29", downloaded_at: null };
  assert.match(reminderEmail("day3", participant, "token").subject, /download/i);
  assert.match(reminderEmail("day3", { ...participant, downloaded_at: "2026-08-23T10:00:00Z" }, "token").subject, /activity/i);
});

test("feedback messages distinguish reward confirmation from no use", () => {
  assert.match(feedbackCompleteEmail({ firstName: "Erik" }).text, /free copy.*confirmed/i);
  assert.match(noUseEmail({ firstName: "Erik", token: "token" }).text, /confirmed after one real activity attempt/i);
});
