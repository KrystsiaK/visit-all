interface LogoMarkProps {
  className?: string;
}

export const LogoMark = ({ className = "" }: LogoMarkProps) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <rect width="64" height="64" rx="14" fill="#F5F1E8" />
    <rect x="6" y="6" width="24" height="24" rx="4" fill="#FF1B0A" />
    <rect x="30" y="6" width="28" height="52" rx="4" fill="#FFE94D" />
    <rect x="6" y="30" width="24" height="28" rx="4" fill="#1122FF" />
    <path d="M43.5 19V45" stroke="#111111" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M30.5 32H56.5" stroke="#111111" strokeWidth="4.5" strokeLinecap="round" />
  </svg>
);
