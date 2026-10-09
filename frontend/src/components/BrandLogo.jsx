import './BrandLogo.css'
import globeImage from '../assets/gts-globe.png'

export default function BrandLogo({ variant = 'horizontal', className = '' }) {
  return (
    <span className={`brand-logo brand-logo--${variant} ${className}`.trim()}>
      <span className="brand-logo__symbol" aria-hidden="true">
        <svg className="brand-logo__orbit brand-logo__orbit--back" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="gts-orbit-gold" x1="0" x2="1">
              <stop offset="0" stopColor="#9b6818" />
              <stop offset=".45" stopColor="#e0bd69" />
              <stop offset="1" stopColor="#a8741f" />
            </linearGradient>
          </defs>
          <ellipse cx="90" cy="90" rx="80" ry="27" fill="none" stroke="url(#gts-orbit-gold)" strokeWidth="8" />
        </svg>
        <img className="brand-logo__globe" src={globeImage} alt="" />
        <svg className="brand-logo__orbit brand-logo__orbit--front" viewBox="0 0 180 180">
          <path d="M18 93c25 32 111 39 146-2" fill="none" stroke="url(#gts-orbit-gold)" strokeWidth="8" strokeLinecap="round" />
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
