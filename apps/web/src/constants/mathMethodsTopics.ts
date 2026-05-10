/*Purpose/content: old hardcoded topic list should no longer drive the UI.*/
export type MathMethodsTopic = {
    code: string;
    name: string;
};

export const MATH_METHODS_TOPICS: MathMethodsTopic[] = [
    { code: 'MM_FUNC_BASICS', name: 'Function Basics' },
    { code: 'MM_ALG_SIMPLIFY', name: 'Algebraic Simplification' },
    { code: 'MM_CALC_DIFF_BASICS', name: 'Differentiation Basics' },
    { code: 'MM_STAT_PROB_RULES', name: 'Probability Rules' },
];