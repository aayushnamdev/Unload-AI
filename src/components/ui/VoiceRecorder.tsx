'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
    onTranscription: (text: string) => void
    isProcessing?: boolean
    compact?: boolean
}

// Waveform Component
function AudioWaveform({ stream }: { stream: MediaStream }) {
    const [data, setData] = useState<number[]>([0, 0, 0, 0, 0])

    useEffect(() => {
        const audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 32
        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        let animationId: number

        const update = () => {
            analyser.getByteFrequencyData(dataArray)

            // Extract 5 distinct frequency bands
            const bands = [
                dataArray[0],
                dataArray[1],
                dataArray[2],
                dataArray[3],
                dataArray[4]
            ].map(val => Math.max(10, val / 255 * 100)) // Normalize to height (min 10%)

            setData(bands)
            animationId = requestAnimationFrame(update)
        }

        update()

        return () => {
            cancelAnimationFrame(animationId)
            audioContext.close()
        }
    }, [stream])

    return (
        <div className="flex items-center justify-center gap-1.5 h-12">
            {data.map((h, i) => (
                <motion.div
                    key={i}
                    animate={{ height: `${h}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-2 bg-primary rounded-full opacity-80"
                />
            ))}
        </div>
    )
}

export function VoiceRecorder({ onTranscription, isProcessing = false, compact = false }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [micError, setMicError] = useState<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    const handleToggle = async () => {
        if (isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop())
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                await transcribeAudio(audioBlob)
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch {
            setMicError('Microphone access denied. Check browser permissions.')
            setTimeout(() => setMicError(null), 4000)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const transcribeAudio = async (audioBlob: Blob) => {
        setIsTranscribing(true)
        try {
            const formData = new FormData()
            formData.append('audio', audioBlob, 'recording.webm')

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const { transcription } = await response.json()
                if (transcription) {
                    onTranscription(transcription)
                }
            }
        } catch (err) {
            console.error('Transcription failed', err)
        } finally {
            setIsTranscribing(false)
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // Compact variant — small inline mic button, no label
    if (compact) {
        return (
            <div className="flex flex-col items-center gap-1">
            <motion.button
                onClick={handleToggle}
                disabled={isTranscribing || isProcessing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    backgroundColor: isRecording ? "#FFFFFF" : "#007AFF",
                    boxShadow: isRecording
                        ? "0 2px 12px rgba(0,122,255,0.1), inset 0 0 0 1.5px rgba(0,122,255,0.2)"
                        : "0 4px 16px -4px rgba(0,122,255,0.45)",
                }}
                className="relative flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                title={isRecording ? "Stop recording" : "Record voice"}
            >
                {isTranscribing || isProcessing ? (
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : isRecording ? (
                    <svg className="w-4 h-4 text-[#007AFF]" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 3.01-2.69 5.42-6 5.42S5 14.01 5 11h2c0 1.9 1.52 3.48 3.5 3.48 1.98 0 3.5-1.58 3.5-3.48h2z" />
                        <path d="M11 18h2v3h-2z" />
                    </svg>
                )}
            </motion.button>
            {micError && (
                <p className="text-[10px] text-destructive text-center max-w-[120px] leading-tight">{micError}</p>
            )}
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center w-full py-8">
            <motion.button
                onClick={handleToggle}
                disabled={isTranscribing || isProcessing}
                layout
                initial={{ borderRadius: "100px", width: "64px", height: "64px" }}
                animate={{
                    width: isRecording ? "140px" : "64px",
                    height: "64px",
                    borderRadius: "100px",
                    backgroundColor: isRecording ? "#FFFFFF" : "#007AFF",
                    boxShadow: isRecording
                        ? "0 4px 20px rgba(0,122,255,0.12)"
                        : "0 10px 40px -10px rgba(0,122,255,0.4)"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "relative flex items-center justify-center transition-colors duration-500 border border-transparent",
                    isRecording && "border-primary/20"
                )}
            >
                {/* Audio Visualizer Pulse */}
                <AnimatePresence mode="wait">
                    {isRecording && mediaRecorderRef.current ? (
                        <motion.div
                            key="waveform"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <AudioWaveform stream={mediaRecorderRef.current.stream} />
                        </motion.div>
                    ) : (
                        /* Icon / State */
                        <motion.div
                            key="icon"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative z-10 text-white"
                        >
                            {isTranscribing || isProcessing ? (
                                <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 3.01-2.69 5.42-6 5.42S5 14.01 5 11h2c0 1.9 1.52 3.48 3.5 3.48 1.98 0 3.5-1.58 3.5-3.48h2z" />
                                    <path d="M11 18h2v3h-2z" />
                                </svg>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            <div className="mt-4 text-center h-8">
                <AnimatePresence mode="wait">
                    {isRecording ? (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-primary font-medium tracking-wide text-sm"
                        >
                            I&apos;m listening.
                        </motion.p>
                    ) : isTranscribing ? (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-muted-foreground font-medium tracking-wide text-sm"
                        >
                            Transcribing...
                        </motion.p>
                    ) : isProcessing ? (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-muted-foreground font-medium tracking-wide text-sm"
                        >
                            Thinking...
                        </motion.p>
                    ) : (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-muted-foreground font-medium text-sm"
                        >
                            Tap to capture
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
            {micError && (
                <p className="text-xs text-destructive text-center mt-1">{micError}</p>
            )}
        </div>
    )
}
