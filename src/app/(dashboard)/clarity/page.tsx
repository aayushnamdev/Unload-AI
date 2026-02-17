'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { FocusView } from '@/components/views/FocusView'
import { OrganizerView } from '@/components/views/OrganizerView'
import { motion, AnimatePresence } from 'framer-motion'
import { Focus, ListChecks, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<'focus' | 'organizer'>('focus')
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative h-full pb-16 md:pb-0">
        <div className="max-w-[800px] mx-auto min-h-full">
          <AnimatePresence mode="wait">
            {currentView === 'focus' ? (
              <motion.div
                key="focus"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <FocusView />
              </motion.div>
            ) : (
              <motion.div
                key="organizer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <OrganizerView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border/40 flex items-center justify-around px-4 h-16 safe-area-pb">
        <button
          onClick={() => setCurrentView('focus')}
          className={`flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-all ${
            currentView === 'focus'
              ? 'text-primary'
              : 'text-muted-foreground/50'
          }`}
        >
          <Focus className="w-5 h-5" />
          <span className="text-[10px] font-medium">Focus</span>
        </button>

        <button
          onClick={() => setCurrentView('organizer')}
          className={`flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-all ${
            currentView === 'organizer'
              ? 'text-primary'
              : 'text-muted-foreground/50'
          }`}
        >
          <ListChecks className="w-5 h-5" />
          <span className="text-[10px] font-medium">Organize</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-6 py-1 rounded-xl text-muted-foreground/40 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Sign Out</span>
        </button>
      </nav>
    </div>
  )
}
