"use client";

import {useState, useEffect, useRef} from "react";

/* ───── Animated number ───── */
const Counter = ({to, suffix = ""}: {to: number; suffix?: string}) => {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (!go) return;
    const dur = 1400;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 4)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, to]);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setGo(true),
      {threshold: 0.3},
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  );
};

export default Counter;
