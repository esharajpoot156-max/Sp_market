import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const ImageCompareSlider = ({ leftImg, rightImg, leftLabel, rightLabel }) => {
  const ref = useRef(null);
  const x = useMotionValue(50);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const [percent, setPercent] = useState(50);

  const handleDrag = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    x.set(pct);
    setPercent(pct);
  };

  return (
    <div
      ref={ref}
      className="relative w-full aspect-video rounded-xl overflow-hidden select-none cursor-ew-resize border border-secondary/10"
      onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
      onMouseDown={handleDrag}
      onTouchMove={handleDrag}
    >
      <img src={rightImg} alt={rightLabel} className="absolute inset-0 w-full h-full object-cover" />
      <motion.div
        className="absolute inset-0 h-full overflow-hidden"
        style={{ width: useSpring(x, { stiffness: 150, damping: 20 }).get ? undefined : undefined }}
      >
        <motion.div
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
          className="absolute inset-0"
        >
          <img src={leftImg} alt={leftLabel} className="w-full h-full object-cover" />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ left: `${percent}%` }}
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg -translate-x-1/2 flex items-center justify-center"
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-secondary text-xs">
          ⇔
        </div>
      </motion.div>

      <span className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded">{leftLabel}</span>
      <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">{rightLabel}</span>
    </div>
  );
};

export default ImageCompareSlider;