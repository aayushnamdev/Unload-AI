'use client'

import { GlassCard } from '@/components/layout/GlassCard'
import { cn } from '@/lib/utils'

interface ProcessingLoaderProps {
  message?: string
  submessage?: string
}

export function ProcessingLoader({
  message = 'Processing your thoughts...',
  submessage = 'Finding clarity in the chaos',
}: ProcessingLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <GlassCard variant="strong" padding="xl" className="max-w-md text-center">
        {/* Animated loader */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-200/30" />

          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />

          {/* Inner pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full animate-pulse" />
          </div>

          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-3 h-3"
              style={{
                animation: `orbit 2s linear infinite`,
                animationDelay: `${i * 0.66}s`,
              }}
            >
              <div className="w-3 h-3 bg-teal-400 rounded-full" />
            </div>
          ))}
        </div>

        {/* Message */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2 animate-fade-pulse">
          {message}
        </h3>
        <p className="text-sm text-gray-600 animate-fade-pulse" style={{ animationDelay: '0.2s' }}>
          {submessage}
        </p>

        {/* Breathing indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full bg-blue-400',
                'animate-breath-dot'
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </GlassCard>

      <style jsx>{`
        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateX(40px) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateX(40px) rotate(-360deg);
          }
        }

        @keyframes fade-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes breath-dot {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .animate-fade-pulse {
          animation: fade-pulse 2s ease-in-out infinite;
        }

        .animate-breath-dot {
          animation: breath-dot 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
