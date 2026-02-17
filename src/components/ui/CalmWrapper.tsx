import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CalmWrapperProps {
    children: ReactNode
    className?: string
}

export function CalmWrapper({ children, className }: CalmWrapperProps) {
    return (
        <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center selection:bg-blue-100 selection:text-blue-900">
            <main className={cn(
                "w-full max-w-2xl px-6 py-12 md:py-20 flex flex-col gap-12",
                "animate-in fade-in duration-700 slide-in-from-bottom-4",
                className
            )}>
                {children}
            </main>
        </div>
    )
}
