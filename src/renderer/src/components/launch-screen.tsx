import { useEffect, useState } from 'react'

export function LaunchScreen() {
  const [dots, setDots] = useState('')
  const [status, setStatus] = useState('Initializing')

  useEffect(() => {
    // Animate loading dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    // Simulate initialization steps
    const statusTimeout1 = setTimeout(() => setStatus('Loading SMTP configuration'), 800)
    const statusTimeout2 = setTimeout(() => setStatus('Checking authentication'), 1600)
    const statusTimeout3 = setTimeout(() => setStatus('Preparing workspace'), 2400)

    return () => {
      clearInterval(dotsInterval)
      clearTimeout(statusTimeout1)
      clearTimeout(statusTimeout2)
      clearTimeout(statusTimeout3)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col items-center space-y-8">
        {/* Logo/Brand */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* App Name */}
        <div className="text-center">
          <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
            PayFlow
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Payroll Management System</p>
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400"></div>
          </div>

          {/* Status Text */}
          <div className="h-6 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {status}
              <span className="inline-block w-8 text-left">{dots}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64">
          <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full animate-progress rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
