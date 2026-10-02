import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleX,
  Flag,
  Flame,
  Layers3,
  Sparkles,
  Star,
} from 'lucide-react'
import {
  generateQuestion,
  QUESTION_TYPES,
  type ArithmeticQuestion,
  type Difficulty,
  type PracticeType,
} from '../domain/arithmetic'
import {
  createInitialScoringState,
  STREAK_MILESTONE_BONUS_STARS,
  submitAnswer,
  type LearningProgress,
  type ScoredAnswerResult,
  type ScoringState,
} from '../domain/progress'
import {
  difficultyLabels,
  practiceTypeLabels,
  type LearningTopic,
  type NavigateToPage,
  type PracticeAnswerSummary,
  type PracticeRoundSummary,
  type PracticeSetup,
} from '../types/navigation'
import { playAnswerSound } from '../utils/answerSound'
import '../styles/practice.css'

interface PracticePageProps {
  selectedTopic?: LearningTopic
  initialSetup?: PracticeSetup
  initialProgress: LearningProgress
  onNavigate: NavigateToPage
  onComplete: (summary: PracticeRoundSummary) => void
  onProgressChange: (progress: LearningProgress) => void
}

const QUESTIONS_PER_ROUND = 10
const practiceTypes: PracticeType[] = [...QUESTION_TYPES, 'mixed']
const difficulties: {
  id: Difficulty
  range: string
  description: string
}[] = [
  { id: 'easy', range: '0～20', description: '先从小数字热身' },
  { id: 'medium', range: '0～50', description: '数字变大一点' },
  { id: 'hard', range: '0～100', description: '挑战百以内计算' },
]

function createRoundQuestions(setup: PracticeSetup): ArithmeticQuestion[] {
  const expressionKeys = new Set<string>()

  return Array.from({ length: QUESTIONS_PER_ROUND }, (_, index) => {
    let question = generateQuestion(
      setup.practiceType,
      setup.difficulty,
      { id: `round-${Date.now()}-${index + 1}` },
    )
    let attempts = 0

    while (
      expressionKeys.has(
        `${question.left}${question.operator}${question.right}`,
      ) &&
      attempts < 20
    ) {
      question = generateQuestion(
        setup.practiceType,
        setup.difficulty,
        { id: `round-${Date.now()}-${index + 1}` },
      )
      attempts += 1
    }

    expressionKeys.add(
      `${question.left}${question.operator}${question.right}`,
    )
    return question
  })
}

function getExplanationSteps(question: ArithmeticQuestion): string[] {
  const leftOnes = question.left % 10
  const rightOnes = question.right % 10
  const leftTens = Math.floor(question.left / 10)
  const rightTens = Math.floor(question.right / 10)

  switch (question.type) {
    case 'addition-without-carry':
      return [
        `先算个位：${leftOnes} + ${rightOnes} = ${leftOnes + rightOnes}。`,
        `再算十的个数：${leftTens} + ${rightTens} = ${leftTens + rightTens}。`,
        `合起来得到 ${question.answer}。`,
      ]
    case 'addition-with-carry': {
      const onesTotal = leftOnes + rightOnes
      return [
        `先算个位：${leftOnes} + ${rightOnes} = ${onesTotal}。`,
        `${onesTotal} 里面有 1 个十，把 ${onesTotal % 10} 写在个位，向前进 1。`,
        `十的个数相加再加进位：${leftTens} + ${rightTens} + 1 = ${leftTens + rightTens + 1}，所以答案是 ${question.answer}。`,
      ]
    }
    case 'subtraction-without-borrow':
      return [
        `个位够减，先算：${leftOnes} - ${rightOnes} = ${leftOnes - rightOnes}。`,
        `再算十的个数：${leftTens} - ${rightTens} = ${leftTens - rightTens}。`,
        `合起来得到 ${question.answer}。`,
      ]
    case 'subtraction-with-borrow':
      return [
        `个位 ${leftOnes} 不够减 ${rightOnes}，从前面借 1 个十。`,
        `把 1 个十换成 10 个一，个位变成 ${leftOnes + 10}，再算 ${leftOnes + 10} - ${rightOnes} = ${leftOnes + 10 - rightOnes}。`,
        `十的个数少 1 后再减：${leftTens} - 1 - ${rightTens} = ${leftTens - 1 - rightTens}，所以答案是 ${question.answer}。`,
      ]
  }
}

export function PracticePage({
  selectedTopic,
  initialSetup,
  initialProgress,
  onNavigate,
  onComplete,
  onProgressChange,
}: PracticePageProps) {
  const defaultSetup: PracticeSetup = initialSetup ?? {
    practiceType: selectedTopic ?? 'addition-without-carry',
    difficulty: 'easy',
  }
  const [view, setView] = useState<'selection' | 'round'>(
    initialSetup ? 'round' : 'selection',
  )
  const [selectedPracticeType, setSelectedPracticeType] =
    useState<PracticeType>(defaultSetup.practiceType)
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>(defaultSetup.difficulty)
  const [questions, setQuestions] = useState<ArithmeticQuestion[]>(() =>
    initialSetup ? createRoundQuestions(initialSetup) : [],
  )
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [answerResult, setAnswerResult] =
    useState<ScoredAnswerResult>()
  const [scoringState, setScoringState] = useState<ScoringState>(() => ({
    ...createInitialScoringState(),
    progress: initialProgress,
  }))
  const [roundStartingStars, setRoundStartingStars] = useState(
    initialProgress.stars,
  )
  const [celebrationMilestone, setCelebrationMilestone] =
    useState<number | null>(null)
  const [answerSummaries, setAnswerSummaries] = useState<
    PracticeAnswerSummary[]
  >([])
  const answerInputRef = useRef<HTMLInputElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (celebrationMilestone === null) {
      return
    }

    const timeoutId = window.setTimeout(
      () => setCelebrationMilestone(null),
      3200,
    )
    return () => window.clearTimeout(timeoutId)
  }, [celebrationMilestone])

  useEffect(() => {
    if (view !== 'round') {
      return
    }

    if (answerResult) {
      feedbackRef.current?.focus()
      return
    }

    answerInputRef.current?.focus()
  }, [answerResult, questionIndex, view])

  const startRound = () => {
    const setup = {
      practiceType: selectedPracticeType,
      difficulty: selectedDifficulty,
    }
    setQuestions(createRoundQuestions(setup))
    setQuestionIndex(0)
    setAnswer('')
    setValidationMessage('')
    setAnswerResult(undefined)
    setScoringState({
      ...createInitialScoringState(),
      progress: initialProgress,
    })
    setRoundStartingStars(initialProgress.stars)
    setCelebrationMilestone(null)
    setAnswerSummaries([])
    setView('round')
  }

  const returnToSelection = () => {
    setView('selection')
    setValidationMessage('')
    setAnswerResult(undefined)
    setCelebrationMilestone(null)
  }

  if (view === 'selection') {
    return (
      <section
        className="page practice-page"
        aria-labelledby="practice-title"
      >
        <button
          className="back-button"
          type="button"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft size={20} aria-hidden="true" />
          返回首页
        </button>

        <header className="practice-heading">
          <p className="eyebrow">闯关练习</p>
          <h1 id="practice-title">选一条路线，开始挑战</h1>
          <p>每轮固定 10 题，答完就能看到本轮收获。</p>
        </header>

        <section
          className="practice-selection"
          aria-labelledby="practice-type-title"
        >
          <div className="practice-selection__heading">
            <span className="selection-step">1</span>
            <div>
              <h2 id="practice-type-title">选择练习类型</h2>
              <p>可以专练一种，也可以来一轮综合挑战。</p>
            </div>
          </div>
          <div className="practice-type-grid">
            {practiceTypes.map((practiceType) => (
              <button
                className="practice-choice"
                data-selected={selectedPracticeType === practiceType}
                type="button"
                key={practiceType}
                onClick={() => setSelectedPracticeType(practiceType)}
                aria-pressed={selectedPracticeType === practiceType}
              >
                {practiceType === 'mixed' ? (
                  <Layers3 size={24} aria-hidden="true" />
                ) : (
                  <Flag size={24} aria-hidden="true" />
                )}
                <span>{practiceTypeLabels[practiceType]}</span>
                <small>
                  {practiceType === 'mixed'
                    ? '四类题型随机出现'
                    : '集中练习，逐步熟练'}
                </small>
                {selectedPracticeType === practiceType && (
                  <strong className="choice-status">已选择</strong>
                )}
              </button>
            ))}
          </div>
        </section>

        <section
          className="practice-selection"
          aria-labelledby="difficulty-title"
        >
          <div className="practice-selection__heading">
            <span className="selection-step">2</span>
            <div>
              <h2 id="difficulty-title">选择关卡难度</h2>
              <p>从适合自己的数字范围开始。</p>
            </div>
          </div>
          <div className="difficulty-grid">
            {difficulties.map(({ id, range, description }) => (
              <button
                className="difficulty-choice"
                data-selected={selectedDifficulty === id}
                type="button"
                key={id}
                onClick={() => setSelectedDifficulty(id)}
                aria-pressed={selectedDifficulty === id}
              >
                <strong>{difficultyLabels[id]}</strong>
                <span>{range}</span>
                <small>{description}</small>
                {selectedDifficulty === id && (
                  <strong className="choice-status">已选择</strong>
                )}
              </button>
            ))}
          </div>
        </section>

        <div className="practice-start">
          <p aria-live="polite">
            已选择：{practiceTypeLabels[selectedPracticeType]} ·{' '}
            {difficultyLabels[selectedDifficulty]}
          </p>
          <button
            className="button button--accent"
            type="button"
            onClick={startRound}
          >
            开始 10 题挑战
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      </section>
    )
  }

  const currentQuestion = questions[questionIndex]
  const isLastQuestion = questionIndex === questions.length - 1
  const progress = ((questionIndex + 1) / questions.length) * 100

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (answerResult) {
      return
    }

    const submission = submitAnswer(
      currentQuestion,
      answer,
      scoringState,
    )
    if (submission.status === 'invalid') {
      setValidationMessage(submission.validation.message)
      return
    }
    if (submission.status === 'already-scored') {
      return
    }

    playAnswerSound(submission.result.status)
    setValidationMessage('')
    setScoringState(submission.state)
    onProgressChange(submission.state.progress)
    setAnswerResult(submission.result)
    setCelebrationMilestone(submission.result.streakMilestone)
    setAnswerSummaries((current) => [
      ...current,
      {
        questionType: submission.result.questionType,
        correct: submission.result.status === 'correct',
      },
    ])
  }

  const handleNext = () => {
    if (!answerResult) {
      return
    }

    if (isLastQuestion) {
      const correctAnswers = answerSummaries.filter(
        ({ correct }) => correct,
      ).length
      onComplete({
        practiceType: selectedPracticeType,
        difficulty: selectedDifficulty,
        totalQuestions: questions.length,
        correctAnswers,
        accuracy: Math.round(
          (correctAnswers / questions.length) * 100,
        ),
        earnedStars: scoringState.progress.stars - roundStartingStars,
        answers: answerSummaries,
      })
      return
    }

    setQuestionIndex((current) => current + 1)
    setAnswer('')
    setValidationMessage('')
    setAnswerResult(undefined)
    setCelebrationMilestone(null)
  }

  return (
    <section
      className="page practice-page"
      aria-labelledby="question-title"
    >
      <button
        className="back-button"
        type="button"
        onClick={returnToSelection}
      >
        <ArrowLeft size={20} aria-hidden="true" />
        返回选择
      </button>

      <div className="round-status">
        <div>
          <p>
            {practiceTypeLabels[selectedPracticeType]} ·{' '}
            {difficultyLabels[selectedDifficulty]}
          </p>
          <strong>
            第 {questionIndex + 1} / {questions.length} 题
          </strong>
        </div>
        <div className="round-metrics" role="group" aria-label="本轮状态">
          <div className="round-reward" aria-label="本轮已获得星星">
            <Star size={20} fill="currentColor" aria-hidden="true" />
            {scoringState.progress.stars - roundStartingStars}
          </div>
          <div className="round-streak" aria-label="当前连续答对题数">
            <Flame size={20} aria-hidden="true" />
            {scoringState.progress.currentStreak}
          </div>
        </div>
      </div>
      <div
        className="round-progress"
        role="progressbar"
        aria-label="本轮练习进度"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={questionIndex + 1}
        aria-valuetext={`第 ${questionIndex + 1} 题，共 ${questions.length} 题`}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <article className="question-card">
        <p className="eyebrow">算一算</p>
        <h1
          id="question-title"
          className="question-expression"
          aria-live="polite"
          aria-atomic="true"
        >
          {currentQuestion.left}{' '}
          <span>{currentQuestion.operator}</span>{' '}
          {currentQuestion.right} = ?
        </h1>

        <form className="answer-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="answer-input">在这里写答案</label>
          <div className="answer-form__controls">
            <input
              id="answer-input"
              ref={answerInputRef}
              value={answer}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={Boolean(answerResult)}
              aria-invalid={Boolean(validationMessage)}
              aria-describedby="answer-help"
              onChange={(event) => {
                setAnswer(event.target.value)
                setValidationMessage('')
              }}
            />
            <button
              className="button button--primary"
              type="submit"
              disabled={Boolean(answerResult)}
            >
              提交答案
            </button>
          </div>
          <p
            id="answer-help"
            className={
              validationMessage ? 'answer-error' : 'answer-hint'
            }
            role={validationMessage ? 'alert' : undefined}
            aria-live={validationMessage ? 'assertive' : 'off'}
            aria-atomic="true"
          >
            {validationMessage || '请输入 0 至 100 的整数，按 Enter 也能提交。'}
          </p>
        </form>

        {celebrationMilestone !== null && (
          <div
            className="milestone-celebration"
            role="status"
            aria-live="polite"
          >
            <Sparkles size={24} aria-hidden="true" />
            <div>
              <strong>连续答对 {celebrationMilestone} 题！</strong>
              <span>
                里程碑额外奖励 {STREAK_MILESTONE_BONUS_STARS} 颗星
              </span>
            </div>
          </div>
        )}

        {answerResult && (
          <div
            className="answer-feedback"
            data-status={answerResult.status}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            ref={feedbackRef}
            tabIndex={-1}
          >
            <div className="answer-feedback__heading">
              {answerResult.status === 'correct' ? (
                <CheckCircle2 size={30} aria-hidden="true" />
              ) : (
                <CircleX size={30} aria-hidden="true" />
              )}
              <div>
                <h2>
                  {answerResult.status === 'correct'
                    ? '答案正确，答对啦！'
                    : '答案不正确，再看一步就会了'}
                </h2>
                <p>
                  {answerResult.status === 'correct'
                    ? `这题获得 ${answerResult.awardedStars} 颗星。`
                    : `你的答案是 ${answerResult.submittedAnswer}，正确答案是 ${answerResult.correctAnswer}。`}
                </p>
              </div>
            </div>

            {answerResult.status === 'incorrect' && (
              <div className="answer-explanation">
                <h3>分步解析</h3>
                <ol>
                  {getExplanationSteps(currentQuestion).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            <button
              className="button button--accent"
              type="button"
              onClick={handleNext}
            >
              {isLastQuestion ? '查看练习总结' : '进入下一题'}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        )}
      </article>
    </section>
  )
}
