import { Link, useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar({ backTo, backLabel }) {
  const navigate = useNavigate()
  return (
    <nav className={styles.nav}>
      {backTo ? (
        <button className={styles.backBtn} onClick={() => navigate(backTo)}>
          ← {backLabel || 'Back'}
        </button>
      ) : (
        <div style={{ width: 70 }} />
      )}
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}></span>
        <span>ColdChain</span>
      </Link>
      <div className={styles.actions}>
        <Link to="/generate" className={styles.generateBtn}>Generate QR</Link>
        <Link to="/scan" className={styles.scanBtn}>Scan QR</Link>
      </div>
    </nav>
  )
}
