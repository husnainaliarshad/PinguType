import NavBar from './NavBar'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-surface/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <a href="/" className="text-xl font-bold text-primary tracking-tight">
          PinguType
        </a>
        <div className="hidden sm:block">
          <NavBar />
        </div>
      </div>
    </header>
  )
}
