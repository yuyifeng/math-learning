import { QUESTION_TYPES } from './arithmetic'
import {
  createInitialProgress,
  type LearningProgress,
  type ProgressByQuestionType,
} from './progress'

export const LEARNING_PROGRESS_STORAGE_KEY = 'math-learning:progress'
export const LEARNING_PROGRESS_SCHEMA_VERSION = 1

export interface ProgressStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface StoredLearningProgress {
  version: typeof LEARNING_PROGRESS_SCHEMA_VERSION
  progress: LearningProgress
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === 'number' && Number.isInteger(value) && value >= 0
  )
}

function parseProgress(value: unknown): LearningProgress | null {
  if (!isRecord(value) || !isRecord(value.byType)) {
    return null
  }

  const byType = {} as ProgressByQuestionType

  for (const type of QUESTION_TYPES) {
    const typeProgress = value.byType[type]
    if (
      !isRecord(typeProgress) ||
      !isNonNegativeInteger(typeProgress.answered) ||
      !isNonNegativeInteger(typeProgress.correct) ||
      typeProgress.correct > typeProgress.answered
    ) {
      return null
    }

    byType[type] = {
      answered: typeProgress.answered,
      correct: typeProgress.correct,
    }
  }

  const totalAnswered = QUESTION_TYPES.reduce(
    (total, type) => total + byType[type].answered,
    0,
  )
  const totalCorrect = QUESTION_TYPES.reduce(
    (total, type) => total + byType[type].correct,
    0,
  )

  if (
    !isNonNegativeInteger(value.totalAnswered) ||
    !isNonNegativeInteger(value.totalCorrect) ||
    !isNonNegativeInteger(value.stars) ||
    !isNonNegativeInteger(value.currentStreak) ||
    !isNonNegativeInteger(value.bestStreak) ||
    value.totalAnswered !== totalAnswered ||
    value.totalCorrect !== totalCorrect ||
    value.totalCorrect > value.totalAnswered ||
    value.currentStreak > value.bestStreak ||
    value.currentStreak > value.totalCorrect
  ) {
    return null
  }

  return {
    totalAnswered: value.totalAnswered,
    totalCorrect: value.totalCorrect,
    stars: value.stars,
    currentStreak: value.currentStreak,
    bestStreak: value.bestStreak,
    byType,
  }
}

function getBrowserStorage(): ProgressStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function loadLearningProgress(
  storage: ProgressStorage | null = getBrowserStorage(),
): LearningProgress {
  if (!storage) {
    return createInitialProgress()
  }

  try {
    const serialized = storage.getItem(LEARNING_PROGRESS_STORAGE_KEY)
    if (serialized === null) {
      return createInitialProgress()
    }

    const stored: unknown = JSON.parse(serialized)
    if (
      !isRecord(stored) ||
      stored.version !== LEARNING_PROGRESS_SCHEMA_VERSION
    ) {
      return createInitialProgress()
    }

    return parseProgress(stored.progress) ?? createInitialProgress()
  } catch {
    return createInitialProgress()
  }
}

export function saveLearningProgress(
  progress: LearningProgress,
  storage: ProgressStorage | null = getBrowserStorage(),
): boolean {
  if (!storage || parseProgress(progress) === null) {
    return false
  }

  const stored: StoredLearningProgress = {
    version: LEARNING_PROGRESS_SCHEMA_VERSION,
    progress,
  }

  try {
    storage.setItem(
      LEARNING_PROGRESS_STORAGE_KEY,
      JSON.stringify(stored),
    )
    return true
  } catch {
    return false
  }
}
