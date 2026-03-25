import { registerOTel } from "@vercel/otel";

registerOTel({
  serviceName: process.env.OTEL_SERVICE_NAME || "visit-all",
});
