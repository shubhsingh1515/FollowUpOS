import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sparkles, ArrowRight, Menu, X, ChevronDown, Bot, Zap,
  Layers, ShieldCheck, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setServicesDropdownOpen(false)
  }, [location.pathname])

  const navLinks = [
    { label: 'Services & Solutions', href: '/services', badge: 'New' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Integrations', href: '/integrations-showcase' },
    { label: 'Pricing', href: '/pricing' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-border shadow-md py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
              FollowUpOS
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
              v2.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full px-4 py-1.5 border border-border bg-card/50 backdrop-blur-md">
          <Link
            to="/"
            className={cn(
              'text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors',
              location.pathname === '/'
                ? 'text-primary bg-primary/10 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            Overview
          </Link>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5',
                  isActive
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-primary/20 text-primary font-semibold">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/today">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8.5 rounded-full px-4 py-2 gap-1.5">
                Go to Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8.5 rounded-full px-4 py-2 shadow-sm shadow-primary/20 gap-1.5 transition-all hover:scale-[1.02]"
                >
                  Start Free <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pt-3 pb-6 space-y-3 animate-slide-up shadow-md">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium',
                location.pathname === '/' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              Overview
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between',
                  location.pathname === link.href ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Link to="/today">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9 py-2 rounded-xl">
                  Go to Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted text-xs h-9 rounded-xl">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 rounded-xl shadow-sm shadow-primary/20">
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
