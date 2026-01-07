
export enum Level {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum TaskStatus {
  DRAFT = 'Draft',
  PENDING_REVIEW = 'Pending Review',
  ACCEPTED = 'Accepted',
  COMPLETED = 'Completed'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  userUrgency?: Level;
  userImportance?: Level;
  aiUrgency?: Level;
  aiImportance?: Level;
  justification?: string;
  completeBy: string; // ISO Date String
  status: TaskStatus;
  createdAt: string;
}

export interface AIAnalysisResponse {
  urgency: Level;
  importance: Level;
  justification: string;
}

export enum Quadrant {
  DO = 'Do (Urgent & Important)',
  SCHEDULE = 'Schedule (Important & Not Urgent)',
  DELEGATE = 'Delegate (Urgent & Not Important)',
  ELIMINATE = 'Eliminate (Not Urgent & Not Important)'
}
