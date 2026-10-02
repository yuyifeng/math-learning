import type {
  Difficulty,
  PracticeType,
  QuestionType,
} from '../domain/arithmetic'

export type AppPage = 'home' | 'learn' | 'practice' | 'summary'

export type LearningTopic = QuestionType

export const learningTopicLabels: Record<LearningTopic, string> = {
  'addition-without-carry': '不进位加法',
  'addition-with-carry': '进位加法',
  'subtraction-without-borrow': '不退位减法',
  'subtraction-with-borrow': '退位减法',
}

export const practiceTypeLabels: Record<PracticeType, string> = {
  ...learningTopicLabels,
  mixed: '综合练习',
}

export const difficultyLabels: Record<Difficulty, string> = {
  easy: '第一关',
  medium: '第二关',
  hard: '第三关',
}

export interface PracticeSetup {
  practiceType: PracticeType
  difficulty: Difficulty
}

export interface PracticeAnswerSummary {
  questionType: QuestionType
  correct: boolean
}

export interface PracticeRoundSummary extends PracticeSetup {
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  earnedStars: number
  answers: PracticeAnswerSummary[]
}

export type NavigateToPage = (
  page: AppPage,
  topic?: LearningTopic,
) => void
