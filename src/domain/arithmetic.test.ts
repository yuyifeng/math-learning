import { describe, expect, it } from 'vitest'
import {
  DIFFICULTY_MAXIMUMS,
  QUESTION_TYPES,
  generateQuestion,
  isQuestionValidForType,
  validateAnswer,
  type Difficulty,
  type QuestionType,
} from './arithmetic'

const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

function createDeterministicRandom(seed: number): () => number {
  let value = seed >>> 0

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 2 ** 32
  }
}

function expectTypeCondition(
  type: QuestionType,
  left: number,
  right: number,
): void {
  if (type === 'addition-without-carry') {
    expect((left % 10) + (right % 10)).toBeLessThan(10)
  } else if (type === 'addition-with-carry') {
    expect((left % 10) + (right % 10)).toBeGreaterThanOrEqual(10)
  } else if (type === 'subtraction-without-borrow') {
    expect(left % 10).toBeGreaterThanOrEqual(right % 10)
  } else {
    expect(left % 10).toBeLessThan(right % 10)
  }
}

describe('generateQuestion', () => {
  it.each(QUESTION_TYPES)(
    'generates valid %s questions at every difficulty',
    (type) => {
      for (const difficulty of difficulties) {
        const random = createDeterministicRandom(
          QUESTION_TYPES.indexOf(type) + DIFFICULTY_MAXIMUMS[difficulty],
        )

        for (let index = 0; index < 300; index += 1) {
          const question = generateQuestion(type, difficulty, { random })
          const maximum = DIFFICULTY_MAXIMUMS[difficulty]

          expect(isQuestionValidForType(question)).toBe(true)
          expect(question.type).toBe(type)
          expect(question.left).toBeGreaterThanOrEqual(0)
          expect(question.left).toBeLessThanOrEqual(maximum)
          expect(question.right).toBeGreaterThanOrEqual(0)
          expect(question.right).toBeLessThanOrEqual(maximum)
          expect(question.answer).toBeGreaterThanOrEqual(0)
          expect(question.answer).toBeLessThanOrEqual(maximum)
          expectTypeCondition(type, question.left, question.right)
        }
      }
    },
  )

  it.each([
    [0, 'addition-without-carry'],
    [0.25, 'addition-with-carry'],
    [0.5, 'subtraction-without-borrow'],
    [0.75, 'subtraction-with-borrow'],
  ] as const)('selects every question type in mixed mode', (typeValue, type) => {
    const values = [typeValue, 0.5]
    const question = generateQuestion('mixed', 'hard', {
      random: () => values.shift() ?? 0,
    })

    expect(question.type).toBe(type)
    expect(isQuestionValidForType(question)).toBe(true)
  })

  it('uses a caller-provided id and otherwise creates distinct ids', () => {
    const first = generateQuestion('addition-without-carry', 'easy', {
      random: () => 0,
    })
    const second = generateQuestion('addition-without-carry', 'easy', {
      random: () => 0,
    })
    const custom = generateQuestion('addition-without-carry', 'easy', {
      id: 'round-1-question-1',
      random: () => 0,
    })

    expect(first.id).not.toBe(second.id)
    expect(custom.id).toBe('round-1-question-1')
  })

  it.each([-0.01, 1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects an invalid random value: %s',
    (value) => {
      expect(() =>
        generateQuestion('addition-without-carry', 'easy', {
          random: () => value,
        }),
      ).toThrow(RangeError)
    },
  )
})

describe('isQuestionValidForType', () => {
  it('rejects a question whose declared type does not match its digits', () => {
    expect(
      isQuestionValidForType({
        id: 'invalid-carry',
        type: 'addition-with-carry',
        difficulty: 'easy',
        left: 12,
        right: 3,
        operator: '+',
        answer: 15,
      }),
    ).toBe(false)
  })

  it('rejects wrong answers and values outside 0..100', () => {
    expect(
      isQuestionValidForType({
        id: 'wrong-answer',
        type: 'subtraction-without-borrow',
        difficulty: 'hard',
        left: 100,
        right: 0,
        operator: '-',
        answer: 99,
      }),
    ).toBe(false)
    expect(
      isQuestionValidForType({
        id: 'outside-range',
        type: 'addition-without-carry',
        difficulty: 'hard',
        left: 100,
        right: 1,
        operator: '+',
        answer: 101,
      }),
    ).toBe(false)
  })
})

describe('validateAnswer', () => {
  it.each([
    [0, 0],
    [100, 100],
    [' 42 ', 42],
    ['007', 7],
  ])('accepts an integer in 0..100: %s', (input, expected) => {
    expect(validateAnswer(input)).toEqual({ valid: true, value: expected })
  })

  it.each([
    ['', 'required'],
    ['   ', 'required'],
    ['abc', 'not-an-integer'],
    ['1e2', 'not-an-integer'],
    ['1.5', 'not-an-integer'],
    [-1, 'out-of-range'],
    [101, 'out-of-range'],
    [1.5, 'not-an-integer'],
    [Number.NaN, 'not-a-number'],
    [null, 'not-a-number'],
  ])('rejects invalid answer %s as %s', (input, error) => {
    expect(validateAnswer(input)).toMatchObject({
      valid: false,
      error,
    })
  })
})
