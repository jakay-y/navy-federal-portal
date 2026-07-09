"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SLIDES = [
  "/images/hero-slides/slide-1.jpg",
  "/images/hero-slides/slide-2.jpg",
  "/images/hero-slides/slide-3.jpg",
  "/images/hero-slides/slide-4.jpg",
];

const INTERVAL_MS = 10000;
const FADE_DURATION = 1.6;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex(i % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {SLIDES.map((slide, i) => (
        <motion.div
          key={slide}
          animate={{
            opacity: i === index ? 1 : 0,
            scale: i === index ? 1 : 1.05,
          }}
          transition={{
            opacity: { duration: FADE_DURATION, ease: "easeInOut" },
            scale: { duration: INTERVAL_MS / 1000, ease: "linear" },
          }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{ backgroundImage: `url('${slide}')`, zIndex: i === index ? 1 : 0 }}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-navy-900/25 via-transparent to-navy-900/10" />

      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              index === i ? "w-8 bg-white/90" : "w-1.5 bg-white/35 hover:bg-white/55"
            )}
          />
        ))}
      </div>
    </div>
  );
}