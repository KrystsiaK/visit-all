interface GlassPinIconProps {
  className?: string;
  accentColor?: string;
}

export function GlassPinIcon({ className, accentColor = "#1A1A1A" }: GlassPinIconProps) {
  return (
    <svg width="96" height="120" viewBox="0 0 96 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>

      <path
        d="M48 57L45.5 108C45.5 111 50.5 111 50.5 108L48 57Z"
        fill={accentColor}
      />


      <circle cx="48" cy="38" r="20.5" fill="#FFFFFF" stroke={accentColor} strokeWidth="3.8" />


      <rect x="34" y="24" width="10" height="10" fill="#2F6BFF" />
      <rect x="44" y="24" width="10" height="10" fill="#F8F6F1" />
      <rect x="54" y="24" width="10" height="16" fill="#FFD54A" />

      <rect x="34" y="34" width="14" height="8" fill="#F8F6F1" />
      <rect x="48" y="34" width="16" height="8" fill="#E63946" />

      <rect x="34" y="42" width="12" height="8" fill="#E63946" />
      <rect x="46" y="42" width="18" height="8" fill="#F8F6F1" />


      <path d="M44 24V50" stroke="#1A1A1A" strokeWidth="2.8" />
      <path d="M54 24V50" stroke="#1A1A1A" strokeWidth="2.8" />
      <path d="M34 34H64" stroke="#1A1A1A" strokeWidth="2.8" />
      <path d="M34 42H64" stroke="#1A1A1A" strokeWidth="2.8" />

    </svg>
  );
}
