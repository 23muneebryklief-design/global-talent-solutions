import { useRef, useState } from 'react'
import './BrandLogo.css'

export default function BrandLogo({ variant = 'horizontal', className = '' }) {
  const [dragAngle, setDragAngle] = useState(0)
  const drag = useRef(null)

  function startDrag(event) {
    drag.current = { x: event.clientX, angle: dragAngle }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event) {
    if (!drag.current) return
    setDragAngle(drag.current.angle + (event.clientX - drag.current.x) * 0.7)
  }

  function endDrag(event) {
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <span className={`brand-logo brand-logo--${variant} ${className}`.trim()}>
      <svg
        className="brand-logo__globe"
        viewBox="0 0 180 180"
        role="img"
        aria-label="Global Talent Solutions globe"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ '--drag-angle': `${dragAngle}deg` }}
      >
        <defs>
          <clipPath id="gts-globe-clip"><circle cx="90" cy="90" r="57" /></clipPath>
          <linearGradient id="gts-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#9d6d1d" />
            <stop offset="0.48" stopColor="#d6b05d" />
            <stop offset="1" stopColor="#a97725" />
          </linearGradient>
        </defs>

        <g className="brand-logo__drag">
          <g className="brand-logo__earth">
            <circle cx="90" cy="90" r="57" fill="#103f5b" stroke="#0a3047" strokeWidth="2" />
            <g clipPath="url(#gts-globe-clip)" fill="none" stroke="#f8f6f0" strokeOpacity=".58" strokeWidth="1.2">
              <ellipse cx="90" cy="90" rx="28" ry="57" />
              <ellipse cx="90" cy="90" rx="48" ry="57" />
              <path d="M33 90h114M39 66c31 10 71 10 102 0M39 114c31-10 71-10 102 0" />
            </g>
            <g clipPath="url(#gts-globe-clip)" fill="#f8f6f0">
              <path d="M61 48l12-8 14 2 8 7-4 7-12 2-4 8-8-1-7 7-8-8 4-7z" />
              <path d="M75 72l13-8 16 2 12 10-2 12-8 5-2 16-9 22-8-5-3-17-8-9-6-16z" />
              <path d="M117 52l13 5 10 12-5 7-12-5-8-10z" />
            </g>
          </g>
        </g>

        <g className="brand-logo__orbit" fill="none" stroke="url(#gts-gold)" strokeWidth="7" strokeLinecap="round">
          <ellipse cx="90" cy="90" rx="78" ry="25" transform="rotate(-18 90 90)" />
        </g>
      </svg>

      {variant !== 'icon' && (
        <span className="brand-logo__wordmark">
          <strong>GLOBAL TALENT</strong>
          <small>SOLUTIONS</small>
        </span>
      )}
    </span>
  )
}
