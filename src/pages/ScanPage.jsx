import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { GlowBlobs, Button, Badge, Card } from '../components/UI'
import TempChart from '../components/TempChart'
import { useQRScanner, isQRSupported } from '../hooks/useQRScanner'
import { useToast, ToastContainer } from '../hooks/useToast'
import { MockApi } from '../services/mockApi'
import styles from './ScanPage.module.css'

const VIEWS = { SCAN: 'scan', LOADING: 'loading', STATUS: 'status', ERROR: 'error' }

export default function ScanPage() {
  const [view, setView]       = useState(VIEWS.SCAN)
  const [order, setOrder]     = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [manualId, setManualId] = useState('')
  const [scannerError, setScannerError] = useState('')
  const [scannerStarting, setScannerStarting] = useState(false)
  const [scannerStarted, setScannerStarted] = useState(false)
  const videoRef              = useRef(null)
  const qrImageInputRef       = useRef(null)
  const navigate              = useNavigate()
  const [searchParams]        = useSearchParams()
  const { toasts, showToast } = useToast()

  const handleResult = useCallback((text) => {
    const id = MockApi.extractOrderId(text) || text.trim().toUpperCase()
    if (id) { stop(); loadOrder(id) }
    else showToast('Could not read QR. Try manual entry.', 'error')
  }, [])

  const handleError = useCallback((msg) => {
    setScannerError(msg)
    setScannerStarted(false)
    setScannerStarting(false)
  }, [])

  const { start, stop, scanImage } = useQRScanner({ onResult: handleResult, onError: handleError })

  async function loadOrder(id) {
    setView(VIEWS.LOADING)
    const res = await MockApi.getOrder(id)
    if (!res.ok) { setErrorMsg(res.message); setView(VIEWS.ERROR); return }
    setOrder(res.data); setView(VIEWS.STATUS)
  }

  // Auto-load from URL param or start scanner
  useEffect(() => {
    const urlId = searchParams.get('orderId')
    if (urlId) { loadOrder(urlId) }
  }, [])

  // Stop scanner when leaving the scan view.
  useEffect(() => {
    if (view !== VIEWS.SCAN) {
      stop()
      setScannerStarted(false)
      setScannerStarting(false)
    }
  }, [view, stop])

  async function handleStartCamera() {
    if (!isQRSupported()) {
      setScannerError('Camera scanning is not supported in this browser. Use manual order entry below.')
      return
    }

    setScannerError('')
    setScannerStarting(true)
    const ok = await start(videoRef.current)
    setScannerStarting(false)
    setScannerStarted(ok)
  }

  function handleStopCamera() {
    stop()
    setScannerStarted(false)
  }

  async function handleQRImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    await scanImage(file)
    e.target.value = ''
  }

  function handleRetry() { stop(); setScannerError(''); setScannerStarted(false); setView(VIEWS.SCAN) }

  function handleManualSubmit() {
    const val = manualId.trim().toUpperCase()
    if (!val) { showToast('Enter an Order ID', 'error'); return }
    stop(); loadOrder(val.startsWith('ORD-') ? val : `ORD-${val}`)
  }

  function handleReportClick() {
    if (order) {
      sessionStorage.setItem('cc_order', JSON.stringify(order))
      navigate(`/breach?orderId=${order.orderId}`)
    }
  }

  const isIntact = order?.stickerStatus === 'intact'
  const scoreClass = order?.partnerScore >= 80 ? styles.scoreHigh : order?.partnerScore >= 50 ? styles.scoreMed : styles.scoreLow

  return (
    <div className={styles.root}>
      <GlowBlobs />
      <ToastContainer toasts={toasts} />

      {/* ============ SCAN VIEW ============ */}
      {view === VIEWS.SCAN && (
        <div className={styles.cameraRoot}>
          <video ref={videoRef} className={styles.video} playsInline muted autoPlay />
          <div className={styles.overlay} aria-hidden="true">
            <div className={styles.frame}>
              <div className={styles.cornerTR} /><div className={styles.cornerBL} />
              <div className={styles.scanLine} />
            </div>
            <p className={styles.scanHint}>Point camera at the QR sticker on your package</p>
          </div>
          <div className={styles.scanBottom}>
            <div className={styles.cameraActions}>
              {!scannerStarted ? (
                <Button onClick={handleStartCamera} loading={scannerStarting} full>
                  Start camera
                </Button>
              ) : (
                <Button onClick={handleStopCamera} variant="ghost" full>
                  Stop camera
                </Button>
              )}
              {scannerError && (
                <p className={styles.cameraNotice}>{scannerError} Manual entry and mock orders are ready below.</p>
              )}
              <input
                ref={qrImageInputRef}
                className={styles.hiddenFile}
                type="file"
                accept="image/*"
                onChange={handleQRImage}
                aria-label="Upload QR image"
              />
              <Button variant="ghost" full onClick={() => qrImageInputRef.current?.click()}>
                Upload QR image
              </Button>
            </div>
            <p className={styles.scanLabel}><strong>ColdChain</strong> — Cold Chain Verifier</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={styles.manualInput}
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                placeholder="Or type Order ID (e.g. ORD-001)"
              />
              <Button onClick={handleManualSubmit} size="sm">→</Button>
            </div>
            
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Available Mock Orders</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {MockApi.getAllOrders().map(o => (
                  <div 
                    key={o.orderId}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                    onClick={() => loadOrder(o.orderId)}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{o.orderId}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.product.substring(0, 30)}...</div>
                    </div>
                    <Badge variant={o.stickerStatus === 'breached' ? 'red' : 'green'}>
                      {o.stickerStatus === 'breached' ? 'Breached' : 'Safe'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button variant="ghost" onClick={() => navigate('/')}>← Back to Home</Button>
            </div>
          </div>
        </div>
      )}

      {/* ============ LOADING VIEW ============ */}
      {view === VIEWS.LOADING && (
        <div className={styles.centerView}>
          <div className={styles.spinner} />
          <p style={{ color: 'var(--text-secondary)' }}>Fetching order details…</p>
        </div>
      )}

      {/* ============ ERROR VIEW ============ */}
      {view === VIEWS.ERROR && (
        <div className={styles.centerView}>
          <div style={{ fontSize: 64, fontWeight: 700 }}>!</div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22 }}>Order Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', lineHeight: 1.7, maxWidth: 280 }}>{errorMsg}</p>
          <Button onClick={handleRetry}>Try Again</Button>
          <Button variant="ghost" onClick={() => navigate('/')}>← Home</Button>
        </div>
      )}

      {/* ============ STATUS VIEW ============ */}
      {view === VIEWS.STATUS && order && (
        <div className={styles.statusRoot}>
          <Navbar backTo="/scan" backLabel="Scan" />

          {/* Hero */}
          <div className={styles.statusHero}>
            <div className={`${styles.statusIcon} ${isIntact ? styles.statusIconOk : styles.statusIconBad}`}>
              {isIntact ? '✓' : '!'}
            </div>
            <Badge variant={isIntact ? 'green' : 'red'} style={{ marginBottom: 12 }}>
              {isIntact ? 'Cold Chain Intact' : 'Breach Detected'}
            </Badge>
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>{isIntact ? 'Your order is safe' : 'Cold chain was broken'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>
              {isIntact ? 'Temperature maintained throughout delivery. Enjoy!' : 'Temperature exceeded safe limits. You may be eligible for a refund.'}
            </p>
          </div>

          {/* Body */}
          <div className={styles.statusBody}>

            {/* Product */}
            <Card className={styles.cardPad}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img src={order.image} alt={order.product} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', background: 'var(--glass-bg)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{order.product}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.brand}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Required: {order.requiredTempRange}</div>
                </div>
              </div>
            </Card>

            {/* Temp Chart */}
            <TempChart order={order} />

            {/* At-a-glance temps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'At Dispatch', val: order.tempAtDispatch, ok: true },
                { label: 'At Delivery', val: order.tempAtDelivery, ok: isIntact },
              ].map(t => (
                <div key={t.label} className={styles.tempBox}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: t.ok ? 'var(--green)' : 'var(--red)' }}>{t.val}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{t.label}</div>
                </div>
              ))}
            </div>

            {/* Order info */}
            <Card className={styles.cardPad} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Restaurant', order.restaurant],
                ['Platform', order.platform],
                ['Ordered', fmtTime(order.orderedAt)],
                ['Delivered', fmtTime(order.deliveredAt)],
                ['Sticker ID', order.stickerId],
              ].map(([label, val]) => (
                <div key={label} className={styles.infoRow}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 14 }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: label === 'Sticker ID' ? 12 : 14, textAlign: 'right', maxWidth: '60%', fontFamily: label === 'Sticker ID' ? 'monospace' : 'inherit' }}>{val}</span>
                </div>
              ))}
            </Card>

            {/* Partner */}
            <Card className={styles.cardPad}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Delivery Partner</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--cyan),#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#000' }}>
                  {order.deliveryPartner[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{order.deliveryPartner}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{order.deliveryPartnerId}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: 'var(--cyan)' }}>{order.partnerScore}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Trust Score</div>
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={`${styles.scoreFill} ${scoreClass}`} style={{ width: `${order.partnerScore}%` }} />
              </div>
            </Card>

          </div>

          {/* CTA */}
          <div className={styles.statusCta}>
            {!isIntact && <Button variant="danger" full onClick={handleReportClick} size="lg">Report a Breach</Button>}
            {isIntact && <p style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 600, fontSize: 14, padding: 12 }}>Cold chain maintained — your order is safe!</p>}
          </div>
        </div>
      )}
    </div>
  )
}

function fmtTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
}
