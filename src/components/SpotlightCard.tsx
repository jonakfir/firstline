"use client";

import { useRef, useCallback, useEffect, useState } from "react";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function SpotlightCard({
  children,
  className = "",
  delay = 0,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", `${x}%`);
    cardRef.current.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`spotlight-card rounded-sm p-6 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
      {children}
    </div>
  );
}
