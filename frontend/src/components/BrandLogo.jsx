import './BrandLogo.css'
import horizontalLogo from '../assets/gts-logo-horizontal.png'

export default function BrandLogo({ className = '' }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={horizontalLogo}
      alt="Global Talent Solutions"
    />
  )
}
