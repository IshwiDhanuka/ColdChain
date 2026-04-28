import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { GlowBlobs, Button, Badge, Card, Pill } from '../components/UI'
import { useToast, ToastContainer } from '../hooks/useToast'
import { MockApi } from '../services/mockApi'
import styles from './BreachPage.module.css'

const BREACH_TYPES = [
  { id: 'melted',       label: 'Melted' },
  { id: 'partial_melt', label: 'Partially Melted' },
  { id: 'leaking',      label: 'Leaking' },
  { id: 'wrong_package',label: 'Wrong Package' },
  { id: 'wrong_temp',   label: 'Wrong Temp' },
  { id: 'damaged',      label: 'Damaged' },
  { id: 'other',        label: 'Other' },
]

export default function BreachPage() {
  const navigate              = useNavigate()
  const [searchParams]        = useSearchParams()
  const { toasts, showToast } = useToast()

  const [order, setOrder]         = useState(null)
  const [photo, setPhoto]         = useState(null)   // dataUrl
  const [breachType, setBreachType] = useState(null)
  const [desc, setDesc]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors]       = useState({})

  useEffect(() => {
    const stored = sessionStorage.getItem('cc_order')
    if (stored) { setOrder(JSON.parse(stored)); return }
    const id = searchParams.get('orderId')
    if (id) MockApi.getOrder(id).then(r => { if (r.ok) setOrder(r.data) })
  }, [])

  // Photo
  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setPhoto(ev.target.result); setErrors(er => ({ ...er, photo: false })) }
    reader.readAsDataURL(file)
  }

  // Progress (1–3 steps)
  const step = !photo ? 1 : !breachType ? 2 : 3

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!photo) errs.photo = true
    if (!breachType) errs.type = true
    if (Object.keys(errs).length) { setErrors(errs); showToast('Please fill in all required fields.', 'error'); return }

    setSubmitting(true)
    const res = await MockApi.submitBreach({
      orderId: order?.orderId || searchParams.get('orderId') || 'UNKNOWN',
      product: order?.product || '',
      deliveryPartner: order?.deliveryPartner || '',
      deliveryPartnerId: order?.deliveryPartnerId || '',
      platform: order?.platform || '',
      breachType, description: desc, photoDataUrl: photo,
    })
    setSubmitting(false)

    if (res.ok) {
      sessionStorage.setItem('cc_result', JSON.stringify(res.data))
      sessionStorage.removeItem('cc_order')
      navigate(`/confirmation?refId=${res.data.refId}`)
    } else {
      showToast('Submission failed. Please try again.', 'error')
    }
  }

  return (
    <div className={styles.root}>
      <GlowBlobs />
      <ToastContainer toasts={toasts} />
      <Navbar backTo={order ? `/scan?orderId=${order.orderId}` : '/scan'} backLabel="Back" />

      <div className={styles.page}>
        <div className={styles.container}>

          {/* Header */}
          <div className={styles.header}>
            <Badge variant="red">Breach Report</Badge>
            <h1 className={styles.title}>Report a cold<br />chain breach</h1>
            <p className={styles.subtitle}>Your report is evidence. Add a photo and select what went wrong — we'll handle the rest.</p>
          </div>

          {/* Progress bar */}
          <div className={styles.progressBar} aria-hidden="true">
            {[1, 2, 3].map(i => (
              <div key={i} className={`${styles.progStep} ${i < step ? styles.progDone : i === step ? styles.progActive : ''}`} />
            ))}
          </div>

          {/* Order mini-card */}
          {order && (
            <div className={styles.orderMini}>
              <span style={{ fontSize: 28 }}>!</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{order.product}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{order.orderId}</div>
              </div>
              <Badge variant="red" style={{ marginLeft: 'auto' }}>Breached</Badge>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Photo upload */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Photo Evidence <span style={{ color: 'var(--red)' }}>*</span></label>
              <div className={`${styles.photoZone} ${photo ? styles.photoZoneHas : ''} ${errors.photo ? styles.photoZoneError : ''}`}>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className={styles.photoInput} aria-label="Upload photo evidence" />
                {!photo ? (
                  <div className={styles.photoPlaceholder}>
                    <div style={{ fontSize: 40 }}>+</div>
                    <div style={{ fontWeight: 700 }}>Take a photo</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>or choose from gallery</div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      style={{ marginTop: 12 }}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setPhoto('https://images.unsplash.com/photo-1559182967-df5e11f11e9a?w=400&q=80'); 
                        setErrors(er => ({ ...er, photo: false })); 
                      }}
                    >
                      Use Demo Photo (E2E Test)
                    </Button>
                  </div>
                ) : (
                  <>
                    <img src={photo} alt="Uploaded" className={styles.photoPreview} />
                    <button type="button" className={styles.photoRemove} onClick={(e) => { e.stopPropagation(); setPhoto(null) }}>✕</button>
                  </>
                )}
              </div>
              {errors.photo && <p className={styles.errorMsg}>Please upload a photo as evidence</p>}
            </div>

            {/* Breach type */}
            <div className={styles.formGroup}>
              <label className={styles.label}>What went wrong? <span style={{ color: 'var(--red)' }}>*</span></label>
              <div className={styles.pillRow}>
                {BREACH_TYPES.map(bt => (
                  <button
                    type="button" key={bt.id}
                    className={`${styles.breachPill} ${breachType === bt.id ? styles.breachPillSelected : ''}`}
                    onClick={() => { setBreachType(bt.id); setErrors(er => ({ ...er, type: false })) }}
                  >
                    {bt.label}
                  </button>
                ))}
              </div>
              {errors.type && <p className={styles.errorMsg}>Please select a breach type</p>}
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="desc">
                Additional Details <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <textarea
                id="desc" className={styles.textarea}
                placeholder="e.g. 'Ice cream was completely liquid, packaging had moisture condensation'"
                value={desc} onChange={e => setDesc(e.target.value.slice(0, 500))} rows={3}
              />
              <p style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{desc.length}/500</p>
            </div>

            {/* Info box */}
            <div className={styles.infoBox}>
              <strong style={{ color: 'var(--cyan)' }}>Your data is protected.</strong> This report is cryptographically linked to the TTI sticker and cannot be altered by any party.
            </div>

            <Button type="submit" variant="danger" full size="lg" loading={submitting}>
              Submit Breach Report
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
