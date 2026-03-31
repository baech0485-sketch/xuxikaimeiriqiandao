'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  {
    key: 'home',
    label: '首页',
    href: '/',
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" fill={active ? 'var(--duo-green-dark)' : 'none'} />
      </svg>
    ),
  },
  {
    key: 'calendar',
    label: '日历',
    href: '/calendar',
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <path d="M3 10h18" />
        {active && (
          <>
            <rect x="7" y="14" width="3" height="3" fill="var(--duo-green-dark)" stroke="none" />
            <rect x="14" y="14" width="3" height="3" fill="var(--duo-green-dark)" stroke="none" />
          </>
        )}
      </svg>
    ),
  },
  {
    key: 'growth',
    label: '成长',
    href: '/growth',
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 20h16" />
        <path d="M6 16l4-4 3 3 5-7" strokeWidth={active ? '3' : '2'} />
        {active && <circle cx="17" cy="9" r="2" fill="var(--duo-green)" stroke="none" />}
      </svg>
    ),
  },
  {
    key: 'profile',
    label: '我的',
    href: '/adopt',
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-duo-border bg-duo-surface pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.key}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center py-2"
            >
              <motion.div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? 'bg-duo-green-light text-duo-green'
                    : 'text-duo-text-secondary hover:bg-duo-bg'
                }`}
                whileTap={{ scale: 0.92 }}
              >
                {item.icon(isActive)}
              </motion.div>
              <span
                className={`mt-1 text-xs font-bold ${
                  isActive ? 'text-duo-green' : 'text-duo-text-secondary'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-duo-green"
                  layoutId="bottomNavIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
