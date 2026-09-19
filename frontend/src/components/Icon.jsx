export default function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  if (name === 'bolt') {
    return (
      <svg {...common}>
        <path d="M13 2 4 14h7l-1 8 10-13h-7l0-7z" />
      </svg>
    )
  }
  if (name === 'users') {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7" r="3" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 4.13a3 3 0 0 1 0 5.75" />
      </svg>
    )
  }
  if (name === 'share') {
    return (
      <svg {...common}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 13.5 6.8 4" />
        <path d="m15.4 6.5-6.8 4" />
      </svg>
    )
  }
  if (name === 'menu') {
    return (
      <svg {...common}>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )
  }
  if (name === 'close') {
    return (
      <svg {...common}>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    )
  }
  if (name === 'eye') {
    return (
      <svg {...common}>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  if (name === 'eye-off') {
    return (
      <svg {...common}>
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4" />
        <path d="M9.9 5.1A11 11 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-3.2 3.8" />
        <path d="M6.1 6.1C3.8 7.8 2 12 2 12s4 7 10 7a10 10 0 0 0 4.2-.9" />
      </svg>
    )
  }
  if (name === 'smile') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9h.01M15 9h.01" />
      </svg>
    )
  }
  if (name === 'devices') {
    return (
      <svg {...common}>
        <rect x="7" y="3" width="14" height="10" rx="1.5" />
        <path d="M11 13v2H4a1 1 0 0 0-1 1v2h12" />
        <rect x="2" y="16" width="8" height="5" rx="1" />
      </svg>
    )
  }
  if (name === 'link') {
    return (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93" />
        <path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.43a5 5 0 0 0 7.07 7.07L14 18.07" />
      </svg>
    )
  }
  if (name === 'shield') {
    return (
      <svg {...common}>
        <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }
  if (name === 'chart') {
    return (
      <svg {...common}>
        <path d="M4 19h16" />
        <path d="M7 16V9" />
        <path d="M12 16V5" />
        <path d="M17 16v-6" />
      </svg>
    )
  }
  if (name === 'sliders') {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="2.2" />
        <circle cx="15" cy="17" r="2.2" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}
