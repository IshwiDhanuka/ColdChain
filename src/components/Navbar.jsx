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
      <Link to="/scan" className={styles.scanBtn}>Scan QR</Link>
    </nav>
  )
}
