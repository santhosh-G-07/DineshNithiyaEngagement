import { useEffect, useMemo, useState } from 'react'

const EVENT_START = new Date('2026-04-30T11:00:00+05:30')
const EVENT_END = new Date('2026-04-30T13:00:00+05:30')
const MAP_LINK = 'https://maps.app.goo.gl/nMnG3KU4iWDDDBby7'
const VENUE = 'Nadukuppam Vinayagapuram GSM Mahal A/C'

type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
  started: boolean
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatCalendarDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

function buildCalendarCells(date: Date): Array<number | null> {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = Array.from({ length: firstDay }, () => null)

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function getCountdownParts(target: Date): CountdownParts {
  const now = Date.now()
  const distance = target.getTime() - now

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true }
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((distance / (1000 * 60)) % 60)
  const seconds = Math.floor((distance / 1000) % 60)

  return { days, hours, minutes, seconds, started: false }
}

function App() {
  const [isOpened, setIsOpened] = useState(false)
  const [countdown, setCountdown] = useState<CountdownParts>(() => getCountdownParts(EVENT_START))
  const [confettiKey, setConfettiKey] = useState(0)

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${6 + Math.random() * 7}px`,
        duration: `${2.8 + Math.random() * 3.2}s`,
        delay: `${Math.random() * 1.8}s`,
      })),
    [],
  )

  const ambientParticles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${2 + Math.random() * 4}px`,
        delay: `${Math.random() * 5}s`,
        duration: `${6 + Math.random() * 7}s`,
      })),
    [],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsOpened(true)
      setConfettiKey((value) => value + 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(getCountdownParts(EVENT_START))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isOpened) {
      return
    }

    const items = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.16 },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [isOpened])

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(EVENT_START)

  const formattedTime = `${new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(EVENT_START)} - ${new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(EVENT_END)}`

  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(VENUE)}&output=embed`
  const calendarTitle = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(EVENT_START)
  const calendarCells = useMemo(() => buildCalendarCells(EVENT_START), [])
  const eventDay = EVENT_START.getDate()
  const eventTitle = 'Dinesh & Nithya Engagement Ceremony'
  const eventDescription = `We are getting engaged. Join us with your blessings at ${VENUE}. Map: ${MAP_LINK}`
  const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${formatCalendarDate(EVENT_START)}/${formatCalendarDate(EVENT_END)}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(VENUE)}&ctz=Asia/Kolkata`
  const outlookCalendarLink = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(eventTitle)}&startdt=${encodeURIComponent(EVENT_START.toISOString())}&enddt=${encodeURIComponent(EVENT_END.toISOString())}&body=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(VENUE)}`
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DineshAndNithya//EngagementInvite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:dinesh-nithya-engagement-${EVENT_START.getTime()}@engagement`,
    `DTSTAMP:${formatCalendarDate(new Date())}`,
    `DTSTART:${formatCalendarDate(EVENT_START)}`,
    `DTEND:${formatCalendarDate(EVENT_END)}`,
    `SUMMARY:${escapeIcsText(eventTitle)}`,
    `DESCRIPTION:${escapeIcsText(eventDescription)}`,
    `LOCATION:${escapeIcsText(VENUE)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const icsDownloadLink = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`

  return (
    <div className="invite-root">
      <div className={`prelude-screen ${isOpened ? 'prelude-opened' : ''}`} aria-hidden={isOpened}>
        <div className="prelude-curtain prelude-left" />
        <div className="prelude-curtain prelude-right" />
        <div className="prelude-center">
          <p className="prelude-kicker">Engagement Invitation</p>
          <p className="prelude-couple">Dinesh & Nithya</p>
        </div>
      </div>

      <div className="bg-orb orb-one" />
      <div className="bg-orb orb-two" />
      <div className="ambient-layer" aria-hidden="true">
        {ambientParticles.map((particle) => (
          <span
            key={particle.id}
            className="ambient-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>
      <div className="floral-edge floral-left" aria-hidden="true" />
      <div className="floral-edge floral-right" aria-hidden="true" />

      <main className="invite-shell">
        <section className="invite-panel family-panel reveal-1" data-reveal>
          <div className="family-grid">
            <article className="family-card">
              <p className="family-names">
                GOVARTHANAN
                <br />
                KALAI SELVI
              </p>
            </article>
            <article className="family-card">
              <p className="family-names">
                GOVINDAN
                <br />
                VIJAYA
              </p>
            </article>
          </div>
          <p className="family-note">Cordially Invites You To The Engagement Of</p>
        </section>

        <section className="invite-panel hero-panel reveal-2" data-reveal>
          <h1 className="couple-name">
            Dinesh <span>&</span> Nithya
          </h1>
          <p className="hero-copy">Please join us with your blessings as we celebrate this beautiful beginning.</p>
          <div className="ornament-line" />
          <p className="mini-title">Engagement Ceremony</p>
        </section>

        <section className="invite-panel date-panel reveal-3" data-reveal>
          <div className="confetti-wrap" key={confettiKey}>
            {isOpened &&
              confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="confetti-piece"
                  style={{
                    left: piece.left,
                    width: piece.size,
                    height: piece.size,
                    animationDuration: piece.duration,
                    animationDelay: piece.delay,
                  }}
                />
              ))}
          </div>

          <p className="script-title">Save The Date</p>
          <div className="date-card">
            <p className="date-main">{formattedDate}</p>
            <p className="date-sub">{formattedTime}</p>
          </div>
          <div className="mini-calendar" role="group" aria-label={`Calendar for ${calendarTitle}`}>
            <p className="calendar-month">{calendarTitle}</p>
            <div className="calendar-weekdays" aria-hidden="true">
              {WEEKDAY_LABELS.map((dayName) => (
                <span key={dayName}>{dayName}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarCells.map((day, index) => {
                const isEventDate = day === eventDay
                const classes = `calendar-day${day ? '' : ' calendar-empty'}${isEventDate ? ' calendar-day-highlight' : ''}`
                return (
                  <span key={`${day ?? 'empty'}-${index}`} className={classes} aria-label={isEventDate ? `${day} highlighted date` : undefined}>
                    {day ?? ''}
                  </span>
                )
              })}
            </div>
          </div>
          <a className="gold-btn" href="#venue">
            View Venue
          </a>
          <details className="calendar-picker">
            <summary className="calendar-trigger">Add To Calendar</summary>
            <div className="calendar-menu">
              <a className="calendar-link" href={googleCalendarLink} target="_blank" rel="noreferrer">
                Google Calendar
              </a>
              <a className="calendar-link" href={outlookCalendarLink} target="_blank" rel="noreferrer">
                Outlook Calendar
              </a>
              <a className="calendar-link" href={icsDownloadLink} download="dinesh-nithya-engagement.ics">
                Download .ics File
              </a>
            </div>
          </details>
        </section>

        <section className="invite-panel countdown-panel reveal-4" data-reveal>
          <h2>Counting Down</h2>
          <div className="count-grid">
            <div className="count-item">
              <span>{countdown.days}</span>
              <small>Days</small>
            </div>
            <div className="count-item">
              <span>{countdown.hours}</span>
              <small>Hours</small>
            </div>
            <div className="count-item">
              <span>{countdown.minutes}</span>
              <small>Minutes</small>
            </div>
            <div className="count-item">
              <span>{countdown.seconds}</span>
              <small>Seconds</small>
            </div>
          </div>
          <p className="helper-text">
            {countdown.started ? 'The celebration has started.' : 'Only a few days left for our special day.'}
          </p>
        </section>

        <section className="invite-panel schedule-panel reveal-5" data-reveal>
          <h2>Program Timeline</h2>
          <ul className="timeline">
            <li>
              <time>11:00 AM</time>
              <p>Welcome & Ring Exchange</p>
            </li>
            <li>
              <time>11:30 AM</time>
              <p>Family Blessings & Photos</p>
            </li>
            <li>
              <time>12:15 PM</time>
              <p>Lunch With Loved Ones</p>
            </li>
            <li>
              <time>1:00 PM</time>
              <p>Thank You Note</p>
            </li>
          </ul>
        </section>

        <section className="invite-panel venue-panel reveal-6" id="venue" data-reveal>
          <h2>Venue</h2>
          <p className="venue-name">{VENUE}</p>
          <div className="map-wrap">
            <iframe src={mapEmbed} title="Venue map" loading="lazy" />
          </div>
          <a className="gold-btn" href={MAP_LINK} target="_blank" rel="noreferrer">
            Open In Google Maps
          </a>
        </section>

        <footer className="invite-panel footer-panel reveal-7" data-reveal>
          <p className="footer-quote">Your presence and blessings are the best gift for us.</p>
          <p className="footer-sign">With love, Dinesh & Nithya</p>
        </footer>
      </main>
    </div>
  )
}

export default App
