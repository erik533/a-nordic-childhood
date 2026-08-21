import test from "node:test";
import assert from "node:assert/strict";
import { cleanEmail, cleanText, createParticipantToken, hashToken } from "../lib/security.js";

test("participant tokens are random-looking and only their hash is used for lookup", () => {
  const first = createParticipantToken();
  const second = createParticipantToken();
  assert.ok(first.length >= 32);
  assert.notEqual(first, second);
  assert.match(hashToken(first), /^[a-f0-9]{64}$/);
  assert.notEqual(hashToken(first), first);
});

test("contact and free-text values are normalised and bounded", () => {
  assert.equal(cleanEmail("  ERIK@Example.COM "), "erik@example.com");
  assert.equal(cleanText("  hello\u0000   world  ", 20), "hello world");
  assert.equal(cleanText("abcdef", 3), "abc");
});
