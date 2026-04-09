// frontend/src/components/ui/MathInput.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import 'mathlive';
import { latexToNerdamer } from '@/lib/latexToNerdamer';

// Declare the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.RefObject<any>;
      };
    }
  }
}

interface MathInputProps {
  value: string;
  /** Called with the raw LaTeX string on every change */
  onChange: (latex: string) => void;
  /** Called with the Nerdamer-compatible expression on every change */
  onNerdamerChange?: (nerdamer: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * A professional math input component using MathLive.
 * Captures user input as LaTeX and also emits a Nerdamer-compatible expression.
 */
export default function MathInput({ value, onChange, onNerdamerChange, placeholder, className = '' }: MathInputProps) {
  const mfRef = useRef<any>(null);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    // Set initial value
    if (mf.value !== value) {
      mf.value = value;
    }

    // Handle input events
    const handleInput = (e: any) => {
      const latex: string = e.target.value;
      onChange(latex);
      if (onNerdamerChange) {
        onNerdamerChange(latexToNerdamer(latex));
      }
    };

    mf.addEventListener('input', handleInput);

    // Optional: Customize the mathfield
    mf.setOptions({
      smartFence: true,
      virtualKeyboardMode: 'onfocus',
    });

    return () => {
      mf.removeEventListener('input', handleInput);
    };
  }, []); // Run once on mount

  // Sync value if changed from outside (e.g. on question change)
  useEffect(() => {
    if (mfRef.current && mfRef.current.value !== value) {
      mfRef.current.value = value;
    }
  }, [value]);

  return (
    <div className={`math-input-wrapper ${className}`}>
      <math-field
        ref={mfRef}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #334155', // slate-700
          background: 'rgba(15, 23, 42, 0.7)', // slate-900 with opacity
          color: '#e2e8f0', // slate-200
          fontSize: '1.2rem',
          outline: 'none',
        }}
      >
        {value}
      </math-field>
    </div>
  );
}
