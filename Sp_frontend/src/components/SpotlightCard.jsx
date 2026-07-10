import { useRef, useState } from "react";

const SpotlightCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative rounded-xl border border-secondary/10 overflow-hidden ${className}`}
      style={{
        backgroundImage: `radial-gradient(400px circle at ${pos.x}% ${pos.y}%, rgba(232,41,28,0.35), transparent 70%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          opacity,
          padding: "1px",
          background: `radial-gradient(300px circle at ${pos.x}% ${pos.y}%, rgba(232,41,28,0.8), transparent 70%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default SpotlightCard;