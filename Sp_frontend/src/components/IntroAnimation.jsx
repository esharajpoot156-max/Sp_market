import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const letters = "Sp.market".split("");

const IntroAnimation = ({ onFinish }) => {
  const [phase, setPhase] = useState(0); // 0: logo, 1: tagline, 2: exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => onFinish(), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          key="intro"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-secondary"
        >
          <div className="flex items-center gap-1">
            {letters.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="text-5xl md:text-7xl font-bold text-bg inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            className="mt-4 text-sm md:text-base tracking-[0.3em] uppercase text-accent"
          >
            Apni Community, Apna Bazaar
          </motion.p>

          <div className="mt-8 h-[2px] w-24 bg-primary/30 overflow-hidden rounded-full">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;