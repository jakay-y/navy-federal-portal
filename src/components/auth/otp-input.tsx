"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}

export function OtpInput({ length = 6, onComplete, hasError, disabled }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (hasError) {
      setValues(Array(length).fill(""));
      inputsRef.current[0]?.focus();
    }
  }, [hasError, length]);

  const updateValues = (newValues: string[]) => {
    setValues(newValues);
    const code = newValues.join("");
    if (code.length === length) {
      onComplete(code);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newValues = [...values];
    newValues[index] = digit;
    updateValues(newValues);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const newValues = Array(length).fill("");
    pasted.split("").forEach((char, i) => {
      newValues[i] = char;
    });
    updateValues(newValues);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <motion.div
      animate={hasError ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex justify-center gap-2 sm:gap-3"
    >
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "h-12 w-10 rounded-xl border-2 bg-white text-center text-lg font-semibold text-navy-900 transition-all focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20 sm:h-14 sm:w-12",
            hasError ? "border-red-400 bg-red-50" : "border-slate-200",
            disabled && "opacity-50"
          )}
        />
      ))}
    </motion.div>
  );
}