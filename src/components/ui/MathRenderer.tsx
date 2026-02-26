// frontend/src/components/ui/MathRenderer.tsx
'use client';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  math: string;
  block?: boolean;
  className?: string;
}

/**
 * Component to safely render LaTeX math using KaTeX.
 * If the math string is empty or invalid, it fails gracefully.
 */
export default function MathRenderer({ math, block = false, className = '' }: MathRendererProps) {
  if (!math) return null;

  return (
    <span className={`math-container ${className}`}>
      {block ? (
        <BlockMath math={math} />
      ) : (
        <InlineMath math={math} />
      )}
    </span>
  );
}
