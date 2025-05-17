export interface UpdateTaskData {
  title?: string;
  categories?: string[];
  tags?: string[];
  url?: string;
  points?: number;
  questions?: {
    questionText: string;
    options: string[];
    correctAnswer: string;
  }[];
}