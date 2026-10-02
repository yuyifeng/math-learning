import {
  QUESTION_TYPES,
  validateAnswer,
  type AnswerValidation,
  type ArithmeticQuestion,
  type QuestionType,
} from './arithmetic'

export interface QuestionTypeProgress {
  answered: number
  correct: number
}

export type ProgressByQuestionType = Record<
  QuestionType,
  QuestionTypeProgress
>

export interface LearningProgress {
  totalAnswered: number
  totalCorrect: number
  stars: number
  currentStreak: number
  bestStreak: number
  byType: ProgressByQuestionType
}

export interface ScoringState {
  progress: LearningProgress
  scoredQuestionIds: readonly string[]
}

export interface ScoredAnswerResult {
  status: 'correct' | 'incorrect'
  questionId: string
  questionType: QuestionType
  submittedAnswer: number
  correctAnswer: number
  awardedStars: number
  streakMilestone: number | null
}

export type AnswerSubmission =
  | {
      status: 'invalid'
      validation: Extract<AnswerValidation, { valid: false }>
      state: ScoringState
    }
  | {
      status: 'already-scored'
      validation: Extract<AnswerValidation, { valid: true }>
      state: ScoringState
    }
  | {
      status: 'scored'
      validation: Extract<AnswerValidation, { valid: true }>
      result: ScoredAnswerResult
      state: ScoringState
    }

export const BASE_STARS_PER_CORRECT_ANSWER = 1
export const STREAK_MILESTONE_INTERVAL = 5
export const STREAK_MILESTONE_BONUS_STARS = 2

export function createInitialProgress(): LearningProgress {
  const byType = Object.fromEntries(
    QUESTION_TYPES.map((type) => [
      type,
      {
        answered: 0,
        correct: 0,
      },
    ]),
  ) as ProgressByQuestionType

  return {
    totalAnswered: 0,
    totalCorrect: 0,
    stars: 0,
    currentStreak: 0,
    bestStreak: 0,
    byType,
  }
}

export function createInitialScoringState(): ScoringState {
  return {
    progress: createInitialProgress(),
    scoredQuestionIds: [],
  }
}

export function submitAnswer(
  question: ArithmeticQuestion,
  input: unknown,
  state: ScoringState,
): AnswerSubmission {
  const validation = validateAnswer(input)
  if (!validation.valid) {
    return {
      status: 'invalid',
      validation,
      state,
    }
  }

  if (state.scoredQuestionIds.includes(question.id)) {
    return {
      status: 'already-scored',
      validation,
      state,
    }
  }

  const isCorrect = validation.value === question.answer
  const currentStreak = isCorrect ? state.progress.currentStreak + 1 : 0
  const streakMilestone =
    isCorrect && currentStreak % STREAK_MILESTONE_INTERVAL === 0
      ? currentStreak
      : null
  const awardedStars = isCorrect
    ? BASE_STARS_PER_CORRECT_ANSWER +
      (streakMilestone === null ? 0 : STREAK_MILESTONE_BONUS_STARS)
    : 0
  const previousTypeProgress = state.progress.byType[question.type]

  const progress: LearningProgress = {
    totalAnswered: state.progress.totalAnswered + 1,
    totalCorrect: state.progress.totalCorrect + (isCorrect ? 1 : 0),
    stars: state.progress.stars + awardedStars,
    currentStreak,
    bestStreak: Math.max(state.progress.bestStreak, currentStreak),
    byType: {
      ...state.progress.byType,
      [question.type]: {
        answered: previousTypeProgress.answered + 1,
        correct: previousTypeProgress.correct + (isCorrect ? 1 : 0),
      },
    },
  }

  return {
    status: 'scored',
    validation,
    result: {
      status: isCorrect ? 'correct' : 'incorrect',
      questionId: question.id,
      questionType: question.type,
      submittedAnswer: validation.value,
      correctAnswer: question.answer,
      awardedStars,
      streakMilestone,
    },
    state: {
      progress,
      scoredQuestionIds: [...state.scoredQuestionIds, question.id],
    },
  }
}
