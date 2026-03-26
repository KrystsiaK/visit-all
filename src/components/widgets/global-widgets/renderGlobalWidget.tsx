"use client";

import { motion } from "framer-motion";

import { WidgetErrorBoundary } from "@/components/errors/WidgetErrorBoundary";
import { GlobalOverviewWidgetCard } from "@/components/widgets/global-widgets/GlobalOverviewWidgetCard";
import { overlayItemVariants } from "@/lib/motion";
import type { WidgetInstanceRecord } from "@/lib/widgets";

export const renderGlobalWidget = (widget: WidgetInstanceRecord) => {
  if (widget.componentKey === "global_overview") {
    return (
      <WidgetErrorBoundary>
        <motion.div variants={overlayItemVariants} layout="position">
          <GlobalOverviewWidgetCard widget={widget} />
        </motion.div>
      </WidgetErrorBoundary>
    );
  }

  return null;
};
