import { motion } from "framer-motion";

const AnimatedText = ({ text, className = "", delayStart = 0, stagger = 0.08 }) => {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.6,
            delay: delayStart + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: "inline-block", transformOrigin: "bottom", marginRight: "0.3em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

export default AnimatedText;