export const LishLogo = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 160 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="LISH"
  >
    <defs>
      <linearGradient id="lg" x1="18" y1="4" x2="38" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBCACA" />
        <stop offset="100%" stopColor="#E8848A" />
      </linearGradient>
    </defs>
    {/* Vertical bar of the L */}
    <rect x="14" y="4" width="11" height="34" rx="5.5" fill="url(#lg)" />
    {/* Horizontal bar of the L — angled slightly right */}
    <rect
      x="14" y="36"
      width="28" height="11"
      rx="5.5"
      fill="url(#lg)"
      transform="rotate(-8 14 41)"
    />
    {/* LISH wordmark */}
    <text
      x="56"
      y="40"
      fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
      fontWeight="800"
      fontSize="28"
      letterSpacing="3"
      fill="#111111"
    >LISH</text>
  </svg>
);
