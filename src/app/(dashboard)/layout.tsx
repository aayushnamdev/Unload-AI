import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background transition-colors duration-300">
        <div className="max-w-[800px] mx-auto min-h-screen relative">
          {children}
        </div>
      </main>
    </div>
  )
}
