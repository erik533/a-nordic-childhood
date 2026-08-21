import test from "node:test";
import assert from "node:assert/strict";
import { adminAuthorized } from "../lib/admin.js";

test("admin authorization requires the exact server-side secret", () => {
  const req = (value) => ({ headers: { authorization: `Bearer ${value}` } });
  assert.equal(adminAuthorized(req("correct horse"), "correct horse"), true);
  assert.equal(adminAuthorized(req("wrong horse"), "correct horse"), false);
  assert.equal(adminAuthorized(req("short"), "correct horse"), false);
  assert.equal(adminAuthorized({ headers: {} }, "correct horse"), false);
});
