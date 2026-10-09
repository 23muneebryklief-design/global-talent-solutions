import { useEffect, useState } from 'react'
import './Banner.css'
import usaImage from '../assets/banner-usa.png'
import ukImage from '../assets/banner-uk.png'

const slides = [
  {
    image: usaImage,
    imageAlt: 'The Statue of Liberty and New York City skyline',
    eyebrow: 'USA businesses. South African talent.',
    title: <>Global reach.<br />Exceptional <em>people.</em></>,
    intro: 'Connect your business with carefully matched South African professionals who are ready to make an impact.',
    side: 'left',
  },
  {
    image: ukImage,
    imageAlt: 'Big Ben and the Houses of Parliament in London',
    eyebrow: 'UK businesses. South African talent.',
    title: <>Build stronger.<br />Work <em>smarter.</em></>,
    intro: 'Grow your team with skilled, dependable professionals chosen around your business and the way you work.',
    side: 'right',
  },
]

export default function Banner() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = slides[activeSlide]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % slides.length)
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  function showNextSlide() {
    setActiveSlide(current => (current + 1) % slides.length)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      showNextSlide()
    }
  }

  return (
    <section
      className={`banner banner--${slide.side}`}
      onClick={showNextSlide}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex="0"
      aria-label="Change banner image"
    >
      {slides.map((item, index) => (
        <img
          key={item.imageAlt}
          className={`banner__image ${index === activeSlide ? 'banner__image--active' : ''}`}
          src={item.image}
          alt={index === activeSlide ? item.imageAlt : ''}
        />
      ))}

      <div className="banner__content" onClick={event => event.stopPropagation()}>
        <p className="banner__eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <p className="banner__intro">{slide.intro}</p>
        <a className="button banner__button" href="#contact">Find Your Next Hire <span aria-hidden="true">→</span></a>
      </div>

      <div className="banner__controls" onClick={event => event.stopPropagation()} aria-label="Banner slides">
        {slides.map((item, index) => (
          <button
            key={item.imageAlt}
            className={index === activeSlide ? 'is-active' : ''}
            onClick={() => setActiveSlide(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === activeSlide ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
