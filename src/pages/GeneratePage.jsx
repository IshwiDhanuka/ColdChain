import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Badge, Button, GlowBlobs } from '../components/UI'
import { useToast, ToastContainer } from '../hooks/useToast'
import { MockApi } from '../services/mockApi'
import styles from './GeneratePage.module.css'

const initialForm = {
  product: '',
  brand: '',
  requiredTempRange: '-18°C to -12°C',
  restaurant: '',
  platform: 'ColdChain Demo',
  stickerStatus: 'intact',
}

export default function GeneratePage() {
  const { toasts, showToast } = useToast()
  const [form, setForm] = useState(initialForm)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  function updateField(field, value) {
    setForm(current => ({ ...current, [field]: value }))
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.product.trim()) {
      showToast('Add a product name.', 'error')
      return
    }

    if (!photoFile) {
      showToast('Add a product photo.', 'error')
      return
    }

    setSubmitting(true)
    const res = await MockApi.generateOrder({
      ...form,
      product: form.product.trim(),
      brand: form.brand.trim() || 'Demo Product',
      restaurant: form.restaurant.trim() || 'Demo Cold Kitchen',
      photoFile,
    })
    setSubmitting(false)

    if (!res.ok) {
      showToast(res.message || 'Could not generate QR.', 'error')
      return
    }

    setResult(res.data)
    showToast('QR generated successfully.', 'success')
  }

  return (
    <div className={styles.root}>
      <GlowBlobs />
      <ToastContainer toasts={toasts} />
      <Navbar backTo="/" backLabel="Home" />

      <main className={styles.page}>
        <section className={styles.panel}>
          <div className={styles.header}>
            <Badge variant="orange">Sticker Tool</Badge>
            <h1>Generate product QR</h1>
            <p>Create a demo cold-chain order, upload its product photo, and print or scan the generated QR.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Product name</span>
              <input
                value={form.product}
                onChange={e => updateField('product', e.target.value)}
                placeholder="e.g. Amul Frozen Paneer"
              />
            </label>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Brand</span>
                <input
                  value={form.brand}
                  onChange={e => updateField('brand', e.target.value)}
                  placeholder="e.g. Amul"
                />
              </label>

              <label className={styles.field}>
                <span>Temperature range</span>
                <input
                  value={form.requiredTempRange}
                  onChange={e => updateField('requiredTempRange', e.target.value)}
                  placeholder="-18°C to -12°C"
                />
              </label>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span>Restaurant / producer</span>
                <input
                  value={form.restaurant}
                  onChange={e => updateField('restaurant', e.target.value)}
                  placeholder="Demo Cold Kitchen"
                />
              </label>

              <label className={styles.field}>
                <span>Platform</span>
                <input
                  value={form.platform}
                  onChange={e => updateField('platform', e.target.value)}
                  placeholder="ColdChain Demo"
                />
              </label>
            </div>

            <div className={styles.segment}>
              <button
                type="button"
                className={form.stickerStatus === 'intact' ? styles.segmentActive : ''}
                onClick={() => updateField('stickerStatus', 'intact')}
              >
                Intact sticker
              </button>
              <button
                type="button"
                className={form.stickerStatus === 'breached' ? styles.segmentActive : ''}
                onClick={() => updateField('stickerStatus', 'breached')}
              >
                Breached sticker
              </button>
            </div>

            <label className={styles.photoBox}>
              <input type="file" accept="image/*" onChange={handlePhoto} />
              {photoPreview ? (
                <img src={photoPreview} alt="Product preview" />
              ) : (
                <span>Add product photo</span>
              )}
            </label>

            <Button type="submit" full size="lg" loading={submitting}>
              Generate QR
            </Button>
          </form>
        </section>

        <aside className={styles.result}>
          {result ? (
            <>
              <div>
                <Badge variant={result.order.stickerStatus === 'breached' ? 'red' : 'green'}>
                  {result.order.stickerStatus === 'breached' ? 'Breached' : 'Intact'}
                </Badge>
                <h2>{result.order.orderId}</h2>
                <p>{result.order.product}</p>
              </div>
              <img className={styles.qr} src={result.qrImage} alt={`QR for ${result.order.orderId}`} />
              <div className={styles.resultActions}>
                <Link to={`/scan?orderId=${result.order.orderId}`} className={styles.primaryLink}>Open scan page</Link>
                <a href={result.qrImage} download={`${result.order.orderId}-qr.png`} className={styles.secondaryLink}>Download QR</a>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyQr} />
              <h2>QR preview</h2>
              <p>Your generated QR will appear here after the product is saved.</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
