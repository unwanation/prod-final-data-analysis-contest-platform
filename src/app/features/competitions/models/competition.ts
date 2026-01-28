export type CompetitionStatus = 'upcoming' | 'active' | 'finished';

export type SubmissionType = 'file' | 'text' | 'code';

export interface CompetitionTask {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly submissionType: SubmissionType;
  readonly maxAttempts: number;
}

export interface CompetitionSummary {
  readonly id: string;
  readonly title: string;
  readonly status: CompetitionStatus;
  readonly startAt: string;
  readonly deadlineAt: string;
}

export interface CompetitionDetails extends CompetitionSummary {
  readonly description: string;
  readonly rules: string;
  readonly tasks: CompetitionTask[];
}

export type Competition = CompetitionDetails;

export interface Submission {
  readonly id: string;
  readonly taskId: string;
  readonly userId: string;
  readonly answer: string;
  readonly submittedAt: string;
  readonly score?: number;
  readonly status: 'pending' | 'evaluated' | 'error';
}
