import { useState } from 'react'
import type { ReactElement } from 'react'
import { AppShell } from './components/AppShell'
import { HomePage } from './pages/HomePage'
import { LearnPage } from './pages/LearnPage'
import { PracticePage } from './pages/PracticePage'
import { SummaryPage } from './pages/SummaryPage'
import type { LearningProgress } from './domain/progress'
import {
  loadLearningProgress,
  saveLearningProgress,
} from './domain/progressStorage'
import type {
  AppPage,
  LearningTopic,
  NavigateToPage,
  PracticeRoundSummary,
  PracticeSetup,
} from './types/navigation'

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('home')
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic>()
  const [practiceSetup, setPracticeSetup] = useState<PracticeSetup>()
  const [practiceRoundKey, setPracticeRoundKey] = useState(0)
  const [roundSummary, setRoundSummary] =
    useState<PracticeRoundSummary>()
  const [learningProgress, setLearningProgress] =
    useState<LearningProgress>(loadLearningProgress)

  const handleNavigate: NavigateToPage = (page, topic) => {
    setActivePage(page)
    if (page === 'learn') {
      setSelectedTopic(topic)
    }
    if (page === 'practice') {
      setSelectedTopic(topic)
      setPracticeSetup(
        topic
          ? {
              practiceType: topic,
              difficulty: 'easy',
            }
          : undefined,
      )
      setPracticeRoundKey((current) => current + 1)
    }
  }

  const handleRoundComplete = (summary: PracticeRoundSummary) => {
    setRoundSummary(summary)
    setActivePage('summary')
  }

  const handleRetry = (setup: PracticeSetup) => {
    setPracticeSetup(setup)
    setSelectedTopic(
      setup.practiceType === 'mixed' ? undefined : setup.practiceType,
    )
    setPracticeRoundKey((current) => current + 1)
    setActivePage('practice')
  }

  const handleBackToPracticeSelection = () => {
    setPracticeSetup(undefined)
    setSelectedTopic(undefined)
    setPracticeRoundKey((current) => current + 1)
    setActivePage('practice')
  }

  const handleProgressChange = (progress: LearningProgress) => {
    setLearningProgress(progress)
    saveLearningProgress(progress)
  }

  const pages: Record<AppPage, ReactElement> = {
    home: (
      <HomePage
        progress={learningProgress}
        onNavigate={handleNavigate}
      />
    ),
    learn: (
      <LearnPage
        selectedTopic={selectedTopic}
        onNavigate={handleNavigate}
      />
    ),
    practice: (
      <PracticePage
        key={practiceRoundKey}
        selectedTopic={selectedTopic}
        initialSetup={practiceSetup}
        initialProgress={learningProgress}
        onNavigate={handleNavigate}
        onComplete={handleRoundComplete}
        onProgressChange={handleProgressChange}
      />
    ),
    summary: (
      <SummaryPage
        summary={roundSummary}
        onNavigate={handleNavigate}
        onRetry={handleRetry}
        onBackToSelection={handleBackToPracticeSelection}
      />
    ),
  }

  return (
    <AppShell activePage={activePage} onNavigate={handleNavigate}>
      {pages[activePage]}
    </AppShell>
  )
}
