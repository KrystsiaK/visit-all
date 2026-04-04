type AuthDebugDetails = Record<string, unknown>;

const AUTH_DEBUG_ENABLED = process.env.AUTH_DEBUG === "true";

function redact(details: AuthDebugDetails) {
  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => {
      if (
        key.toLowerCase().includes("password") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("hash")
      ) {
        return [key, "[redacted]"];
      }

      return [key, value];
    })
  );
}

export function authDebug(event: string, details: AuthDebugDetails = {}) {
  if (!AUTH_DEBUG_ENABLED) {
    return;
  }

  console.info(
    `[auth-debug] ${event}`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        ...redact(details),
      },
      null,
      2
    )
  );
}
