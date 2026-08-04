import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'arrow'
  | 'bookmark'
  | 'briefcase'
  | 'calendar'
  | 'check'
  | 'chevron'
  | 'external'
  | 'link'
  | 'lock'
  | 'mail'
  | 'inbox'
  | 'plus'
  | 'refresh'
  | 'search'
  | 'shield'
  | 'spark'
  | 'users'

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  bookmark: <path d="M6 4h12v16l-6-4-6 4V4Z" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5h6v2M3 12h18M10 12v2h4v-2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />,
  link: <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 4h16l2 10v6H2v-6L4 4Z" />
      <path d="M2 14h6l2 3h4l2-3h6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  refresh: <path d="M20 7v5h-5M4 17v-5h5M6.1 9a7 7 0 0 1 11.6-2L20 9M4 15l2.3 2A7 7 0 0 0 18 15" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  shield: <path d="M12 3 4 6v5c0 5 3.4 8.3 8 10 4.6-1.7 8-5 8-10V6l-8-3Zm-3 9 2 2 4-4" />,
  spark: <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5M15 14c3.5 0 6 1.8 6 4.5" />
    </>
  ),
}

interface AppIconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}

export function AppIcon({ name, size = 20, ...props }: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
