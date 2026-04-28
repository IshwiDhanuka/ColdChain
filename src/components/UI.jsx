import styles from './UI.module.css'

export function Badge({ children, variant = 'orange', style }) {
  return <span className={`${styles.badge} ${styles[`badge_${variant}`]}`} style={style}>{children}</span>
}

export function Card({ children, className = '', style = {} }) {
  return <div className={`${styles.card} ${className}`} style={style}>{children}</div>
}

export function Button({ children, variant = 'primary', size = 'md', full = false, loading = false, onClick, type = 'button', disabled, style = {} }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]} ${full ? styles.btn_full : ''} ${loading ? styles.btn_loading : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading ? <span className={styles.spinner} /> : null}
      <span className={styles.btnText}>{children}</span>
    </button>
  )
}

export function Pill({ children, selected = false, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.pill} ${selected ? styles.pill_selected : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function GlowBlobs() {
  return (
    <>
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />
    </>
  )
}
