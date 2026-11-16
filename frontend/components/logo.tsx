import { cn } from '@/lib/utils';

/**
 * SubFlow logo mark — self-contained inline SVG.
 * All fills are hardcoded hex + an SVG gradient on purpose:
 * the mark must NEVER depend on Tailwind theme colours, so it
 * renders identically in every build.
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size }}
      role="img"
      aria-label="SubFlow logo"
    >
      <defs>
        <linearGradient id="subflow-g" x1="2" y1="2" x2="62" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10B981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#subflow-g)" />
      <polygon points="32,12 54,23 32,34 10,23" fill="#FFFFFF" />
      <path d="M12,33 L32,43 L52,33" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <path d="M12,43 L32,53 L52,43" stroke="#FFFFFF" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

/** Full logo: mark + two-tone wordmark. */
export function Logo({ markSize = 32, className }: { markSize?: number; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={markSize} />
      <span className="text-[17px] tracking-tight">
        <span className="font-semibold text-foreground">Sub</span>
        <span className="font-semibold" style={{ color: '#059669' }}>Flow</span>
      </span>
    </span>
  );
}
