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
            <a href="https://pump.fun/coin/DeHPvEBotsLezzFaL65QCzpcH78AFaD9J6aobExTpump" target="_blank" rel="noopener noreferrer">
              <Button size="xl" className="rounded-full px-12 py-7 text-lg font-medium bg-[#10B981] hover:bg-[#059669] text-white shadow-xl shadow-green-600/20 transition-transform hover:scale-105">
                Buy on pump.fun
              </Button>
            </a>
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


      {/* Token Utility / Revenue Model */}
      <section className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Powered by $UNLOAD</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Real utility. Sustainable growth. The $UNLOAD token is the heart of our ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl text-blue-900 -mr-8 -mt-8 transition-transform group-hover:scale-110">1</div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl mb-6 shadow-lg shadow-blue-500/30">🧠</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Premium AI Access</h3>
                <p className="text-slate-600 leading-relaxed">
                  Holders get exclusive access to our most advanced models: <span className="font-semibold text-blue-700">Claude Opus 4.6, Gemini 3 Pro, and GPT 5.2</span>.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl text-emerald-900 -mr-8 -mt-8 transition-transform group-hover:scale-110">2</div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl mb-6 shadow-lg shadow-emerald-500/30">🔥</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Deflationary Buybacks</h3>
                <p className="text-slate-600 leading-relaxed">
                  We use a percentage of all subscription revenue to buy back and burn $UNLOAD tokens, constantly reducing supply.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-purple-50 border border-purple-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl text-purple-900 -mr-8 -mt-8 transition-transform group-hover:scale-110">3</div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center text-2xl mb-6 shadow-lg shadow-purple-500/30">🗳️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Governance</h3>
                <p className="text-slate-600 leading-relaxed">
                  The community drives the product. Vote on roadmap priorities, new features, and AI model integrations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 px-6 bg-[#F2F5F7] border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Roadmap</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Our path to revolutionizing mental clarity.
            </p>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">

            {/* Phase 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <svg className="fill-white" xmlns="http://www.w3.org/2000/svg" width="12" height="10">
                  <path fillRule="nonzero" d="M10.422 1.257 4.655 7.025 2.553 4.923A.916.916 0 0 0 1.257 6.22l2.75 2.75a.916.916 0 0 0 1.296 0l6.415-6.416a.916.916 0 0 0-1.296-1.296Z" />
                </svg>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">Phase 1: Genesis</div>
                  <time className="font-caveat font-medium text-blue-500">Completed</time>
                </div>
                <div className="text-slate-500 text-sm">Concept validation, MVP development, branding identity &quot;Unload AI&quot;, and core voice-to-text engine.</div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="animate-pulse w-2.5 h-2.5 bg-white rounded-full"></span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-100">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">Phase 2: Launch</div>
                  <time className="font-caveat font-medium text-emerald-600">Current</time>
                </div>
                <div className="text-slate-500 text-sm">
                  Official launch on <span className="font-bold text-emerald-600">pump.fun</span>, community building, beta access for token holders.
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 opacity-80">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">Phase 3: Utility</div>
                  <time className="font-caveat font-medium text-slate-400">Q3 2026</time>
                </div>
                <div className="text-slate-500 text-sm">Token-gated premium features, staking for model credits, and advanced API integrations.</div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 opacity-80">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">Phase 4: Expansion</div>
                  <time className="font-caveat font-medium text-slate-400">Q4 2026</time>
                </div>
                <div className="text-slate-500 text-sm">Native iOS/Android apps, global marketing campaign, and enterprise partnerships.</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <footer className="py-12 bg-white border-t border-slate-200 text-center text-slate-500 text-sm">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="font-bold text-xl tracking-tight text-slate-800">Unload AI</div>
            <div className="flex items-center gap-6">
              <a href="https://x.com/TJ_Reborn2" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                Twitter
              </a>
              {/* Placeholder for Solana Contract */}
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-mono text-xs border border-slate-200 select-all" title="Click to copy">
                CA: DeHPvEBotsLezzFaL65QCzpcH78AFaD9J6aobExTpump
              </span>
            </div>
          </div>
          <p>© 2026 Unload AI. Built for the future.</p>
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
