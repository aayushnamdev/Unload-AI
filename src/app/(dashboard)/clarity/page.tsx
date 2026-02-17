'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { FocusView } from '@/components/views/FocusView'
import { OrganizerView } from '@/components/views/OrganizerView'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<'focus' | 'organizer'>('focus')

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop/Tablet */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-full">
        <div className="max-w-[800px] mx-auto min-h-full">
          <AnimatePresence mode="wait">
            {currentView === 'focus' ? (
              <motion.div
                key="focus"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }} // Subtle scale for "app-like" feel
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
    </div>
  )
}
