'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setError('This email is already registered')
          setLoading(false)
          return
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/clarity')
          router.refresh()
        }, 1500)
      }
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F2F5F7] flex flex-col items-center justify-center p-6 text-[#303336]">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-200/60 p-10 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome aboard!</h2>
          <p className="text-slate-500">
            Your account has been created. <br /> Taking you to your clarity space...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F5F7] flex flex-col items-center justify-center p-6 font-sans text-[#303336]">

      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Unload AI</h1>
        </Link>
      </div>

      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-200/60 p-10">

        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-slate-900">Create Account</h2>
          <p className="text-sm text-slate-500 mt-2">Start your journey to clarity.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            variant="outline"
            className="w-full h-12 text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Sign up with Google
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-slate-400 uppercase font-medium">or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-lg"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-11 text-base font-medium mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  )
}
