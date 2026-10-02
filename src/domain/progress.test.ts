import { describe, expect, it } from 'vitest'
import type { ArithmeticQuestion, QuestionType } from './arithmetic'
import {
  BASE_STARS_PER_CORRECT_ANSWER,
  STREAK_MILESTONE_BONUS_STARS,
  createInitialProgress,
  createInitialScoringState,
  submitAnswer,
  type ScoringState,
} from './progress'

function createQuestion(
  id: string,
  type: QuestionType = 'addition-without-carry',
): ArithmeticQuestion {
  const operands: Record<
    QuestionType,
    Pick<ArithmeticQuestion, 'left' | 'right' | 'operator' | 'answer'>
  > = {
    'addition-without-carry': {
      left: 8,
      right: 1,
      operator: '+',
      answer: 9,
    },
    'addition-with-carry': {
      left: 8,
      right: 3,
      operator: '+',
      answer: 11,
    },
    'subtraction-without-borrow': {
      left: 8,
      right: 1,
      operator: '-',
      answer: 7,
    },
    'subtraction-with-borrow': {
      left: 12,
      right: 3,
      operator: '-',
      answer: 9,
    },
  }

  return {
    id,
    type,
    difficulty: 'easy',
    ...operands[type],
  }
}

function expectScored(
  submission: ReturnType<typeof submitAnswer>,
): asserts submission is Extract<
  ReturnType<typeof submitAnswer>,
  { status: 'scored' }
> {
  expect(submission.status).toBe('scored')
  if (submission.status !== 'scored') {
    throw new Error(`Expected a scored submission, got ${submission.status}`)
  }
}

describe('createInitialProgress', () => {
  it('starts all totals and all four question types at zero', () => {
    expect(createInitialProgress()).toEqual({
      totalAnswered: 0,
      totalCorrect: 0,
      stars: 0,
      currentStreak: 0,
      bestStreak: 0,
      byType: {
        'addition-without-carry': { answered: 0, correct: 0 },
        'addition-with-carry': { answered: 0, correct: 0 },
        'subtraction-without-borrow': { answered: 0, correct: 0 },
        'subtraction-with-borrow': { answered: 0, correct: 0 },
      },
    })
  })
})

describe('submitAnswer', () => {
  it('scores a correct answer and updates only its question type', () => {
    const initial = createInitialScoringState()
    const submission = submitAnswer(
      createQuestion('correct-1', 'addition-with-carry'),
      '11',
      initial,
    )

    expectScored(submission)
    expect(submission.result).toMatchObject({
      status: 'correct',
      submittedAnswer: 11,
      correctAnswer: 11,
      awardedStars: BASE_STARS_PER_CORRECT_ANSWER,
      streakMilestone: null,
    })
    expect(submission.state.progress).toMatchObject({
      totalAnswered: 1,
      totalCorrect: 1,
      stars: 1,
      currentStreak: 1,
      bestStreak: 1,
    })
    expect(
      submission.state.progress.byType['addition-with-carry'],
    ).toEqual({ answered: 1, correct: 1 })
    expect(
      submission.state.progress.byType['addition-without-carry'],
    ).toEqual({ answered: 0, correct: 0 })
    expect(initial).toEqual(createInitialScoringState())
  })

  it('counts an incorrect answer once and resets the current streak', () => {
    const state: ScoringState = {
      progress: {
        ...createInitialProgress(),
        totalAnswered: 3,
        totalCorrect: 3,
        stars: 3,
        currentStreak: 3,
        bestStreak: 3,
      },
      scoredQuestionIds: ['previous-1', 'previous-2', 'previous-3'],
    }
    const submission = submitAnswer(
      createQuestion('incorrect-1'),
      8,
      state,
    )

    expectScored(submission)
    expect(submission.result).toMatchObject({
      status: 'incorrect',
      awardedStars: 0,
      streakMilestone: null,
    })
    expect(submission.state.progress).toMatchObject({
      totalAnswered: 4,
      totalCorrect: 3,
      stars: 3,
      currentStreak: 0,
      bestStreak: 3,
    })
  })

  it('awards a bonus at every five-answer streak milestone', () => {
    let state = createInitialScoringState()

    for (let index = 1; index <= 10; index += 1) {
      const submission = submitAnswer(
        createQuestion(`streak-${index}`),
        9,
        state,
      )
      expectScored(submission)
      state = submission.state

      if (index === 5 || index === 10) {
        expect(submission.result.streakMilestone).toBe(index)
        expect(submission.result.awardedStars).toBe(
          BASE_STARS_PER_CORRECT_ANSWER +
            STREAK_MILESTONE_BONUS_STARS,
        )
      }
    }

    expect(state.progress).toMatchObject({
      totalAnswered: 10,
      totalCorrect: 10,
      currentStreak: 10,
      bestStreak: 10,
      stars: 14,
    })
  })

  it.each([
    ['', 'required'],
    ['3.5', 'not-an-integer'],
    [-1, 'out-of-range'],
    [101, 'out-of-range'],
  ])('does not score invalid input %s', (input, error) => {
    const state = createInitialScoringState()
    const submission = submitAnswer(createQuestion('invalid-1'), input, state)

    expect(submission.status).toBe('invalid')
    expect(submission.validation).toMatchObject({ valid: false, error })
    expect(submission.state).toBe(state)
  })

  it('does not score the same question more than once', () => {
    const question = createQuestion('duplicate-1')
    const first = submitAnswer(question, 8, createInitialScoringState())
    expectScored(first)

    const duplicate = submitAnswer(question, 9, first.state)

    expect(duplicate.status).toBe('already-scored')
    expect(duplicate.state).toBe(first.state)
    expect(duplicate.state.progress).toMatchObject({
      totalAnswered: 1,
      totalCorrect: 0,
      stars: 0,
      currentStreak: 0,
    })
    expect(duplicate.state.scoredQuestionIds).toEqual(['duplicate-1'])
  })

  it('allows scoring after an invalid attempt because it was not judged', () => {
    const question = createQuestion('invalid-then-valid')
    const invalid = submitAnswer(question, '', createInitialScoringState())
    const valid = submitAnswer(question, 9, invalid.state)

    expect(invalid.status).toBe('invalid')
    expectScored(valid)
    expect(valid.result.status).toBe('correct')
    expect(valid.state.progress.totalAnswered).toBe(1)
  })
})
