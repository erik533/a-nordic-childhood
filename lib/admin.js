import crypto from "node:crypto";
import { bearerToken } from "./http.js";

export function adminAuthorized(req, expected = process.env.PILOT_ADMIN_SECRET || "") {
  const received = bearerToken(req);
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
