import { cn } from '@/lib/utils';

/**
 * SubFlow logo mark — self-contained inline SVG.
 * A geometric faceted "flow S": two slanted parallelogram ribbons
 * (emerald / teal) offset into an S-flow, with a small mint diamond
 * shard accent. All fills are hardcoded hex on purpose — the mark
 * must NEVER depend on Tailwind theme colours, so it renders
 * identically in every build. No background square: the shards
 * themselves are the mark.
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
      <polygon points="14,10 42,10 34,30 6,30" fill="#059669" />
      <polygon points="46,10 58,10 50,30 38,30" fill="#34D399" opacity="0.9" />
      <polygon points="50,34 22,34 30,54 58,54" fill="#0F766E" />
    </svg>
  );
}

/** Full logo: mark + two-tone wordmark. */
export function Logo({ markSize = 32, className }: { markSize?: number; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={markSize} />
      <span className="text-[19px] font-bold tracking-tight">
        <span className="text-foreground">Sub</span>
        <span style={{ color: '#059669' }}>Flow</span>
      </span>
    </span>
  );
}
