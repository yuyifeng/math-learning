export const QUESTION_TYPES = [
  'addition-without-carry',
  'addition-with-carry',
  'subtraction-without-borrow',
  'subtraction-with-borrow',
] as const

export type QuestionType = (typeof QUESTION_TYPES)[number]
export type PracticeType = QuestionType | 'mixed'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type ArithmeticOperator = '+' | '-'

export interface ArithmeticQuestion {
  id: string
  type: QuestionType
  difficulty: Difficulty
  left: number
  right: number
  operator: ArithmeticOperator
  answer: number
}

export type AnswerValidationError =
  | 'required'
  | 'not-a-number'
  | 'not-an-integer'
  | 'out-of-range'

export type AnswerValidation =
  | { valid: true; value: number }
  | {
      valid: false
      error: AnswerValidationError
      message: string
    }

interface OperandPair {
  left: number
  right: number
}

export interface GenerateQuestionOptions {
  id?: string
  random?: () => number
}

export const DIFFICULTY_MAXIMUMS: Record<Difficulty, number> = {
  easy: 20,
  medium: 50,
  hard: 100,
}

const candidateCache = new Map<string, readonly OperandPair[]>()
let questionSequence = 0

function isAddition(type: QuestionType): boolean {
  return type === 'addition-without-carry' || type === 'addition-with-carry'
}

function usesCarry(left: number, right: number): boolean {
  return (left % 10) + (right % 10) >= 10
}

function usesBorrow(left: number, right: number): boolean {
  return left % 10 < right % 10
}

function matchesType(
  type: QuestionType,
  left: number,
  right: number,
): boolean {
  switch (type) {
    case 'addition-without-carry':
      return left + right <= 100 && !usesCarry(left, right)
    case 'addition-with-carry':
      return left + right <= 100 && usesCarry(left, right)
    case 'subtraction-without-borrow':
      return left >= right && !usesBorrow(left, right)
    case 'subtraction-with-borrow':
      return left >= right && usesBorrow(left, right)
  }
}

function getCandidates(
  type: QuestionType,
  difficulty: Difficulty,
): readonly OperandPair[] {
  const cacheKey = `${type}:${difficulty}`
  const cached = candidateCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const maximum = DIFFICULTY_MAXIMUMS[difficulty]
  const candidates: OperandPair[] = []

  for (let left = 0; left <= maximum; left += 1) {
    for (let right = 0; right <= maximum; right += 1) {
      const result = isAddition(type) ? left + right : left - right
      if (
        result >= 0 &&
        result <= maximum &&
        matchesType(type, left, right)
      ) {
        candidates.push({ left, right })
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error(`No questions available for ${type}:${difficulty}`)
  }

  candidateCache.set(cacheKey, candidates)
  return candidates
}

function nextRandom(random: () => number): number {
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('random must return a number from 0 (inclusive) to 1')
  }
  return value
}

function selectQuestionType(
  practiceType: PracticeType,
  random: () => number,
): QuestionType {
  if (practiceType !== 'mixed') {
    return practiceType
  }

  const index = Math.floor(nextRandom(random) * QUESTION_TYPES.length)
  return QUESTION_TYPES[index]
}

function createQuestionId(): string {
  questionSequence += 1
  return `question-${Date.now()}-${questionSequence}`
}

export function generateQuestion(
  practiceType: PracticeType,
  difficulty: Difficulty,
  options: GenerateQuestionOptions = {},
): ArithmeticQuestion {
  const random = options.random ?? Math.random
  const type = selectQuestionType(practiceType, random)
  const candidates = getCandidates(type, difficulty)
  const pair = candidates[Math.floor(nextRandom(random) * candidates.length)]
  const operator: ArithmeticOperator = isAddition(type) ? '+' : '-'

  return {
    id: options.id ?? createQuestionId(),
    type,
    difficulty,
    left: pair.left,
    right: pair.right,
    operator,
    answer:
      operator === '+' ? pair.left + pair.right : pair.left - pair.right,
  }
}

export function isQuestionValidForType(
  question: ArithmeticQuestion,
): boolean {
  const values = [question.left, question.right, question.answer]
  if (
    values.some(
      (value) => !Number.isInteger(value) || value < 0 || value > 100,
    )
  ) {
    return false
  }

  const expectedOperator: ArithmeticOperator = isAddition(question.type)
    ? '+'
    : '-'
  const expectedAnswer =
    expectedOperator === '+'
      ? question.left + question.right
      : question.left - question.right

  return (
    question.operator === expectedOperator &&
    question.answer === expectedAnswer &&
    matchesType(question.type, question.left, question.right)
  )
}

export function validateAnswer(input: unknown): AnswerValidation {
  if (typeof input === 'string') {
    const normalized = input.trim()
    if (normalized === '') {
      return {
        valid: false,
        error: 'required',
        message: '请输入 0 至 100 的整数',
      }
    }
    if (!/^\d+$/.test(normalized)) {
      return {
        valid: false,
        error: 'not-an-integer',
        message: '请输入 0 至 100 的整数',
      }
    }
    input = Number(normalized)
  }

  if (typeof input !== 'number' || !Number.isFinite(input)) {
    return {
      valid: false,
      error: 'not-a-number',
      message: '请输入 0 至 100 的整数',
    }
  }
  if (!Number.isInteger(input)) {
    return {
      valid: false,
      error: 'not-an-integer',
      message: '请输入 0 至 100 的整数',
    }
  }
  if (input < 0 || input > 100) {
    return {
      valid: false,
      error: 'out-of-range',
      message: '请输入 0 至 100 的整数',
    }
  }

  return { valid: true, value: input }
}
