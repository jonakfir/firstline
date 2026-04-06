"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ShimmerButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ShimmerButton({
  children,
  href,
  onClick,
  className = "",
  size = "md",
}: ShimmerButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const sizeClasses = {
    sm: "px-5 py-2 text-body-sm",
    md: "px-8 py-3.5 text-body-md",
    lg: "px-10 py-4 text-body-lg",
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      buttonRef.current.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = "translate(0, 0)";
    }
  }, []);

  const props = {
    className: `shimmer-button magnetic-button inline-flex items-center justify-center font-mono font-medium tracking-tight rounded-xs ${sizeClasses[size]} ${className}`,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    ref: buttonRef as React.RefObject<HTMLButtonElement>,
  };

  if (href) {
    return (
      <motion.a
        href={href}
        {...(props as object)}
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      {...props}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
