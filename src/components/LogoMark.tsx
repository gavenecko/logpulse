export default function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="18" fill="#6366f1" />
      <path d="M17 21h30M17 43h30M15 32h10l5-9 6 18 5-9h8" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
