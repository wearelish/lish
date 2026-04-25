export const LishLogo = ({ className = "" }: { className?: string }) => (
  <img
    src="/logo.jpg"
    alt="LISH"
    className={className}
    style={{
      objectFit: "contain",
      display: "block",
      mixBlendMode: "multiply",  // removes white background on light backgrounds
    }}
  />
);
