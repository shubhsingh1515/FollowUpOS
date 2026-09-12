import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MarketingFooter() {
  return (
    <footer className="bg-[#060709] border-t border-white/[0.08] text-zinc-400 text-xs py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Callout CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Every Lead Deserves a Timely Follow-Up.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Stop losing high-intent prospects to delays and forgotten notes. Turn more conversations into closed deals with FollowUpOS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/register">
              <Button className="bg-white text-black hover:bg-zinc-200 text-xs font-bold h-10 px-6 rounded-xl shadow-lg transition-transform hover:scale-105">
                Start Free Trial <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-xs h-10 px-5 rounded-xl">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-6">
          <div className="col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-white tracking-tight">FollowUpOS</span>
            </Link>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              The AI sales execution system for high-ticket service businesses, marketing agencies, and consultancies.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SOC2 Compliant Architecture · 99.9% SLA</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">Product</div>
            <ul className="space-y-2">
              <li><Link to="/services" className="hover:text-white transition-colors">Services & Solutions</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
              <li><Link to="/integrations-showcase" className="hover:text-white transition-colors">Integrations</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">Solutions</div>
            <ul className="space-y-2">
              <li><Link to="/services" className="hover:text-white transition-colors">Digital Agencies</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Consultancies</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Real Estate Brokers</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Medical Clinics</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-white uppercase text-[11px] font-mono tracking-wider">Account</div>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Free Account</Link></li>
              <li><Link to="/today" className="hover:text-white transition-colors">Sales Cockpit Demo</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} FollowUpOS Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-zinc-400 cursor-pointer">Security Safeguards</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
