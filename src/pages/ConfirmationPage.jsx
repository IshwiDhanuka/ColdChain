import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GlowBlobs, Button, Badge, Card } from '../components/UI'
import styles from './ConfirmationPage.module.css'

const NEXT_STEPS = [
  { icon: '1', title: 'Evidence reviewed', desc: 'Your photo and sticker data are automatically compared against the cold chain log.' },
  { icon: '2', title: 'Partner accountability', desc: 'If the breach is confirmed, the delivery partner\'s trust score is updated objectively.' },
  { icon: '3', title: 'Automatic refund', desc: 'Refund processed to your original payment method within 24–48 hours. No calls required.' },
]

export default function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('cc_result')
    if (stored) { setResult(JSON.parse(stored)); sessionStorage.removeItem('cc_result') }
  }, [])

  const refId = searchParams.get('refId') || result?.refId || 'BR-UNKNOWN'
  const time  = result?.submittedAt ? fmtTime(result.submittedAt) : 'Just now'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(refId)
    } catch {
      const el = document.createElement('textarea')
      el.value = refId; el.style.position = 'fixed'; el.style.opacity = '0'
      document.body.appendChild(el); el.select(); document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ColdChain Breach Report', text: `Reference ID: ${refId}`, url: window.location.href })
      } catch { }
    } else { handleCopy() }
  }

  return (
    <div className={styles.root}>
      <GlowBlobs />
      <main className={styles.main}>

        {/* Rings + check animation */}
        <div className={styles.rings} aria-hidden="true">
          <div className={styles.ring1} /><div className={styles.ring2} /><div className={styles.ring3} />
          <div className={styles.checkCircle}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <path className={styles.checkPath} d="M8 18 L15 25 L28 11" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className={styles.heading}>
          <Badge variant="green">✓ Report Submitted</Badge>
          <h1 className={styles.title}>
            Breach report<br />
            <span className={styles.gradGreen}>received!</span>
          </h1>
          <p className={styles.subtitle}>
            Your evidence is logged and linked to the delivery sticker.
            A refund will be processed within <strong style={{ color: 'var(--text-primary)' }}>24–48 hours</strong>.
          </p>
        </div>

        {/* Reference ID card */}
        <div className={styles.refCard}>
          <div className={styles.refTopLine} />
          <p className={styles.refLabel}>Reference ID</p>
          <p className={styles.refId}>{refId}</p>
          <div className={styles.refActions}>
            <button className={styles.refBtn} onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy ID'}
            </button>
            <button className={styles.refBtn} onClick={handleShare}>🔗 Share</button>
          </div>
        </div>

        <p className={styles.timeLabel}>Submitted {time}</p>

        {/* Next steps */}
        <div className={styles.nextSteps}>
          {NEXT_STEPS.map(s => (
            <div key={s.title} className={styles.nextStep}>
              <span className={styles.nextIcon}>{s.icon}</span>
              <div>
                <div className={styles.nextTitle}>{s.title}</div>
                <div className={styles.nextDesc}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link to="/scan" className={styles.btnPrimary}>Scan Another Order</Link>
          <Link to="/" className={styles.btnGhost}>← Back to Home</Link>
        </div>

      </main>
    </div>
  )
}

function fmtTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
}
