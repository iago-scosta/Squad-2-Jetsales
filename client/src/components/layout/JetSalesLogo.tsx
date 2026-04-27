interface JetSalesLogoProps {
  collapsed?: boolean;
  className?: string;
}

/** Wordmark "JETSALES" — black with green accent on the J. */
export function JetSalesLogo({ collapsed = false, className }: JetSalesLogoProps) {
  return (
    <div className={`flex items-center gap-1 select-none ${className ?? ""}`} aria-label="JetSales">
      <span className="text-success text-xl font-extrabold leading-none">J</span>
      {!collapsed && (
        <span className="text-foreground text-lg font-extrabold tracking-tight leading-none">ETSALES</span>
      )}
    </div>
  );
}
