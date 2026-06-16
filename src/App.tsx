import ErrorBoundary from '@/components/ui/ErrorBoundary'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TypingPage from '@/pages/TypingPage'

export default function App() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 pb-20 sm:pb-8 animate-[slide-up_200ms_ease-out]">
          <TypingPage />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
