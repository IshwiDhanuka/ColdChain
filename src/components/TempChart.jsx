import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler)

export default function TempChart({ order }) {
  const isBreached = order.stickerStatus === 'breached'
  const labels = ['T+0 min', 'T+15 min', 'T+30 min', 'T+45 min', 'T+60 min']
  const timeline = order.tempTimeline || []
  
  const [lo, hi] = parseRange(order.requiredTempRange)

  const data = {
    labels,
    datasets: [
      {
        label: 'Temp (°C)',
        data: timeline,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height || 160);
          if (isBreached) {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          } else {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          }
          return gradient;
        },
        borderColor: isBreached ? '#ef4444' : '#10b981',
        borderWidth: 3,
        pointBackgroundColor: timeline.map(v => (v >= lo && v <= hi) ? '#10b981' : '#ef4444'),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(0,0,0,0.05)',
        borderWidth: 1,
        titleColor: '#6b7280',
        bodyColor: '#111827',
        bodyFont: { family: 'Space Grotesk', weight: '700', size: 14 },
        callbacks: { label: ctx => ` ${ctx.raw}°C` },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
        ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 11, family: 'Inter' } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false, borderDash: [5, 5] },
        ticks: { color: 'rgba(0,0,0,0.4)', font: { size: 11, family: 'Inter' }, callback: v => v + '°' },
        border: { display: false },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  }

  return (
    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Temperature Timeline
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
            Safe Range: <span style={{ color: 'var(--text-primary)' }}>{order.requiredTempRange}</span>
          </p>
        </div>
        <span style={{
          background: isBreached ? 'var(--red-light)' : 'var(--green-light)',
          color: isBreached ? 'var(--red)' : 'var(--green)',
          padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
        }}>
          {isBreached ? 'Breach Detected' : 'Status Safe'}
        </span>
      </div>
      <div style={{ height: 180, position: 'relative' }}>
        <Line data={data} options={options} />
      </div>
      {isBreached && (
        <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--red-light)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
           <div style={{ color: 'var(--red)', fontWeight: 800, fontSize: 16 }}>!</div>
           <div>{order.breachReason}</div>
        </div>
      )}
    </div>
  )
}

function parseRange(rangeStr) {
  // e.g. "−18°C to −15°C" or "+2°C to +8°C"
  const nums = rangeStr.replace(/[°C]/g, '').replace(/−/g, '-').split(/\s*to\s*/).map(Number)
  return [Math.min(...nums), Math.max(...nums)]
}
