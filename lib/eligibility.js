const ALLOWED = {
  ageBand: new Set(["4_or_younger", "5", "6", "7_or_older"]),
  ability: new Set(["usually", "sometimes", "not_yet"]),
  countAloud: new Set(["yes", "sometimes", "not_yet"]),
  printer: new Set(["a4", "us_letter", "both_unsure"]),
};

export function validateApplication(input) {
  const errors = {};
  if (!input.adultFirstName) errors.adultFirstName = "Please add your first name.";
  if (!input.adultEmail) errors.adultEmail = "Please add a valid email address.";
  if (!ALLOWED.ageBand.has(input.childAgeBand)) errors.childAgeBand = "Choose an age band.";
  if (!input.activityLanguage) errors.activityLanguage = "Choose or enter the activity language.";
  if (!ALLOWED.countAloud.has(input.countsAloud)) errors.countsAloud = "Choose one response.";
  for (const field of ["countsFive", "matchesNumerals", "composesNumbers"]) {
    if (!ALLOWED.ability.has(input[field])) errors[field] = "Choose one response.";
  }
  if (!ALLOWED.printer.has(input.printerFormat)) errors.printerFormat = "Choose a print format.";
  if (!input.participationConfirmed) errors.participationConfirmed = "Confirm that the pilot timing works for you.";
  if (!input.privacyConfirmed) errors.privacyConfirmed = "Confirm that you have read the privacy note.";
  return errors;
}

export function assessEligibility(input) {
  if (!input.participationConfirmed) return { qualified: false, reason: "timing_or_printing" };
  if (input.activityLanguage.toLowerCase() !== "english") {
    return { qualified: false, reason: "language_outside_first_round" };
  }

  const learningSignals = [input.countsFive, input.matchesNumerals, input.composesNumbers];
  if (learningSignals.every((value) => value === "usually")) {
    return { qualified: false, reason: "likely_too_advanced" };
  }

  if (input.countsAloud === "not_yet" && learningSignals.every((value) => value === "not_yet")) {
    return { qualified: false, reason: "likely_too_early" };
  }

  return { qualified: true, reason: "provisional_fit" };
}
