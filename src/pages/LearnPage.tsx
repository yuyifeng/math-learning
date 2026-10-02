import { useEffect, useState, type KeyboardEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import {
  arithmeticLessons,
  type PlaceValueColumn,
  type PlaceValueRow,
} from '../domain/lessons'
import { QUESTION_TYPES } from '../domain/arithmetic'
import type {
  LearningTopic,
  NavigateToPage,
} from '../types/navigation'
import './LearnPage.css'

interface LearnPageProps {
  selectedTopic?: LearningTopic
  onNavigate: NavigateToPage
}

interface PlaceValueBlocksProps {
  column: PlaceValueColumn
  count: number | null
}

function PlaceValueBlocks({ column, count }: PlaceValueBlocksProps) {
  if (count === null) {
    return <span className="place-value__empty">暂不填写</span>
  }

  return (
    <span
      className={`place-value__blocks place-value__blocks--${column}`}
      role="img"
      aria-label={`${count} 个${column === 'tens' ? '十' : '一'}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <span className="place-value__block" aria-hidden="true" key={index} />
      ))}
      <strong className="place-value__count">{count}</strong>
    </span>
  )
}

function PlaceValueBoard({ rows }: { rows: readonly PlaceValueRow[] }) {
  return (
    <div className="place-value" role="table" aria-label="十位个位数位板">
      <div className="place-value__header" role="row">
        <span role="columnheader">数字</span>
        <span role="columnheader">十位</span>
        <span role="columnheader">个位</span>
      </div>
      {rows.map((row) => (
        <div className="place-value__row" role="row" key={row.label}>
          <strong className="place-value__label" role="rowheader">
            {row.label}
          </strong>
          <div
            className="place-value__cell place-value__cell--tens"
            data-active={
              row.emphasis === 'tens' || row.emphasis === 'both'
            }
            role="cell"
          >
            {row.previousTens !== undefined && (
              <span
                className="place-value__previous"
                aria-label={`原来是 ${row.previousTens}`}
              >
                {row.previousTens}
              </span>
            )}
            <PlaceValueBlocks column="tens" count={row.tens} />
          </div>
          <div
            className="place-value__cell place-value__cell--ones"
            data-active={
              row.emphasis === 'ones' || row.emphasis === 'both'
            }
            role="cell"
          >
            <PlaceValueBlocks column="ones" count={row.ones} />
          </div>
          {row.note && <p className="place-value__note">{row.note}</p>}
        </div>
      ))}
    </div>
  )
}

export function LearnPage({
  selectedTopic,
  onNavigate,
}: LearnPageProps) {
  const [activeTopic, setActiveTopic] = useState<LearningTopic>(
    selectedTopic ?? QUESTION_TYPES[0],
  )
  const [stepIndex, setStepIndex] = useState(0)
  const [replayKey, setReplayKey] = useState(0)

  useEffect(() => {
    setActiveTopic(selectedTopic ?? QUESTION_TYPES[0])
    setStepIndex(0)
    setReplayKey((current) => current + 1)
  }, [selectedTopic])

  const lesson = arithmeticLessons[activeTopic]
  const step = lesson.steps[stepIndex]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === lesson.steps.length - 1

  const selectTopic = (topic: LearningTopic) => {
    setActiveTopic(topic)
    setStepIndex(0)
    setReplayKey((current) => current + 1)
  }

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    topicIndex: number,
  ) => {
    let nextIndex = topicIndex

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (topicIndex + 1) % QUESTION_TYPES.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex =
        (topicIndex - 1 + QUESTION_TYPES.length) %
        QUESTION_TYPES.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = QUESTION_TYPES.length - 1
    } else {
      return
    }

    event.preventDefault()
    const nextTopic = QUESTION_TYPES[nextIndex]
    selectTopic(nextTopic)
    document.getElementById(`lesson-tab-${nextTopic}`)?.focus()
  }

  const replay = () => {
    setStepIndex(0)
    setReplayKey((current) => current + 1)
  }

  return (
    <section
      className="page learn-page"
      aria-labelledby="learn-title"
    >
      <button
        className="back-button"
        type="button"
        onClick={() => onNavigate('home')}
      >
        <ArrowLeft size={20} aria-hidden="true" />
        返回首页
      </button>

      <header className="learn-header">
        <div>
          <p className="eyebrow">方法学习</p>
          <h1 id="learn-title">拆开数字，看清每一步</h1>
          <p>选择一种题型，跟着数位板慢慢算。</p>
        </div>
      </header>

      <div className="lesson-tabs" role="tablist" aria-label="选择讲解题型">
        {QUESTION_TYPES.map((topic, index) => {
          const topicLesson = arithmeticLessons[topic]
          return (
            <button
              className="lesson-tab"
              data-active={topic === activeTopic}
              id={`lesson-tab-${topic}`}
              key={topic}
              type="button"
              role="tab"
              aria-controls="lesson-panel"
              aria-selected={topic === activeTopic}
              tabIndex={topic === activeTopic ? 0 : -1}
              onClick={() => selectTopic(topic)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span>{topicLesson.operator}</span>
              {topicLesson.title}
            </button>
          )
        })}
      </div>

      <article
        className="lesson-card"
        id="lesson-panel"
        role="tabpanel"
        aria-labelledby={`lesson-tab-${activeTopic}`}
      >
        <div className="lesson-equation-bar">
          <div className="lesson-equation-bar__context">
            <span>本题</span>
            <strong>{lesson.title}</strong>
          </div>
          <div
            className="lesson-equation-bar__expression"
            role="img"
            aria-label={`示例算式：${lesson.left} ${lesson.operator} ${lesson.right} 等于 ${lesson.answer}`}
          >
            <span>{lesson.left}</span>
            <span>{lesson.operator}</span>
            <span>{lesson.right}</span>
            <span>=</span>
            <strong>{lesson.answer}</strong>
          </div>
        </div>

        <div className="lesson-overview">
          <div>
            <p className="lesson-overview__strategy">{lesson.strategy}</p>
            <h2>{lesson.title}</h2>
            <p>{lesson.summary}</p>
          </div>
          <ol className="step-progress" aria-label="讲解进度">
            {lesson.steps.map((lessonStep, index) => (
              <li
                data-active={index === stepIndex}
                data-complete={index < stepIndex}
                key={lessonStep.title}
                aria-current={index === stepIndex ? 'step' : undefined}
              >
                <span>{index + 1}</span>
                <small>{lessonStep.title}</small>
              </li>
            ))}
          </ol>
        </div>

        <div
          className="lesson-stage"
          key={`${activeTopic}-${stepIndex}-${replayKey}`}
        >
          <section className="step-copy" aria-labelledby="step-title">
            <p className="step-copy__number">
              第 {stepIndex + 1} 步，共 {lesson.steps.length} 步
            </p>
            <h3 id="step-title">{step.title}</h3>
            <p>{step.instruction}</p>
            <div className="step-copy__calculation">
              <span>这一步</span>
              <strong>{step.equation}</strong>
            </div>
            {step.regroup && (
              <div
                className="regroup-callout"
                data-kind={step.regroup.kind}
              >
                <ArrowRight size={22} aria-hidden="true" />
                <span>{step.regroup.label}</span>
              </div>
            )}
          </section>

          <div className="board-wrap">
            <PlaceValueBoard rows={step.boardRows} />
          </div>
        </div>

        <p
          className="lesson-announcement"
          aria-live="polite"
          aria-atomic="true"
        >
          正在讲解第 {stepIndex + 1} 步：{step.title}
        </p>

        <div className="lesson-controls">
          <button
            className="button button--secondary"
            type="button"
            disabled={isFirstStep}
            onClick={() => setStepIndex((current) => current - 1)}
          >
            <ChevronLeft size={20} aria-hidden="true" />
            上一步
          </button>
          <button
            className="button button--secondary"
            type="button"
            onClick={replay}
          >
            <RotateCcw size={19} aria-hidden="true" />
            重新演示
          </button>
          <button
            className="button button--primary"
            type="button"
            disabled={isLastStep}
            onClick={() => setStepIndex((current) => current + 1)}
          >
            下一步
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </article>
    </section>
  )
}
