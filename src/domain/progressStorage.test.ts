import { describe, expect, it } from 'vitest'
import { createInitialProgress, type LearningProgress } from './progress'
import {
  LEARNING_PROGRESS_SCHEMA_VERSION,
  LEARNING_PROGRESS_STORAGE_KEY,
  loadLearningProgress,
  saveLearningProgress,
  type ProgressStorage,
} from './progressStorage'

class MemoryStorage implements ProgressStorage {
  readonly values = new Map<string, string>()
  throwOnGet = false
  throwOnSet = false

  getItem(key: string): string | null {
    if (this.throwOnGet) {
      throw new Error('storage read failed')
    }
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.throwOnSet) {
      throw new Error('storage write failed')
    }
    this.values.set(key, value)
  }
}

function createPopulatedProgress(): LearningProgress {
  return {
    totalAnswered: 5,
    totalCorrect: 4,
    stars: 6,
    currentStreak: 4,
    bestStreak: 4,
    byType: {
      'addition-without-carry': { answered: 2, correct: 2 },
      'addition-with-carry': { answered: 1, correct: 1 },
      'subtraction-without-borrow': { answered: 1, correct: 0 },
      'subtraction-with-borrow': { answered: 1, correct: 1 },
    },
  }
}

function storeValue(storage: MemoryStorage, value: unknown): void {
  storage.values.set(
    LEARNING_PROGRESS_STORAGE_KEY,
    typeof value === 'string' ? value : JSON.stringify(value),
  )
}

describe('progressStorage', () => {
  it('saves and restores a valid versioned progress value', () => {
    const storage = new MemoryStorage()
    const progress = createPopulatedProgress()

    expect(saveLearningProgress(progress, storage)).toBe(true)
    expect(
      JSON.parse(storage.values.get(LEARNING_PROGRESS_STORAGE_KEY) ?? ''),
    ).toEqual({
      version: LEARNING_PROGRESS_SCHEMA_VERSION,
      progress,
    })
    expect(loadLearningProgress(storage)).toEqual(progress)
  })

  it('returns fresh initial progress when storage is empty or unavailable', () => {
    const storage = new MemoryStorage()
    const first = loadLearningProgress(storage)
    const second = loadLearningProgress(null)

    expect(first).toEqual(createInitialProgress())
    expect(second).toEqual(createInitialProgress())
    expect(first).not.toBe(second)
  })

  it.each([
    ['invalid JSON', '{broken'],
    [
      'unknown schema version',
      {
        version: LEARNING_PROGRESS_SCHEMA_VERSION + 1,
        progress: createPopulatedProgress(),
      },
    ],
    [
      'missing question type',
      {
        version: LEARNING_PROGRESS_SCHEMA_VERSION,
        progress: {
          ...createPopulatedProgress(),
          byType: {
            ...createPopulatedProgress().byType,
            'subtraction-with-borrow': undefined,
          },
        },
      },
    ],
    [
      'incorrect count above answered count',
      {
        version: LEARNING_PROGRESS_SCHEMA_VERSION,
        progress: {
          ...createPopulatedProgress(),
          byType: {
            ...createPopulatedProgress().byType,
            'addition-with-carry': { answered: 1, correct: 2 },
          },
        },
      },
    ],
    [
      'totals inconsistent with per-type values',
      {
        version: LEARNING_PROGRESS_SCHEMA_VERSION,
        progress: {
          ...createPopulatedProgress(),
          totalAnswered: 99,
        },
      },
    ],
    [
      'streak inconsistent with best streak',
      {
        version: LEARNING_PROGRESS_SCHEMA_VERSION,
        progress: {
          ...createPopulatedProgress(),
          currentStreak: 5,
          bestStreak: 4,
        },
      },
    ],
  ])('falls back for %s', (_scenario, storedValue) => {
    const storage = new MemoryStorage()
    storeValue(storage, storedValue)

    expect(loadLearningProgress(storage)).toEqual(createInitialProgress())
  })

  it('falls back when reading throws and reports failed writes', () => {
    const storage = new MemoryStorage()
    storage.throwOnGet = true

    expect(loadLearningProgress(storage)).toEqual(createInitialProgress())

    storage.throwOnSet = true
    expect(saveLearningProgress(createPopulatedProgress(), storage)).toBe(
      false,
    )
  })

  it('does not store a runtime-invalid progress value', () => {
    const storage = new MemoryStorage()
    const invalidProgress = {
      ...createPopulatedProgress(),
      totalCorrect: -1,
    }

    expect(saveLearningProgress(invalidProgress, storage)).toBe(false)
    expect(storage.values.size).toBe(0)
  })
})
