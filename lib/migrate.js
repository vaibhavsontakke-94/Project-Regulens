import { verifyLegacyUser } from "./auth.js";
import { AppError } from "./errors.js";

const SIGN_UP_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signUp";

export async function migratePasswordUser({ email, password }) {
  const user = await verifyLegacyUser({ email, password });
  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Incorrect email or password");
  }
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
  if (!apiKey) {
    throw new AppError(503, "NOT_CONFIGURED", "Firebase is not configured. Set FIREBASE_API_KEY in .env");
  }
  const res = await fetch(`${SIGN_UP_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      password: String(password || ""),
      returnSecureToken: true,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (res.ok && json.localId) {
    return { status: "created", uid: json.localId, email: user.email, name: user.name };
  }
  if (json.error && /EMAIL_EXISTS/i.test(String(json.error.message))) {
    return { status: "exists", email: user.email };
  }
  throw new AppError(
    502,
    "FIREBASE_ERROR",
    json.error ? json.error.message : `Firebase returned HTTP ${res.status}`
  );
}
