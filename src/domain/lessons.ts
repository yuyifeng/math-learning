import type { QuestionType } from './arithmetic'

export type PlaceValueColumn = 'tens' | 'ones'
export type RegroupKind = 'carry' | 'borrow' | 'split'

export interface PlaceValueRow {
  label: string
  tens: number | null
  ones: number | null
  emphasis?: PlaceValueColumn | 'both'
  previousTens?: number
  note?: string
}

export interface RegroupAction {
  kind: RegroupKind
  label: string
}

export interface LessonStep {
  title: string
  instruction: string
  equation: string
  boardRows: readonly PlaceValueRow[]
  regroup?: RegroupAction
}

export interface ArithmeticLesson {
  type: QuestionType
  title: string
  summary: string
  strategy: string
  left: number
  right: number
  operator: '+' | '-'
  answer: number
  steps: readonly LessonStep[]
}

export const arithmeticLessons: Record<QuestionType, ArithmeticLesson> = {
  'addition-without-carry': {
    type: 'addition-without-carry',
    title: '不进位加法',
    summary: '个位相加不满十，个位和十位可以分别相加。',
    strategy: '先算个位，再算十位',
    left: 34,
    right: 25,
    operator: '+',
    answer: 59,
    steps: [
      {
        title: '先找到个位',
        instruction: '34 有 3 个十和 4 个一，25 有 2 个十和 5 个一。',
        equation: '34 + 25',
        boardRows: [
          { label: '34', tens: 3, ones: 4, emphasis: 'ones' },
          { label: '25', tens: 2, ones: 5, emphasis: 'ones' },
        ],
      },
      {
        title: '个位相加',
        instruction: '4 个一加 5 个一是 9 个一，还没有满十，不用进位。',
        equation: '4 + 5 = 9',
        boardRows: [
          { label: '34', tens: 3, ones: 4, emphasis: 'ones' },
          { label: '25', tens: 2, ones: 5, emphasis: 'ones' },
          { label: '个位和', tens: null, ones: 9, emphasis: 'ones' },
        ],
      },
      {
        title: '十位相加',
        instruction: '3 个十加 2 个十是 5 个十，再和 9 个一合起来。',
        equation: '30 + 20 = 50，50 + 9 = 59',
        boardRows: [
          { label: '34', tens: 3, ones: 4, emphasis: 'tens' },
          { label: '25', tens: 2, ones: 5, emphasis: 'tens' },
          { label: '答案 59', tens: 5, ones: 9, emphasis: 'both' },
        ],
      },
    ],
  },
  'addition-with-carry': {
    type: 'addition-with-carry',
    title: '进位加法',
    summary: '个位相加满十，把十个一换成一个十。',
    strategy: '个位满十，向十位进一',
    left: 28,
    right: 17,
    operator: '+',
    answer: 45,
    steps: [
      {
        title: '个位先相加',
        instruction: '8 个一加 7 个一，一共有 15 个一。',
        equation: '8 + 7 = 15',
        boardRows: [
          { label: '28', tens: 2, ones: 8, emphasis: 'ones' },
          { label: '17', tens: 1, ones: 7, emphasis: 'ones' },
        ],
      },
      {
        title: '满十进一',
        instruction: '从 15 个一里拿出 10 个一，换成 1 个十，个位还剩 5。',
        equation: '15 个一 = 1 个十 + 5 个一',
        boardRows: [
          {
            label: '个位的和',
            tens: 1,
            ones: 5,
            emphasis: 'both',
            note: '新换来的 1 个十要放到十位',
          },
        ],
        regroup: {
          kind: 'carry',
          label: '10 个一合成 1 个十，向前进一',
        },
      },
      {
        title: '十位再相加',
        instruction: '2 个十加 1 个十，再加进来的 1 个十，是 4 个十。',
        equation: '2 + 1 + 1 = 4，答案是 45',
        boardRows: [
          { label: '28', tens: 2, ones: 8, emphasis: 'tens' },
          { label: '17', tens: 1, ones: 7, emphasis: 'tens' },
          {
            label: '答案 45',
            tens: 4,
            ones: 5,
            emphasis: 'both',
            note: '个位写 5，十位写 4',
          },
        ],
      },
    ],
  },
  'subtraction-without-borrow': {
    type: 'subtraction-without-borrow',
    title: '不退位减法',
    summary: '个位够减，个位和十位可以分别相减。',
    strategy: '先减个位，再减十位',
    left: 58,
    right: 24,
    operator: '-',
    answer: 34,
    steps: [
      {
        title: '先看个位',
        instruction: '58 有 5 个十和 8 个一，要减去 2 个十和 4 个一。',
        equation: '58 - 24',
        boardRows: [
          { label: '58', tens: 5, ones: 8, emphasis: 'ones' },
          { label: '24', tens: 2, ones: 4, emphasis: 'ones' },
        ],
      },
      {
        title: '个位相减',
        instruction: '8 个一减 4 个一，还剩 4 个一。8 够减 4，不用借位。',
        equation: '8 - 4 = 4',
        boardRows: [
          { label: '58', tens: 5, ones: 8, emphasis: 'ones' },
          { label: '减去 24', tens: 2, ones: 4, emphasis: 'ones' },
          { label: '个位差', tens: null, ones: 4, emphasis: 'ones' },
        ],
      },
      {
        title: '十位相减',
        instruction: '5 个十减 2 个十，还剩 3 个十，和 4 个一合起来是 34。',
        equation: '50 - 20 = 30，30 + 4 = 34',
        boardRows: [
          { label: '58', tens: 5, ones: 8, emphasis: 'tens' },
          { label: '减去 24', tens: 2, ones: 4, emphasis: 'tens' },
          { label: '答案 34', tens: 3, ones: 4, emphasis: 'both' },
        ],
      },
    ],
  },
  'subtraction-with-borrow': {
    type: 'subtraction-with-borrow',
    title: '退位减法',
    summary: '个位不够减，从十位借一个十，再拆成十个一。',
    strategy: '个位不够，向十位借一',
    left: 52,
    right: 27,
    operator: '-',
    answer: 25,
    steps: [
      {
        title: '个位不够减',
        instruction: '个位上的 2 比 7 小，2 个一不够减去 7 个一。',
        equation: '2 < 7',
        boardRows: [
          { label: '52', tens: 5, ones: 2, emphasis: 'ones' },
          { label: '减去 27', tens: 2, ones: 7, emphasis: 'ones' },
        ],
      },
      {
        title: '从十位借一',
        instruction: '从 5 个十里借走 1 个十，十位就从 5 变成 4。',
        equation: '5 个十 - 1 个十 = 4 个十',
        boardRows: [
          {
            label: '借位中的 52',
            tens: 4,
            ones: 2,
            emphasis: 'tens',
            previousTens: 5,
            note: '借出的 1 个十准备送到个位',
          },
        ],
        regroup: {
          kind: 'borrow',
          label: '从十位借出 1 个十',
        },
      },
      {
        title: '把一十拆开',
        instruction: '借来的 1 个十可以拆成 10 个一，个位就有 12 个一。',
        equation: '2 个一 + 10 个一 = 12 个一',
        boardRows: [
          {
            label: '重新分好的 52',
            tens: 4,
            ones: 12,
            emphasis: 'both',
            note: '数还是 52，只是换了一种分法',
          },
        ],
        regroup: {
          kind: 'split',
          label: '1 个十拆成 10 个一',
        },
      },
      {
        title: '完成减法',
        instruction: '个位 12 减 7 得 5，十位 4 减 2 得 2，所以答案是 25。',
        equation: '12 - 7 = 5，4 - 2 = 2',
        boardRows: [
          { label: '重新分好的 52', tens: 4, ones: 12 },
          { label: '减去 27', tens: 2, ones: 7 },
          {
            label: '答案 25',
            tens: 2,
            ones: 5,
            emphasis: 'both',
          },
        ],
      },
    ],
  },
}
