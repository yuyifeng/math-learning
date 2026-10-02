import { Calculator, Home, Map, Trophy } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import type { AppPage, NavigateToPage } from '../types/navigation'

interface AppShellProps {
  activePage: AppPage
  children: ReactNode
  onNavigate: NavigateToPage
}

const navigationItems = [
  { page: 'home', label: '首页', icon: Home },
  { page: 'learn', label: '学习方法', icon: Calculator },
  { page: 'practice', label: '闯关练习', icon: Map },
  { page: 'summary', label: '练习总结', icon: Trophy },
] as const

export function AppShell({
  activePage,
  children,
  onNavigate,
}: AppShellProps) {
  const mainRef = useRef<HTMLElement>(null)
  const previousPage = useRef(activePage)

  useEffect(() => {
    if (previousPage.current !== activePage) {
      mainRef.current?.focus({ preventScroll: true })
      previousPage.current = activePage
    }
  }, [activePage])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>

      <header className="app-header">
        <button
          className="brand"
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="返回数学小乐园首页"
        >
          <span className="brand__mark" aria-hidden="true">
            10
          </span>
          <span>数学小乐园</span>
        </button>

        <nav className="main-nav" aria-label="主要导航">
          {navigationItems.map(({ page, label, icon: Icon }) => (
            <button
              className="nav-button"
              data-active={activePage === page}
              type="button"
              key={page}
              onClick={() => onNavigate(page)}
              aria-current={activePage === page ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={2.4} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main
        className="app-main"
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        {children}
      </main>

      <footer className="app-footer">
        <p>每天练一点，计算更轻松。</p>
      </footer>
    </div>
  )
}
