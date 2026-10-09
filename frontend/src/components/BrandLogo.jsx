import './BrandLogo.css'

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
            <clipPath id="gts-globe-clip"><circle cx="90" cy="76" r="53" /></clipPath>
          </defs>
          <circle cx="90" cy="76" r="53" fill="#0c3a5b" stroke="#092f4a" strokeWidth="3" />
          <g clipPath="url(#gts-globe-clip)" fill="none" stroke="#f4efe2" strokeWidth="1.6" opacity=".72">
            <ellipse cx="90" cy="76" rx="28" ry="53" />
            <ellipse cx="90" cy="76" rx="48" ry="53" />
            <path d="M37 76h106M42 54c30 12 66 12 96 0M42 98c30-12 66-12 96 0" />
          </g>
          <g fill="#f5f0e4">
            <path d="M49 48l10-12 19-7 13 6-5 9-12 2-4 8-11 1z" />
            <path d="M74 60l13-9 11 5 8-3 14 8-4 10-13 2-3 11-8 3-5-11-10-5z" />
            <path d="M96 88l16-7 13 8-4 12-9 5-5 19-9-7-2-15-8-8z" />
            <path d="M122 43l12 5 7 11-8 6-9-5-7-10z" />
          </g>
          <ellipse cx="90" cy="79" rx="78" ry="25" fill="none" stroke="url(#gts-orbit-gold)" strokeWidth="8" transform="rotate(-17 90 79)" />
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
