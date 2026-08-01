import { describe, expect, it } from "vitest";

import { compileAndRender } from "@synarava/widget-generator/executor";
import { WIDGET_SANDBOX_MODULES } from "@/modules/widget-runtime/sandbox-modules";

describe("generated widget UI module compatibility", () => {
  it("maps persisted @synarava/ui imports to the published UI kit", () => {
    expect(WIDGET_SANDBOX_MODULES["@synarava/ui"]).toBe(
      WIDGET_SANDBOX_MODULES["@synarava/ui-kit"]
    );

    const result = compileAndRender(
      `
        import { InfoCard } from "@synarava/ui";

        export default function LegacyWidget() {
          return <InfoCard>Legacy widget</InfoCard>;
        }
      `,
      WIDGET_SANDBOX_MODULES
    );

    expect(result.ok).toBe(true);
  });
});
