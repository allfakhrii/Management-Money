import React, { useEffect, useState } from "react";
import { animate } from "framer-motion";

export function AnimatedCounter({
  value,
  prefix = "Rp ",
  startAnimation = true,
  delay = 0.2,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!startAnimation || value === undefined || value === null) return;

    const timer = setTimeout(() => {
      const controls = animate(0, value, {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo untuk kesan angka meluncur cepat lalu mendarat mulus
        onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      });

      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, startAnimation, delay]);

  const formatted = new Intl.NumberFormat("id-ID").format(displayValue);

  return (
    <span className="tabular-nums font-bold tracking-tight">
      {prefix}{formatted}
    </span>
  );
}
