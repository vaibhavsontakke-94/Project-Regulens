import { logError, logWarn, newRef } from "./log.js";

export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.publicMessage = message;
  }
}

export function genericError() {
  return "Unable to complete the request right now.";
}

export function toPublicError(err, req) {
  const ref = newRef();
  const requestId = req?.requestId || "";
  const endpoint = req?.path || "";

  if (err instanceof AppError) {
    const status = err.status || 400;
    const code = err.code || "REQUEST_FAILED";
    const message = err.publicMessage || genericError();
    if (status >= 500) {
      logError({ ref, type: code, endpoint, requestId, cause: err.message + (err.detail ? " | detail=" + err.detail : "") });
    } else {
      logWarn({ ref, type: code, endpoint, requestId, cause: err.message });
    }
    return { status, code, message, ref };
  }

  if (err && err.type === "entity.too.large") {
    logError({ ref, type: "PAYLOAD_TOO_LARGE", endpoint, requestId, cause: `limit=${err.limit || ""}` });
    return { status: 413, code: "INVALID_REQUEST", message: "Unable to complete the request right now.", ref };
  }

  if (err && err.type === "entity.parse.failed") {
    logWarn({ ref, type: "BAD_JSON", endpoint, requestId, cause: err.message });
    return { status: 400, code: "INVALID_REQUEST", message: "Unable to complete the request right now.", ref };
  }

  logError({
    ref,
    type: "INTERNAL",
    endpoint,
    requestId,
    cause: (err && (err.stack || err.message)) || String(err),
  });
  return { status: 500, code: "REQUEST_FAILED", message: genericError(), ref };
}
