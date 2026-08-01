"use client";

import { SignalBusProvider } from "@synarava/wiring-engine";
import { ViewportProvider } from "@/contexts/viewport-context";
import { ShellBootstrapProvider } from "@/modules/shell/ShellBootstrapContext";
import { AppLayout } from "@/app/AppLayout";
import { WidgetLibraryProvider } from "@/modules/widget-library/WidgetLibraryContext";

export default function HomePage() {
  return (
    <SignalBusProvider busId="left-shell" initialSignals={{ interactionMode: "pin", interactionLocked: false, collectionQuery: "" }}>
      <ViewportProvider>
        <ShellBootstrapProvider>
          <WidgetLibraryProvider>
            <AppLayout />
          </WidgetLibraryProvider>
        </ShellBootstrapProvider>
      </ViewportProvider>
    </SignalBusProvider>
  );
}
