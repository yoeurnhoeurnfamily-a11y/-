
export interface LessonObjective {
  knowledge: string;
  skills: string;
  attitude: string;
}

export interface LessonStep {
  stepNumber: number;
  title: string;
  duration?: string;
  teacherActivity: string[];
  content: string[];
  studentActivity: string[];
}

export type QuestionType = 'multiple-choice' | 'fill-in-the-blanks' | 'true-false' | 'short-answer';

export interface WorksheetQuestion {
  type: QuestionType;
  question: string;
  options?: string[]; // Used for multiple-choice
}

export interface Worksheet {
  title: string;
  instructions: string;
  questions: WorksheetQuestion[];
  wordBank?: string[]; // Optional box of words for fill-in-the-blanks
}

export interface Slide {
  title: string;
  content: string[];
}

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  structure: string; // Description of steps and format
}

export interface GroupMember {
  name: string;
  role?: string;
}

export interface StudentGroup {
  id: number;
  name: string;
  members: GroupMember[];
}

export interface LessonEvaluation {
  strengths: string;
  weaknesses: string;
  improvements: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  learningStyle: string;
  notes: string;
}

export interface PersonalizedModification {
  studentName: string;
  learningStyle: string;
  originalChallenge: string;
  suggestedAccommodation: string;
  worksheetDifficultyAdjustment: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  grade: string;
  subject: string;
  policy: string;
  lessonNumber: string;
  subTopic: string;
  duration: string;
  date: string;
  method: string;
  strategy: string;
  studentCount: number;
  groupMemberCount: number;
  groupWorksheetCount: number;
  homeworkCount: number;
  reference: string;
  objectives: LessonObjective;
  materialsTeacher: string[];
  materialsStudent: string[];
  steps: LessonStep[];
  teacherNames: string[];
  taughtBy: string;
  worksheets?: Worksheet[];
  slides?: Slide[];
  templateId?: string;
  studentNames?: string[];
  groups?: StudentGroup[];
  evaluation?: LessonEvaluation;
  bloomsLevels?: string[];
  studentProfiles?: StudentProfile[];
  personalizedModifications?: PersonalizedModification[];
}
