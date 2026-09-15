import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function MailIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>;
}

export function SettingsIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 8.95 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H3v-4h.09A1.7 1.7 0 0 0 4.6 8.95a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3h4v.09A1.7 1.7 0 0 0 15.05 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06L19.82 7l-.06.06A1.7 1.7 0 0 0 19.4 9c.23.62.83 1 1.49 1H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></svg>;
}

export function CalendarIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18M12 14v4M10 16h4"/></svg>;
}

export function ChevronIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m15 18-6-6 6-6"/></svg>;
}

export function MoreIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></svg>;
}

export function ExternalIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>;
}

export function RefreshIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.5 9A7 7 0 0 0 6 6.5L4 9m2 6a7 7 0 0 0 12 2.5L20 15"/></svg>;
}

export function SearchIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
}

export function SunIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></svg>;
}

export function MoonIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20.5 15.4A8.5 8.5 0 0 1 8.6 3.5 8.5 8.5 0 1 0 20.5 15.4Z"/></svg>;
}

export function DeviceIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="3" width="16" height="13" rx="2"/><path d="M8 21h8M12 16v5"/></svg>;
}
