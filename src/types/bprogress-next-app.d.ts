declare module '@bprogress/next/app' {
  import type { ReactNode } from 'react';

  export type ProgressProviderProps = {
    children: ReactNode;
    height?: string;
    color?: string;
    options?: {
      showSpinner?: boolean;
      [key: string]: unknown;
    };
    shallowRouting?: boolean;
    [key: string]: unknown;
  };

  export function ProgressProvider(props: ProgressProviderProps): JSX.Element;
}
