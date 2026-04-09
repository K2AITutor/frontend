/**
 * Converts a LaTeX string (from MathLive) to a Nerdamer-compatible expression string.
 *
 * Nerdamer uses a plain-text algebraic syntax (e.g. "x^2 + 2*x + 1") rather than LaTeX.
 * This utility handles the most common patterns produced by MathLive for VCE math.
 */
export function latexToNerdamer(latex: string): string {
  let expr = latex.trim();

  // Remove surrounding \left / \right wrappers
  expr = expr.replace(/\\left\s*/g, '').replace(/\\right\s*/g, '');

  // Fractions: \frac{a}{b} → (a)/(b)
  expr = expr.replace(/\\frac\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (_m, num, den) => {
    return `(${latexToNerdamer(num)})/(${latexToNerdamer(den)})`;
  });

  // Square root: \sqrt{x} → sqrt(x)
  expr = expr.replace(/\\sqrt\{([^{}]*)\}/g, (_m, inner) => `sqrt(${latexToNerdamer(inner)})`);

  // nth root: \sqrt[n]{x} → (x)^(1/n)
  expr = expr.replace(/\\sqrt\[([^\]]+)\]\{([^{}]*)\}/g, (_m, n, inner) => `(${latexToNerdamer(inner)})^(1/${n})`);

  // Superscript: x^{n} → x^(n)
  expr = expr.replace(/\^\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, (_m, exp) => `^(${latexToNerdamer(exp)})`);

  // Subscript: strip subscripts (used in variable names like x_1 → x1)
  expr = expr.replace(/_\{([^{}]*)\}/g, (_m, sub) => sub.replace(/\s/g, ''));
  expr = expr.replace(/_([a-zA-Z0-9])/g, '$1');

  // Absolute value: \left|x\right| already handled by \left\right removal — wrap in abs()
  expr = expr.replace(/\|([^|]+)\|/g, (_m, inner) => `abs(${latexToNerdamer(inner)})`);

  // Common trig & math functions
  const functions = [
    'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
    'arcsin', 'arccos', 'arctan',
    'sinh', 'cosh', 'tanh',
    'ln', 'log', 'exp',
  ];
  functions.forEach(fn => {
    // \sin(x) or \sin{x}
    const re = new RegExp(`\\\\${fn}\\s*\\(([^)]*)\\)`, 'g');
    expr = expr.replace(re, `${fn}($1)`);
    const re2 = new RegExp(`\\\\${fn}\\s*\\{([^{}]*)\\}`, 'g');
    expr = expr.replace(re2, `${fn}($1)`);
    // bare \sin x → sin(x) — only single token
    const re3 = new RegExp(`\\\\${fn}\\b`, 'g');
    expr = expr.replace(re3, fn);
  });

  // log base: \log_{b}(x) → log(x)/log(b)  (change of base)
  expr = expr.replace(/log_\(([^)]+)\)\(([^)]+)\)/g, (_m, base, arg) => `log(${arg})/log(${base})`);

  // e^{...} → e^(...)  — already handled by superscript rule; ensure bare \e → e
  expr = expr.replace(/\\e\b/g, 'e');

  // Greek letters commonly used in math
  const greek: Record<string, string> = {
    alpha: 'alpha', beta: 'beta', gamma: 'gamma', delta: 'delta',
    theta: 'theta', lambda: 'lambda', mu: 'mu', pi: 'pi',
    sigma: 'sigma', omega: 'omega', phi: 'phi',
  };
  Object.entries(greek).forEach(([name, rep]) => {
    expr = expr.replace(new RegExp(`\\\\${name}\\b`, 'g'), rep);
  });

  // Multiplication: implicit × between number and letter → explicit *
  // e.g. "2x" → "2*x", "3(x+1)" → "3*(x+1)"
  expr = expr.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
  expr = expr.replace(/([a-zA-Z\)])(\d)/g, '$1*$2');
  expr = expr.replace(/\)(\()/g, ')*(');

  // Remove remaining LaTeX commands (e.g. \cdot → *, \times → *, \div → /)
  expr = expr.replace(/\\cdot/g, '*');
  expr = expr.replace(/\\times/g, '*');
  expr = expr.replace(/\\div/g, '/');
  expr = expr.replace(/\\pm/g, '+');   // nerdamer doesn't support ±; use +
  expr = expr.replace(/\\mp/g, '-');

  // Remove any remaining backslashes and curly braces
  expr = expr.replace(/\\/g, '');
  expr = expr.replace(/\{/g, '(').replace(/\}/g, ')');

  // Normalise whitespace
  expr = expr.replace(/\s+/g, ' ').trim();

  return expr;
}
