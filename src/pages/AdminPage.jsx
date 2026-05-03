import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button } from '../components/UI'
import { MockApi } from '../services/mockApi'
import styles from './AdminPage.module.css'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Line, Chart } from 'react-chartjs-2'
import { useToast, ToastContainer } from '../hooks/useToast'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

export default function AdminPage() {
  const { toasts, showToast } = useToast()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [breaches, setBreaches] = useState([])
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setOrders(MockApi.getAllOrders())
    setAnalytics(MockApi.getHistoricalAnalytics())
    const result = await MockApi.getBreaches()
    setBreaches(result.ok ? result.data : [])
  }

  async function handleReset() {
    await MockApi.resetDemo()
    showToast('Demo Environment Reset Successfully', 'success')
    await loadData()
  }

  const chartData = analytics ? {
    labels: analytics.labels,
    datasets: [
      {
        type: 'line',
        label: 'Anomalies / Breaches',
        data: analytics.breaches,
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
        yAxisID: 'y1',
      },
      {
        type: 'bar',
        label: 'Total Deliveries',
        data: analytics.deliveries,
        backgroundColor: 'rgba(245, 158, 11, 0.2)', // Yellow-light
        borderColor: '#f59e0b',
        borderWidth: 1,
        borderRadius: 6,
        yAxisID: 'y',
      }
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Inter', size: 13 }, color: '#4b5563', usePointStyle: true } },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(0,0,0,0.05)',
        borderWidth: 1,
        titleColor: '#6b7280',
        bodyColor: '#111827',
        bodyFont: { family: 'Space Grotesk', weight: '700', size: 14 },
        padding: 12, cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { family: 'Inter' } }, border: { display: false } },
      y: { 
        type: 'linear', display: true, position: 'left',
        grid: { color: 'rgba(0,0,0,0.03)', borderDash: [5, 5] }, 
        ticks: { color: '#6b7280' }, border: { display: false }
      },
      y1: {
        type: 'linear', display: true, position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#ef4444' }, border: { display: false },
        suggestedMax: 20
      }
    },
  };

  const activeBreachCount = breaches.length;

  return (
    <div className={styles.dashboard}>
      <ToastContainer toasts={toasts} />
      
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoOrange}>ColdChain</span> Hub
        </div>
        <nav style={{ flex: 1 }}>
          <div className={`${styles.navItem} ${styles.active}`}>📊 Dashboard</div>
          <div className={styles.navItem} onClick={() => navigate('/')}>🏠 Consumer App</div>
          <div className={styles.navItem}>📦 Seeds & Orders</div>
          <div className={styles.navItem}>👥 Partners</div>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <Button variant="danger" full onClick={handleReset} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', boxShadow: 'none' }}>
            Flush Demo Data
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <Badge variant="yellow" style={{ marginBottom: 12 }}>Evaluator View</Badge>
            <h1 className={styles.title}>System Overview</h1>
            <p className={styles.subtitle}>Monitor delivery integrity, verify reported breaches, and track delivery partner performance across the network.</p>
          </div>
        </div>

        {/* Top Metrics */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricVal}>4,291</div>
            <div className={styles.metricLabel}>Total Orders (MTD)</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricVal} style={{ color: activeBreachCount > 0 ? '#ef4444' : '#10b981' }}>{activeBreachCount}</div>
            <div className={styles.metricLabel}>Pending Breach Reports</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricVal}>92.4%</div>
            <div className={styles.metricLabel}>Avg. Partner Trust Score</div>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Analytics Chart */}
          <div className={styles.cardWrap}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Breach Analytics & Trends</div>
              <Badge variant="orange">Last 14 Days</Badge>
            </div>
            <div className={styles.chartContainer}>
              {chartData && <Chart type='bar' data={chartData} options={chartOptions} />}
            </div>
          </div>

          {/* Breach Log View */}
          <div className={styles.cardWrap}>
             <div className={styles.cardHeader}>
               <div className={styles.cardTitle}>Live Breach Reports</div>
               <Badge variant="red">{breaches.length} Total</Badge>
             </div>
             <div className={styles.list}>
               {breaches.length === 0 ? (
                 <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No breach reports found. <br /> Run Scenario B to submit a breach.
                 </div>
               ) : breaches.map((b, i) => (
                 <div key={i} className={styles.listItem}>
                   <div className={styles.itemTop}>
                     <div className={styles.itemRef}>{b.refId}</div>
                     <div className={styles.itemDate}>{fmtTime(b.submittedAt)}</div>
                   </div>
                   <div className={styles.itemRow}>
                     <span className={styles.itemLabel}>Order</span>
                     <span className={styles.itemVal}>{b.orderId}</span>
                   </div>
                   <div className={styles.itemRow}>
                     <span className={styles.itemLabel}>Type</span>
                     <span style={{ color: 'var(--red)', fontWeight: 600 }}>{b.breachType}</span>
                   </div>
                   <div className={styles.itemRow}>
                     <span className={styles.itemLabel}>Partner</span>
                     <span className={styles.itemVal}>{b.deliveryPartner}</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Order Status View (Full Width in Grid) */}
          <div className={styles.cardWrap} style={{ gridColumn: '1 / -1' }}>
             <div className={styles.cardHeader}>
               <div className={styles.cardTitle}>Live Seed Orders & Tags</div>
               <Badge variant="green">{orders.length} Monitored</Badge>
             </div>
             <div className={styles.list} style={{ maxHeight: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
               {orders.map(o => {
                 const breached = o.stickerStatus === 'breached';
                 return (
                 <div key={o.orderId} className={styles.listItem} style={{ background: '#fff' }}>
                   <div className={styles.itemTop} style={{ marginBottom: 16 }}>
                     <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{o.orderId}</div>
                     <Badge variant={breached ? 'red' : 'green'}>{breached ? 'Anomaly Detected' : 'Chain Intact'}</Badge>
                   </div>
                   <div className={styles.itemDetail} style={{ marginBottom: 16 }}>
                     {o.product}
                   </div>
                   <div className={styles.itemRow}>
                     <span className={styles.itemLabel}>Hardware Tag</span>
                     <span className={styles.itemVal} style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{o.stickerId}</span>
                   </div>
                   <div className={styles.itemRow}>
                     <span className={styles.itemLabel}>Partner</span>
                     <span className={styles.itemVal}>{o.deliveryPartner}</span>
                   </div>
                 </div>
               )})}
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function fmtTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
