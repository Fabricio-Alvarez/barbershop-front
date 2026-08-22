import { clientEnv } from '../../config/env';

interface BrandLogoProps {
  className?: string;
  decorative?: boolean;
}

export function BrandLogo({ className = '', decorative = false }: BrandLogoProps) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/branding/yaros-barber-logo.png"
      alt={decorative ? '' : clientEnv.businessName}
      aria-hidden={decorative || undefined}
      width="1994"
      height="789"
    />
  );
}
