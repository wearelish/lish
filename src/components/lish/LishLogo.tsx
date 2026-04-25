interface Props {
  className?: string;
  /** Use image file instead of SVG (for high-fidelity rendering) */
  useImage?: boolean;
}

export const LishLogo = ({ className = "", useImage = false }: Props) => {
  if (useImage) {
    return (
      <img
        src="/logo.jpg"
        alt="LISH"
        className={className}
        style={{ objectFit: "contain" }}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 180 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LISH"
    >
      <defs>
        <linearGradient id="lish-l-grad" x1="10" y1="4" x2="42" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBCECE" />
          <stop offset="55%" stopColor="#F4A0A0" />
          <stop offset="100%" stopColor="#E87878" />
        </linearGradient>
      </defs>

      {/* Vertical bar of the L — tall rounded pill */}
      <rect x="8" y="3" width="12" height="36" rx="6" fill="url(#lish-l-grad)" />

      {/* Horizontal bar of the L — shorter rounded pill, angled slightly */}
      <rect
        x="8" y="34"
        width="30" height="12"
        rx="6"
        fill="url(#lish-l-grad)"
        transform="rotate(-6 8 40)"
      />

      {/* LISH wordmark */}
      <text
        x="52"
        y="40"
        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="26"
        letterSpacing="2"
        fill="#111111"
      >LISH</text>
    </svg>
  );
};
