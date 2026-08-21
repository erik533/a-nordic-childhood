import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sql = await readFile(new URL("../supabase/migrations/002_founding_families_revision.sql", import.meta.url), "utf8");

test("migration stages the pilot at five and twenty places", () => {
  assert.match(sql, /first_wave_cap integer not null default 5/);
  assert.match(sql, /cohort_cap integer not null default 20/);
  assert.match(sql, /'first_wave', 'paused', 'second_wave', 'closed'/);
});

test("application and admin decisions share a transaction lock", () => {
  const locks = sql.match(/pg_advisory_xact_lock\(hashtext\('first-numbers-founding-families-v2'\)\)/g) || [];
  assert.equal(locks.length, 2);
  assert.match(sql, /where lower\(p\.adult_email\) = lower\(p_adult_email\)/);
  assert.match(sql, /if v_status = 'accepted'/);
});

test("first wave is manual and the fifth acceptance pauses recruitment", () => {
  assert.match(sql, /elsif v_phase = 'first_wave'/);
  assert.match(sql, /v_status := 'pending_review'/);
  assert.match(sql, /set phase = 'paused'/);
  assert.match(sql, /if v_count >= v_limit then\s+raise exception 'cohort_full'/);
});

test("second wave separates clear fit, unsure, and mismatch paths", () => {
  assert.match(sql, /p_learning_stage in \('beginning', 'confident'\)/);
  assert.match(sql, /p_learning_stage = 'unsure'/);
  assert.match(sql, /v_status := 'accepted'/);
});
