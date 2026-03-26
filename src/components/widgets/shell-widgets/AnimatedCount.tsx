import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

interface AnimatedCountProps {
  value: number;
}

export const AnimatedCount = ({ value }: AnimatedCountProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (previousValueRef.current === value) {
      return;
    }

    const controls = animate(previousValueRef.current, value, {
      duration: 0.18,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    previousValueRef.current = value;

    return () => {
      controls.stop();
    };
  }, [value]);

  return <>{displayValue}</>;
};
