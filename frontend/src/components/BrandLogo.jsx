import './BrandLogo.css'
import globeImage from '../assets/gts-globe.png'

export default function BrandLogo({ variant = 'horizontal', className = '' }) {
  return (
    <span className={`brand-logo brand-logo--${variant} ${className}`.trim()}>
      <span className="brand-logo__symbol" aria-hidden="true">
        <svg className="brand-logo__mark" viewBox="0 0 180 160">
          <defs>
            <linearGradient id="gts-orbit-gold" x1="0" x2="1">
              <stop offset="0" stopColor="#9b6818" />
              <stop offset=".45" stopColor="#e0bd69" />
              <stop offset="1" stopColor="#a8741f" />
            </linearGradient>
          </defs>
          <ellipse cx="90" cy="80" rx="78" ry="25" fill="none" stroke="url(#gts-orbit-gold)" strokeWidth="8" transform="rotate(-17 90 80)" />
          <image href={globeImage} x="25" y="12" width="130" height="125" preserveAspectRatio="xMidYMid meet" />
          <path d="M18 89c27 30 108 34 145-4" fill="none" stroke="url(#gts-orbit-gold)" strokeWidth="8" strokeLinecap="round" transform="rotate(-17 90 80)" />
        </svg>
      </span>

      {variant !== 'icon' && (
        <span className="brand-logo__wordmark">
          <strong>GLOBAL TALENT</strong>
          <small>SOLUTIONS</small>
        </span>
      )}
      <span className="sr-only">Global Talent Solutions</span>
    </span>
  )
}
