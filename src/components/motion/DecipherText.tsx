'use client';

import React, { useState, useRef, useCallback } from 'react';

interface DecipherTextProps {
  text: string;
  className?: string;
  scrambleChars?: string;
  speed?: number; // interval in ms
  revealSpeed?: number; // iterations per character
  as?: 'span' | 'div' | 'p' | 'a';
}

const DEFAULT_CHARS = '!<>-_\\/[]{}—=+*^?#01';

export default function DecipherText({
  text,
  className = '',
  scrambleChars = DEFAULT_CHARS,
  speed = 18,
  revealSpeed = 1.4,
  as: Component = 'span',
}: DecipherTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    let iteration = 0;
    const maxIterations = text.length * revealSpeed;

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((letter, index) => {
            // Keep spaces as spaces
            if (letter === ' ') return ' ';
            // If iteration has progressed past this character's reveal threshold, show the actual character
            if (index < iteration / revealSpeed) {
              return text[index];
            }
            // Otherwise show a random cryptic character
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          })
          .join('');
      });

      iteration += 1;

      if (iteration > maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
      }
    }, speed);
  }, [text, scrambleChars, speed, revealSpeed]);

  const stopScramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(text);
  }, [text]);

  return (
    <Component
      onMouseEnter={startScramble}
      onMouseLeave={stopScramble}
      className={`inline-block font-mono select-none ${className}`}
    >
      {displayText}
    </Component>
  );
}
