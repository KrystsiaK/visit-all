import type { WiringConfig } from "@synarava/wiring-engine";

export const ADMIN_BUS_ID = "admin-dashboard";

export const ADMIN_SIGNALS = {
  DATE_RANGE: "admin:date_range",
} as const;

export const adminWiringConfig: WiringConfig = {
  shellId: ADMIN_BUS_ID,
  systemBindings: [
    {
      busKey: ADMIN_SIGNALS.DATE_RANGE,
      label: "Date Range Filter",
      source: { widgetKey: "date-range-picker", portKey: "range_out" },
      sinks: [
        { widgetKey: "overview-tab", portKey: "date_in" },
        { widgetKey: "analytics-tab", portKey: "date_in" },
        { widgetKey: "revenue-tab", portKey: "date_in" },
        { widgetKey: "telemetry-tab", portKey: "date_in" },
      ],
    },
  ],
  userConnections: [],
};
