'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F2F5F7] text-[#303336] overflow-x-hidden font-sans selection:bg-blue-100">

      {/* Navigation (Simple) */}
      <nav className="flex justify-between items-center px-6 py-6 max-w-5xl mx-auto">
        <div className="font-bold text-xl tracking-tight text-slate-800">Unload AI</div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="rounded-full px-6 font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full px-6 font-medium bg-[#007AFF] hover:bg-[#006AD4] shadow-md shadow-blue-500/20">Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900 leading-[1.1]">
            Your brain wasn&apos;t built <br /> to hold all this.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed mb-10">
            Dump your mental chaos. Get AI-powered clarity. <br className="hidden md:block" /> Focus on what actually matters today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="xl" className="rounded-full px-12 py-7 text-lg font-medium bg-[#007AFF] hover:bg-[#006AD4] shadow-xl shadow-blue-600/20 transition-transform hover:scale-105">
                Get Started Free
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" size="xl" className="rounded-full px-8 py-7 text-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/50">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visual - Tilted App Window */}
        <div className="max-w-5xl mx-auto relative perspective-2000 group">
          <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full -z-10 translate-y-20 scale-75 opacity-50"></div>

          <div className="relative bg-white rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12),0_30px_60px_-30px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden transform transition-all duration-1000 ease-out hover:scale-[1.01] hover:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.15)]">
            {/* Window Controls */}
            <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50 backdrop-blur-sm">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm"></div>
            </div>

            {/* Mock App Content */}
            {/* Dashboard Screenshot */}
            <div className="bg-slate-50 relative group cursor-pointer">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
              <img
                src="/hero-dashboard.png"
                alt="MindClear Dashboard Interface"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className="py-32 px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Designed for Focus.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Every interaction is crafted to reduce cognitive load and help you enter a state of flow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {[
              { title: "Capture Instantly", desc: "Just start typing or speaking. Unload AI captures everything and organizes it for you.", icon: "🎙️" },
              { title: "AI Processing", desc: "Our intelligent engine breaks down complex thoughts into actionable items automatically.", icon: "✨" },
              { title: "Daily Focus", desc: "Get a curated list of just 3 items every day. Accomplish what matters without the overwhelm.", icon: "🎯" }
            ].map((item, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-[#F8FAFC] border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote / Social Proof */}
      <section className="py-24 px-6 bg-[#F2F5F7] text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-2xl md:text-3xl font-medium text-slate-800 leading-normal italic mb-8">
            &quot;The most elegant way to clear your head. It&apos;s not just a todo list, it&apos;s a sanctuary for your thoughts.&quot;
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden">
              <img src="/sarah-profile.png" alt="Sarah Jenks" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-900">Sarah Jenks</div>
              <div className="text-sm text-slate-500">Product Designer</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8">
            Ready to clear your mind?
          </h2>
          <Link href="/signup">
            <Button size="xl" className="rounded-full px-16 py-8 text-xl font-medium bg-[#007AFF] hover:bg-[#006AD4] shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all duration-300">
              Start Free Trial
            </Button>
          </Link>
          <p className="mt-8 text-slate-400 text-sm">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      <footer className="py-12 bg-[#F2F5F7] border-t border-slate-200 text-center text-slate-400 text-sm">
        <p className="mb-4">© 2024 Unload AI. Inspired by the best.</p>
        <div className="flex justify-center gap-6">
          <a href="https://x.com/aayush22namdev" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </footer>

      <style jsx global>{`
        .perspective-2000 {
          perspective: 2000px;
        }
      `}</style>
    </div>
  )
}
