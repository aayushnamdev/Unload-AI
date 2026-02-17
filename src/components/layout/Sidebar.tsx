'use client'

import { Focus, ListChecks, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
    currentView: 'focus' | 'organizer'
    onViewChange: (view: 'focus' | 'organizer') => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
    const supabase = createClient()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <aside className="w-[200px] md:w-[240px] border-r border-border/40 h-screen bg-background flex flex-col pt-8 pb-4">
            {/* Search / User placeholder from sketch */}
            <div className="px-4 mb-6">
                {/* Could be User Profile or nothing for now */}
                {/* Sketch shows nothing specific at very top, but "Focus" starts the list */}
            </div>

            <nav className="flex-1 px-2 space-y-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewChange('focus')}
                    className={cn(
                        "w-full justify-start text-[15px] font-medium tracking-wide",
                        currentView === 'focus'
                            ? "bg-secondary/50 text-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground"
                    )}
                >
                    <Focus className="mr-2 h-4 w-4" />
                    Focus
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewChange('organizer')}
                    className={cn(
                        "w-full justify-start text-[15px] font-medium tracking-wide",
                        currentView === 'organizer'
                            ? "bg-secondary/50 text-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground"
                    )}
                >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Organize
                </Button>
            </nav>


            <div className="mt-auto px-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 transition-colors"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </aside>
    )
}
