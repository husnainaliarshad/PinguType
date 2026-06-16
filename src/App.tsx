import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

const HomePage = lazy(() => import('@/pages/HomePage'))
const TypingPage = lazy(() => import('@/pages/TypingPage'))
const ResultsPage = lazy(() => import('@/pages/ResultsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="practice" element={<TypingPage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
