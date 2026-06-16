import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import NavBar from './NavBar'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 pb-20 sm:pb-8 animate-[slide-up_200ms_ease-out]">
        <Outlet />
      </main>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-bg/90 backdrop-blur-md border-t border-surface/30 z-40">
        <div className="flex justify-center py-2">
          <NavBar />
        </div>
      </div>
      <Footer />
    </div>
  )
}
