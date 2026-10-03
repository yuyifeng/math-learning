import {
  ArrowLeft,
  CheckCircle2,
  Home,
  RotateCcw,
  Star,
  Target,
  Trophy,
} from 'lucide-react'
import { QUESTION_TYPES, type QuestionType } from '../domain/arithmetic'
import {
  difficultyLabels,
  learningTopicLabels,
  practiceTypeLabels,
  type NavigateToPage,
  type PracticeRoundSummary,
  type PracticeSetup,
} from '../types/navigation'
import '../styles/practice.css'

interface SummaryPageProps {
  summary?: PracticeRoundSummary
  onNavigate: NavigateToPage
  onRetry: (setup: PracticeSetup) => void
  onBackToSelection: () => void
}

function getReviewSuggestion(summary: PracticeRoundSummary): string {
  const mistakesByType = Object.fromEntries(
    QUESTION_TYPES.map((type) => [type, 0]),
  ) as Record<QuestionType, number>

  summary.answers.forEach(({ questionType, correct }) => {
    if (!correct) {
      mistakesByType[questionType] += 1
    }
  })

  const reviewTypes = QUESTION_TYPES.filter(
    (type) => mistakesByType[type] > 0,
  )
    .sort((left, right) => mistakesByType[right] - mistakesByType[left])
    .slice(0, 2)

  if (reviewTypes.length === 0) {
    return '本轮全部答对，可以挑战更高一关，或者试试综合练习。'
  }

  return `建议复习${reviewTypes
    .map((type) => `“${learningTopicLabels[type]}”`)
    .join('和')}，先看清个位，再一步一步计算。`
}

export function SummaryPage({
  summary,
  onNavigate,
  onRetry,
  onBackToSelection,
}: SummaryPageProps) {
  if (!summary) {
    return (
      <section className="page summary-page" aria-labelledby="summary-title">
        <div className="summary-empty">
          <span className="summary-empty__icon" aria-hidden="true">
            <Target size={40} />
          </span>
          <p className="eyebrow">练习总结</p>
          <h1 id="summary-title">先完成一轮练习吧</h1>
          <p>完成 10 道题后，这里会展示准确率、星星和复习建议。</p>
          <button
            className="button button--accent"
            type="button"
            onClick={onBackToSelection}
          >
            选择练习
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="page summary-page" aria-labelledby="summary-title">
      <div className="summary-hero">
        <span className="summary-hero__icon" aria-hidden="true">
          <Trophy size={42} />
        </span>
        <p className="eyebrow">练习总结</p>
        <h1 id="summary-title">这一轮完成啦！</h1>
        <p>
          {practiceTypeLabels[summary.practiceType]} ·{' '}
          {difficultyLabels[summary.difficulty]}
        </p>
      </div>

      <div
        className="summary-stats"
        role="list"
        aria-label="本轮练习成绩"
      >
        <article className="summary-stat" role="listitem">
          <CheckCircle2 size={26} aria-hidden="true" />
          <span>答对题数</span>
          <strong>
            {summary.correctAnswers}
            <small> / {summary.totalQuestions}</small>
          </strong>
        </article>
        <article className="summary-stat" role="listitem">
          <Target size={26} aria-hidden="true" />
          <span>准确率</span>
          <strong>{summary.accuracy}%</strong>
        </article>
        <article
          className="summary-stat summary-stat--reward"
          role="listitem"
        >
          <Star size={26} fill="currentColor" aria-hidden="true" />
          <span>本轮奖励</span>
          <strong>
            {summary.earnedStars}
            <small> 颗星</small>
          </strong>
        </article>
      </div>

      <div className="summary-review">
        <div className="summary-review__heading">
          <Target size={26} aria-hidden="true" />
          <div>
            <p className="eyebrow">下一步建议</p>
            <h2>复习小提示</h2>
          </div>
        </div>
        <p>{getReviewSuggestion(summary)}</p>
      </div>

      <div className="summary-actions">
        <button
          className="button button--primary"
          type="button"
          onClick={() =>
            onRetry({
              practiceType: summary.practiceType,
              difficulty: summary.difficulty,
            })
          }
        >
          <RotateCcw size={20} aria-hidden="true" />
          重新练习
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onBackToSelection}
        >
          <ArrowLeft size={20} aria-hidden="true" />
          返回选择
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={() => onNavigate('home')}
        >
          <Home size={20} aria-hidden="true" />
          返回首页
        </button>
      </div>
    </section>
  )
}
