import {
  ArrowRight,
  BookOpen,
  Brain,
  CircleCheck,
  Flag,
  Flame,
  Minus,
  Plus,
  Star,
  Target,
} from 'lucide-react'
import type { LearningProgress } from '../domain/progress'
import type {
  LearningTopic,
  NavigateToPage,
} from '../types/navigation'

interface HomePageProps {
  progress: LearningProgress
  onNavigate: NavigateToPage
}

const learningTopics: {
  id: LearningTopic
  title: string
  description: string
  accent: string
  icon: typeof Plus
}[] = [
  {
    id: 'addition-without-carry',
    title: '不进位加法',
    description: '个位相加不满十',
    accent: 'violet',
    icon: Plus,
  },
  {
    id: 'addition-with-carry',
    title: '进位加法',
    description: '个位满十向前进一',
    accent: 'orange',
    icon: Plus,
  },
  {
    id: 'subtraction-without-borrow',
    title: '不退位减法',
    description: '个位够减，直接计算',
    accent: 'mint',
    icon: Minus,
  },
  {
    id: 'subtraction-with-borrow',
    title: '退位减法',
    description: '个位不够，借一当十',
    accent: 'blue',
    icon: Minus,
  },
]

export function HomePage({ progress, onNavigate }: HomePageProps) {
  return (
    <section className="page page--home" aria-labelledby="home-title">
      <div className="home-intro">
        <div className="hero">
          <p className="eyebrow">百以内加减法</p>
          <h1 id="home-title">
            一步一步，
            <span>算出新本领</span>
          </h1>
          <p className="hero__description">
            看懂十位和个位，再用练习把方法记牢。今天也从一道题开始吧！
          </p>
        </div>

        <aside className="progress-summary" aria-label="我的学习收获">
          <p className="progress-summary__title">我的学习收获</p>
          <dl className="stat-list">
            <div className="stat-item">
              <dt>
                <Star size={20} fill="currentColor" aria-hidden="true" />
                累计星星
              </dt>
              <dd>{progress.stars}</dd>
            </div>
            <div className="stat-item">
              <dt>
                <Flame size={20} aria-hidden="true" />
                连续答对
              </dt>
              <dd>
                {progress.currentStreak} <span>题</span>
              </dd>
            </div>
            <div className="stat-item">
              <dt>
                <Target size={20} aria-hidden="true" />
                累计答题
              </dt>
              <dd>
                {progress.totalAnswered} <span>题</span>
              </dd>
            </div>
            <div className="stat-item">
              <dt>
                <CircleCheck size={20} aria-hidden="true" />
                累计答对
              </dt>
              <dd>
                {progress.totalCorrect} <span>题</span>
              </dd>
            </div>
          </dl>
          <p className="progress-summary__hint">
            {progress.totalAnswered === 0
              ? '完成练习，就能点亮这里的收获。'
              : `历史最高连续答对 ${progress.bestStreak} 题。`}
          </p>
        </aside>
      </div>

      <div className="entry-grid" role="list" aria-label="学习入口">
        <article
          className="entry-card entry-card--learn"
          role="listitem"
        >
          <span className="entry-card__icon" aria-hidden="true">
            <BookOpen size={30} />
          </span>
          <div>
            <p className="entry-card__label">先理解</p>
            <h2>学习方法</h2>
            <p>用数位和拆分步骤，一步一步看懂怎么算。</p>
          </div>
          <button
            className="button button--primary"
            type="button"
            onClick={() => onNavigate('learn')}
          >
            开始学习
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </article>

        <article
          className="entry-card entry-card--practice"
          role="listitem"
        >
          <span className="entry-card__icon" aria-hidden="true">
            <Flag size={30} />
          </span>
          <div>
            <p className="entry-card__label">再挑战</p>
            <h2>闯关练习</h2>
            <p>选择喜欢的题型，在一道道练习中巩固新本领。</p>
          </div>
          <button
            className="button button--accent"
            type="button"
            onClick={() => onNavigate('practice')}
          >
            开始闯关
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </article>
      </div>

      <section className="topic-section" aria-labelledby="topic-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">学习地图</p>
            <h2 id="topic-title">四种题型，选一个出发</h2>
          </div>
          <p>
            每种题型都可以先学方法，也可以直接练一练。
          </p>
        </div>

        <div className="topic-grid" role="list">
          {learningTopics.map(
            ({ id, title, description, accent, icon: Icon }) => {
              const topicProgress = progress.byType[id]
              const accuracy =
                topicProgress.answered === 0
                  ? 0
                  : Math.round(
                      (topicProgress.correct / topicProgress.answered) *
                        100,
                    )

              return (
                <article
                  className="topic-card"
                  data-accent={accent}
                  key={id}
                  role="listitem"
                >
                  <div className="topic-card__heading">
                    <span className="topic-card__icon" aria-hidden="true">
                      <Icon size={24} strokeWidth={2.5} />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </div>

                  <div className="topic-progress">
                    <div className="topic-progress__label">
                      <span>
                        {topicProgress.answered === 0
                          ? '待开始'
                          : `答对 ${topicProgress.correct} / ${topicProgress.answered} 题`}
                      </span>
                      <span>{accuracy}%</span>
                    </div>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label={`${title}答题正确率`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={accuracy}
                    >
                      <span style={{ width: `${accuracy}%` }} />
                    </div>
                  </div>

                  <div className="topic-card__actions">
                    <button
                      className="topic-action"
                      type="button"
                      onClick={() => onNavigate('learn', id)}
                      aria-label={`学习${title}的方法`}
                    >
                      <Brain size={17} aria-hidden="true" />
                      学方法
                    </button>
                    <button
                      className="topic-action topic-action--practice"
                      type="button"
                      onClick={() => onNavigate('practice', id)}
                      aria-label={`练习${title}`}
                    >
                      去练习
                      <ArrowRight size={17} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              )
            },
          )}
        </div>
      </section>
    </section>
  )
}
