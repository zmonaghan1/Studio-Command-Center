/** Calendar dates are stored as ISO strings (YYYY-MM-DD) and treated as UTC days. */
export type IsoDate = string;

export type DisciplineId = 'production' | 'design' | 'art' | 'engineering' | 'audio' | 'qa';

export interface Discipline {
  id: DisciplineId;
  name: string;
  lead: string;
  headcount: number;
}

export interface Milestone {
  id: string;
  name: string;
  discipline: DisciplineId;
  start: IsoDate;
  due: IsoDate;
  /** 0 to 100. */
  percentComplete: number;
  /** Ids of milestones that must finish before this one can. */
  dependsOn: string[];
}

export type Severity = 'low' | 'medium' | 'high';

export interface Blocker {
  id: string;
  title: string;
  /** The discipline that is blocked. */
  discipline: DisciplineId;
  /** Person responsible for clearing it. */
  owner: string;
  raisedOn: IsoDate;
  resolvedOn?: IsoDate;
  /** The milestone this blocker puts at risk. */
  milestoneId: string;
  severity: Severity;
}

export interface BudgetLine {
  discipline: DisciplineId;
  /** Total planned spend for the project, in whole currency units. */
  planned: number;
  /** Actual spend to date, in whole currency units. */
  spent: number;
}

export interface Studio {
  studioName: string;
  projectName: string;
  currency: string;
  projectStart: IsoDate;
  shipDate: IsoDate;
  /** The "status date" all health calculations are measured against. */
  asOf: IsoDate;
  disciplines: Discipline[];
  milestones: Milestone[];
  blockers: Blocker[];
  budget: BudgetLine[];
}
