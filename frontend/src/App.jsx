import { useState } from 'react'
import { createEnquiry } from './api.js'
import BrandLogo from './components/BrandLogo.jsx'

const initialForm = {
  name: '', email: '', phone: '', company: '',
  service: 'Executive support', message: '', website: '',
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [state, setState] = useState({ status: 'idle', message: '' })

  function update(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setState({ status: 'loading', message: '' })
    try {
      const result = await createEnquiry(form)
      setForm(initialForm)
      setState({ status: 'success', message: `${result.message} Reference: ${result.reference}` })
    } catch (error) {
      setState({ status: 'error', message: error.message })
    }
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Global Talent Solutions home"><BrandLogo /></a>
        <nav><a href="#services">Services</a><a href="#contact">Let’s talk</a></nav>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <p className="eyebrow">SOUTH AFRICAN TALENT. GLOBAL OPPORTUNITIES.</p>
            <h1>Great people.<br />Greater <em>possibilities.</em></h1>
            <p className="intro">Connecting USA and UK businesses with exceptional South African professionals.</p>
            <a className="button" href="#contact">Find your next hire →</a>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="globe">✳</div><p>Talent knows<br />no borders.</p></div>
        </section>

        <section className="services" id="services">
          <p className="eyebrow">OUR EXPERTISE</p>
          <h2>Support that fits.<br />Talent that makes a difference.</h2>
          <div className="cards">
            {['Executive support', 'Operations & coordination', 'Recruitment & remote teams'].map((title, index) => (
              <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>Carefully matched professionals who bring skill, reliability and capacity to your team.</p></article>
            ))}
          </div>
        </section>

        <section className="contact" id="contact">
          <div><p className="eyebrow">LET’S CONNECT</p><h2>What’s next<br />for <em>your team?</em></h2><p>Tell us what you need and we’ll take the next step together.</p></div>
          <form onSubmit={submit}>
            <input className="honeypot" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" aria-hidden="true" />
            <div className="row"><label>Name<input name="name" value={form.name} onChange={update} required /></label><label>Email<input type="email" name="email" value={form.email} onChange={update} required /></label></div>
            <div className="row"><label>Company<input name="company" value={form.company} onChange={update} /></label><label>Phone<input name="phone" value={form.phone} onChange={update} /></label></div>
            <label>Service<select name="service" value={form.service} onChange={update}><option>Executive support</option><option>Operations & coordination</option><option>Recruitment & remote teams</option><option>Finding an opportunity</option><option>Something else</option></select></label>
            <label>Message<textarea name="message" value={form.message} onChange={update} minLength="10" maxLength="4000" required /></label>
            <button className="button" disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Sending…' : 'Send enquiry →'}</button>
            {state.message && <p className={`notice ${state.status}`} role="status">{state.message}</p>}
          </form>
        </section>
      </main>
      <footer>© {new Date().getFullYear()} Global Talent Solutions</footer>
    </>
  )
}
