import type { Variants } from "framer-motion";

// framer-motion 11 types `pathLength` too narrowly under TypeScript 5.9, though it animates correctly at runtime.
// Variants with string labels keep motion.path props simple enough for the compiler.
export const DRAW_VARIANTS = {
  hidden: { pathLength: 0 },
  shown: { pathLength: 1 },
} as unknown as Variants;
