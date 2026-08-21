const ALLOWED = {
  ageBand: new Set(["4_or_younger", "5", "6", "7_or_older"]),
  learningStage: new Set(["emerging", "beginning", "confident", "unsure"]),
};

export function validateApplication(input) {
  const errors = {};
  if (!input.adultFirstName) errors.adultFirstName = "Please add your first name.";
  if (!input.adultEmail) errors.adultEmail = "Please add a valid email address.";
  if (!ALLOWED.ageBand.has(input.childAgeBand)) errors.childAgeBand = "Choose an age band.";
  if (!ALLOWED.learningStage.has(input.learningStage)) errors.learningStage = "Choose the closest description.";
  if (!input.participationConfirmed) errors.participationConfirmed = "Confirm that the pilot timing and practical requirements work for you.";
  if (!input.privacyConfirmed) errors.privacyConfirmed = "Confirm that you have read the privacy note.";
  return errors;
}

export function assessEligibility(input) {
  if (input.learningStage === "beginning") return { qualified: false, reason: "likely_too_early" };
  if (input.learningStage === "confident") return { qualified: false, reason: "likely_too_advanced" };
  if (input.learningStage === "unsure") return { qualified: true, reason: "manual_unsure" };
  return { qualified: true, reason: "clear_fit" };
}
