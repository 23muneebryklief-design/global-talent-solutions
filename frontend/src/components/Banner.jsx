import './Banner.css'

export default function Banner() {
  return (
    <section className="banner" aria-labelledby="banner-title">
      <div className="banner__content">
        <p className="banner__eyebrow">South African talent. Global opportunities.</p>
        <h1 id="banner-title">Great people.<br />Greater <em>possibilities.</em></h1>
        <p className="banner__intro">
          Connecting USA and UK businesses with exceptional South African professionals.
        </p>
        <a className="button banner__button" href="#contact">Find Your Next Hire <span aria-hidden="true">→</span></a>
      </div>
      <div className="banner__visual" aria-label="Banner image area" />
    </section>
  )
}
