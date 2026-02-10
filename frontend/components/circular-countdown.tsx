'use client'

import React, { useState, useEffect } from 'react'

interface CircularCountdownProps {
  duration: number
  isActive: boolean
  onComplete?: () => void
}

export function CircularCountdown({
  duration,
  isActive,
  onComplete
}: CircularCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isCompleted, setIsCompleted] = useState(false)

  const circumference = 2 * Math.PI * 85
  const progress = (timeLeft / duration) * circumference
  const strokeDashoffset = circumference - progress

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration)
      setIsCompleted(false)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsCompleted(true)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, duration, onComplete])

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* SVG Circle */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 200"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Defs for gradient */}
          <defs>
            <linearGradient
              id="countdownGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="#334155"
            strokeWidth="6"
          />

          {/* Progress circle with gradient */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="url(#countdownGradient)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={isCompleted ? '' : 'transition-all duration-300'}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center">
          {isCompleted ? (
            <div className="text-center">
              <div className="text-6xl font-bold text-white">Done!</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-8xl font-bold text-white font-mono tracking-wider">
                {timeLeft}
              </div>
              <div className="text-sm text-slate-400 mt-2">seconds</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
