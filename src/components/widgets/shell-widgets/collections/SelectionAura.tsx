import { motion } from "framer-motion";

export const SelectionAura = () => (
  <>
    <motion.div
      className="pointer-events-none absolute inset-0"
      animate={{
        opacity: [0.48, 0.92, 0.48],
        boxShadow: [
          "inset 0 0 0 1px rgba(255,255,255,0.16), 0 0 0 rgba(47,107,255,0)",
          "inset 0 0 0 1px rgba(255,255,255,0.34), 0 0 42px rgba(255,213,74,0.18), 0 0 18px rgba(47,107,255,0.10)",
          "inset 0 0 0 1px rgba(255,255,255,0.16), 0 0 0 rgba(47,107,255,0)",
        ],
      }}
      transition={{ duration: 1.9, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(47,107,255,0.22), rgba(255,213,74,0.36), rgba(230,57,70,0.18), rgba(255,255,255,0.08))",
      }}
    />
    <motion.div
      className="pointer-events-none absolute inset-y-[-8%] -left-[58%] w-[82%]"
      animate={{ x: ["0%", "235%"] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.30), rgba(255,245,196,0.26), rgba(255,255,255,0))",
        filter: "blur(16px)",
        transform: "skewX(-18deg)",
      }}
    />
  </>
);
