import test from "node:test";
import assert from "node:assert/strict";
import { attributionFromInput, cleanUtm, referrerCategory } from "../lib/attribution.js";

test("keeps only standard cleaned UTM values", () => {
  assert.equal(cleanUtm("facebook<script>"), "facebookscript");
  assert.deepEqual(attributionFromInput({ utmSource: "instagram", utmMedium: "organic_social", utmCampaign: "wave1", referrer: "https://example.com/path?q=private" }), {
    source: "instagram", utmSource: "instagram", utmMedium: "organic_social", utmCampaign: "wave1",
  });
});

test("reduces referrers to a category without paths", () => {
  assert.equal(referrerCategory("https://facebook.com/groups/example/post/123"), "facebook.com");
  assert.equal(referrerCategory("https://erikastrand.com/page", "https://erikastrand.com"), "internal");
});
