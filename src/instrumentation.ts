export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (process.env.OTEL_ENABLED !== "true") {
    return;
  }

  await import("./instrumentation.node");
}
