import { useCallback, useEffect, useRef, useState } from 'react'
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
    side: 'right',
  },
  {
    image: ukImage,
    imageAlt: 'Big Ben and the Houses of Parliament in London',
    eyebrow: 'UK businesses. South African talent.',
    title: <>Build stronger.<br />Work <em>smarter.</em></>,
    intro: 'Grow your team with skilled, dependable professionals chosen around your business and the way you work.',
    side: 'left',
  },
]

function drawCover(context, image, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
}

export default function Banner() {
  const [activeSlide, setActiveSlide] = useState(0)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const activeRef = useRef(0)
  const transitioningRef = useRef(false)
  const animationRef = useRef()
  const slide = slides[activeSlide]

  const drawSlide = useCallback((index, pixelSize = 1) => {
    const canvas = canvasRef.current
    const image = imagesRef.current[index]
    if (!canvas || !image?.complete) return

    const ratio = window.devicePixelRatio || 1
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio))
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    const block = Math.max(1, Math.round(pixelSize * ratio))
    const smallWidth = Math.max(1, Math.ceil(width / block))
    const smallHeight = Math.max(1, Math.ceil(height / block))
    const buffer = document.createElement('canvas')
    buffer.width = smallWidth
    buffer.height = smallHeight
    const bufferContext = buffer.getContext('2d')
    drawCover(bufferContext, image, smallWidth, smallHeight)

    const context = canvas.getContext('2d')
    context.clearRect(0, 0, width, height)
    context.imageSmoothingEnabled = false
    context.drawImage(buffer, 0, 0, smallWidth, smallHeight, 0, 0, width, height)
  }, [])

  const changeSlide = useCallback((targetIndex) => {
    if (transitioningRef.current || targetIndex === activeRef.current) return
    transitioningRef.current = true
    const outgoingIndex = activeRef.current
    const duration = 950
    const maxPixelSize = 18
    const startedAt = performance.now()
    let switched = false

    function animate(now) {
      const progress = Math.min((now - startedAt) / duration, 1)
      if (progress < .5) {
        drawSlide(outgoingIndex, 1 + (maxPixelSize - 1) * (progress / .5))
      } else {
        if (!switched) {
          switched = true
          activeRef.current = targetIndex
          setActiveSlide(targetIndex)
        }
        drawSlide(targetIndex, maxPixelSize - (maxPixelSize - 1) * ((progress - .5) / .5))
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        transitioningRef.current = false
        drawSlide(targetIndex, 1)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [drawSlide])

  const showNextSlide = useCallback(() => {
    changeSlide((activeRef.current + 1) % slides.length)
  }, [changeSlide])

  useEffect(() => {
    let cancelled = false
    Promise.all(slides.map(item => {
      const image = new Image()
      image.src = item.image
      return image.decode().catch(() => undefined).then(() => image)
    })).then(images => {
      if (cancelled) return
      imagesRef.current = images
      drawSlide(activeRef.current)
    })

    const resizeObserver = new ResizeObserver(() => drawSlide(activeRef.current))
    if (canvasRef.current) resizeObserver.observe(canvasRef.current)
    return () => {
      cancelled = true
      resizeObserver.disconnect()
      cancelAnimationFrame(animationRef.current)
    }
  }, [drawSlide])

  useEffect(() => {
    const timer = window.setInterval(showNextSlide, 60_000)
    return () => window.clearInterval(timer)
  }, [showNextSlide])

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      showNextSlide()
    }
  }

  return (
    <section className={`banner banner--${slide.side}`} onClick={showNextSlide} onKeyDown={handleKeyDown} role="button" tabIndex="0" aria-label="Change banner image">
      <canvas className="banner__canvas" ref={canvasRef} aria-hidden="true" />
      <span className="sr-only">{slide.imageAlt}</span>

      <div className="banner__content" onClick={event => event.stopPropagation()}>
        <p className="banner__eyebrow">{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <p className="banner__intro">{slide.intro}</p>
        <a className="button banner__button" href="#contact">Find Your Next Hire <span aria-hidden="true">→</span></a>
      </div>

      <div className="banner__controls" onClick={event => event.stopPropagation()} aria-label="Banner slides">
        {slides.map((item, index) => (
          <button key={item.imageAlt} className={index === activeSlide ? 'is-active' : ''} onClick={() => changeSlide(index)} aria-label={`Show slide ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined} />
        ))}
      </div>
    </section>
  )
}
