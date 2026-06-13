interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = "h-10 w-40" }: BrandLogoProps) {
  return (
    <span
      role="img"
      aria-label="SyncOps"
      className={`block shrink-0 ${className}`}
      style={{
        backgroundImage: "url('/SyncOps.png')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }}
    />
  );
}
