'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { MAX_VOICE_RECORDING_DURATION } from '@/lib/constants'

interface VoiceCaptureProps {
  onTranscriptionComplete: (transcription: string, audioUrl: string) => void
  currentTranscription?: string
  disabled?: boolean
}

export function VoiceCapture({
  onTranscriptionComplete,
  currentTranscription,
  disabled = false
}: VoiceCaptureProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    setError(null)
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          // Auto-stop at max duration
          if (newTime >= MAX_VOICE_RECORDING_DURATION) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)
    } catch (err: any) {
      console.error('Error accessing microphone:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true)
        setError('We need microphone access to record. Please enable it in your browser settings.')
      } else {
        setError('Could not access your microphone. Please check your device settings.')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Transcription failed')
      }

      const { transcription, audioUrl } = await response.json()
      onTranscriptionComplete(transcription, audioUrl)
    } catch (err: any) {
      console.error('Transcription error:', err)
      setError(err.message || 'We couldn\'t transcribe that. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (permissionDenied) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-700 font-light text-lg mb-2">
          Microphone access needed
        </p>
        <p className="text-gray-500 text-sm font-light max-w-sm mx-auto leading-relaxed">
          Please enable microphone permissions in your browser settings, then refresh the page.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {/* Current transcription display */}
      {currentTranscription && !isRecording && !isTranscribing && (
        <div className="w-full mb-8 p-6 bg-blue-50/30 backdrop-blur-sm border border-blue-100/50 rounded-2xl animate-fade-in">
          <p className="text-sm text-blue-600 font-light mb-2 text-center">Your transcription:</p>
          <p className="text-gray-700 font-light leading-relaxed text-center">
            {currentTranscription.substring(0, 150)}
            {currentTranscription.length > 150 && '...'}
          </p>
          <p className="text-xs text-gray-400 mt-3 text-center font-light">
            Switch to Text mode to edit, or record more
          </p>
        </div>
      )}

      {/* Recording button - Calm and inviting */}
      <div className="relative mb-8">
        {/* Gentle breathing pulse during recording */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-blue-200/30 animate-breathe" />
            <div className="absolute inset-0 rounded-full bg-blue-100/20 animate-breathe-delayed" />
          </div>
        )}

        <button
          onClick={toggleRecording}
          disabled={disabled || isTranscribing}
          className={cn(
            'relative w-40 h-40 sm:w-48 sm:h-48 rounded-full',
            'flex flex-col items-center justify-center',
            'transition-all duration-700 ease-out',
            'border-2',
            'focus:outline-none focus:ring-4 focus:ring-blue-200/50',
            isTranscribing && 'cursor-wait opacity-60',
            disabled && 'cursor-not-allowed opacity-40',
            !isRecording && !isTranscribing && !disabled && 'hover:scale-105 active:scale-95',
            isRecording
              ? 'bg-gradient-to-br from-blue-400 to-blue-500 border-blue-600 shadow-2xl shadow-blue-300/40 scale-105'
              : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-xl shadow-gray-300/30'
          )}
        >
          {isTranscribing ? (
            // Calm thinking animation
            <div className="flex flex-col items-center animate-fade-in">
              <div className="flex gap-2 mb-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-gentle" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.4s' }} />
              </div>
              <p className="text-xs text-gray-500 font-light">Transcribing...</p>
            </div>
          ) : isRecording ? (
            // Recording state - calm and clear
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 mb-3 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center animate-gentle-pulse">
                <div className="w-4 h-4 bg-blue-600 rounded-sm" />
              </div>
              <p className="text-2xl font-light text-white mb-1">{formatTime(recordingTime)}</p>
              <p className="text-xs text-white/80 font-light">Tap to stop</p>
            </div>
          ) : (
            // Ready to record - inviting
            <div className="flex flex-col items-center animate-fade-in">
              <svg className="w-16 h-16 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-sm text-gray-600 font-light">Tap to start</p>
            </div>
          )}
        </button>
      </div>

      {/* Status message - Warm and reassuring */}
      <div className="text-center min-h-[60px] mb-6">
        {isTranscribing ? (
          <div className="animate-fade-in">
            <p className="text-gray-600 font-light text-sm">
              Processing your voice...
            </p>
            <p className="text-gray-400 text-xs font-light mt-1">
              This usually takes just a few seconds
            </p>
          </div>
        ) : isRecording ? (
          <div className="animate-fade-in">
            <p className="text-gray-700 font-light text-base">
              Listening...
            </p>
            <p className="text-gray-400 text-xs font-light mt-1">
              Speak naturally, take your time
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="text-gray-600 font-light text-sm">
              Ready when you are
            </p>
            <p className="text-gray-400 text-xs font-light mt-1">
              Up to {Math.floor(MAX_VOICE_RECORDING_DURATION / 60)} minutes
            </p>
          </div>
        )}
      </div>

      {/* Error message - Gentle styling */}
      {error && (
        <div className="w-full max-w-md bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-700 px-5 py-4 rounded-2xl text-sm font-light animate-fade-in shadow-sm">
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.15;
          }
        }

        @keyframes breathe-delayed {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.1;
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes gentle-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }

        .animate-breathe-delayed {
          animation: breathe-delayed 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 1.4s ease-in-out infinite;
        }

        .animate-gentle-pulse {
          animation: gentle-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
