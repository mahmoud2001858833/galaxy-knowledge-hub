export type SimEventKind =
  | 'start'
  | 'param'
  | 'action'
  | 'mistake'
  | 'success'
  | 'idle'
  | 'hint'
  | 'quiz';

export interface SimTrackedEvent {
  kind: SimEventKind;
  label: string;
  payload?: Record<string, unknown>;
  atSeconds: number;
}

export interface SimAIDescriptor {
  /** stable slug, e.g. "projectile-3d" */
  id: string;
  title: string;
  description?: string;
  objectives?: string[];
  /** correctness rules / common mistakes given to the AI as grading context */
  rules?: string[];
}

export type SimCoachTone = 'praise' | 'hint' | 'warning' | 'error';

export interface SimCoachMessage {
  id: number;
  message: string;
  tone: SimCoachTone;
  focus?: string | null;
  action?: string | null;
  at: number;
}

export interface SimCoachReport {
  summary: string;
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
  score: number | null;
}
