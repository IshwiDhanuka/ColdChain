import { useState, useCallback } from 'react'

let _id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++_id
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  return { toasts, showToast }
}

export function ToastContainer({ toasts }) {
  const icons = { success: '✓', error: '✕', info: 'ℹ' }
  return (
    <div style={{
      position: 'fixed', top: 'calc(var(--safe-top) + 12px)', left: '50%',
      transform: 'translateX(-50%)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: 8,
      width: 'calc(100% - 40px)', maxWidth: 400,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '14px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 12,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          animation: 'fadeInUp .3s cubic-bezier(0.34,1.56,0.64,1) both',
          boxShadow: '0 8px 32px rgba(0,0,0,.6)',
          background: t.type === 'success' ? 'rgba(0,230,118,.15)' : t.type === 'error' ? 'rgba(255,75,110,.15)' : 'rgba(0,212,255,.12)',
          border: `1px solid ${t.type === 'success' ? 'rgba(0,230,118,.3)' : t.type === 'error' ? 'rgba(255,75,110,.3)' : 'rgba(0,212,255,.3)'}`,
          color: t.type === 'success' ? 'var(--green)' : t.type === 'error' ? 'var(--red)' : 'var(--cyan)',
        }}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
