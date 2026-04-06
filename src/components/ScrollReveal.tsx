"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const transform = !isVisible
    ? direction === "up"
      ? "translateY(40px)"
      : direction === "left"
      ? "translateX(-40px)"
      : "translateX(40px)"
    : "translateY(0) translateX(0)";

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform,
        transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
      }}
    >
      {children}
    </div>
  );
}
