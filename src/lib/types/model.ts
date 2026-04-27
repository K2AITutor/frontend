export type ModelFamily = 'rule' | 'llm' | 'ml';

export type DeploymentStatus = 'production' | 'staging' | 'archived' | 'retired';

export interface EvalMetrics {
  precision: number;
  recall: number;
  f1: number;
  mse: number | null;
}

export interface DeploymentHistoryEntry {
  env: string;
  deployedAt: string;
  deployedBy: string;
  version: string;
}

export interface ModelVersion {
  id: string;
  name: string;
  family: ModelFamily;
  version: string;
  status: DeploymentStatus;
  deployedAt: string | null;
  accuracyPct: number;
  agreementWithTeacherPct: number;
}

export interface ModelDetail extends ModelVersion {
  evalMetrics: EvalMetrics;
  deploymentHistory: DeploymentHistoryEntry[];
  artifactUri: string;
}
