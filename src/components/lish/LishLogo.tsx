export const LishLogo = ({ className = "" }: { className?: string }) => (
  <img
    src="/logo.png"
    alt="LISH"
    className={className}
    style={{ objectFit: "contain", display: "block" }}
  />
);
