// ============================================================
// COLDCHAIN MOCK API — localStorage + seed data
// Shared key: cc_breaches (also consumed by FE-2 admin panel)
// ============================================================

const SEED_ORDERS = [
  {
    orderId: 'ORD-001',
    product: 'Häagen-Dazs Vanilla Ice Cream (500ml)',
    brand: 'Häagen-Dazs',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
    requiredTempRange: '−18°C to −15°C',
    restaurant: 'FrostyBites Ice Cream Parlour',
    deliveryPartner: 'Ravi Kumar', deliveryPartnerId: 'DP-4412',
    orderedAt: '2026-04-25T08:10:00+05:30', deliveredAt: '2026-04-25T08:52:00+05:30',
    stickerId: 'STK-001-A3F2', stickerStatus: 'intact',
    tempAtDispatch: '−16.4°C', tempAtDelivery: '−15.9°C',
    tempTimeline: [-16.4, -16.1, -15.8, -16.0, -15.9],
    partnerScore: 94, platform: 'Zomato',
  },
  {
    orderId: 'ORD-002',
    product: 'Amul Frozen Butter Paneer (300g)',
    brand: 'Amul',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
    requiredTempRange: '−8°C to −5°C',
    restaurant: 'Punjab Kitchen',
    deliveryPartner: 'Suresh Babu', deliveryPartnerId: 'DP-8871',
    orderedAt: '2026-04-25T11:20:00+05:30', deliveredAt: '2026-04-25T12:18:00+05:30',
    stickerId: 'STK-002-B7C9', stickerStatus: 'breached',
    tempAtDispatch: '−6.1°C', tempAtDelivery: '+3.4°C',
    tempTimeline: [-6.1, -4.2, -1.0, 1.8, 3.4],
    partnerScore: 47, platform: 'Swiggy',
    breachReason: 'Temperature exceeded safe range by +9.4°C during transit — product thawed and refroze.',
  },
  {
    orderId: 'ORD-003',
    product: 'Insulin (Refrigerated) — Novo Nordisk',
    brand: 'Novo Nordisk',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    requiredTempRange: '+2°C to +8°C',
    restaurant: 'MedQuick Pharmacy',
    deliveryPartner: 'Anjali Singh', deliveryPartnerId: 'DP-2230',
    orderedAt: '2026-04-25T09:45:00+05:30', deliveredAt: '2026-04-25T10:30:00+05:30',
    stickerId: 'STK-003-D1E5', stickerStatus: 'intact',
    tempAtDispatch: '+4.2°C', tempAtDelivery: '+5.1°C',
    tempTimeline: [4.2, 4.5, 5.1, 4.8, 5.1],
    partnerScore: 98, platform: '1mg',
  },
  {
    orderId: 'ORD-004',
    product: 'Imported Salmon Sashimi (250g)',
    brand: 'OceanCatch',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80',
    requiredTempRange: '0°C to +4°C',
    restaurant: 'Tokyo Fresh Market',
    deliveryPartner: 'Rahul Sharma', deliveryPartnerId: 'DP-9011',
    orderedAt: '2026-04-25T13:00:00+05:30', deliveredAt: '2026-04-25T13:55:00+05:30',
    stickerId: 'STK-004-9XQ1', stickerStatus: 'breached',
    tempAtDispatch: '+1.5°C', tempAtDelivery: '+12.4°C',
    tempTimeline: [1.5, 4.2, 6.8, 10.1, 12.4],
    partnerScore: 32, platform: 'Zepto',
    breachReason: 'Severe cooling failure. Product exposed to ambient heat exceeding 12°C for over 20 minutes.',
  },
  {
    orderId: 'ORD-005',
    product: 'Blueberry Gelato Pint',
    brand: 'Naturals Ice Cream',
    image: 'https://images.unsplash.com/photo-1570197781417-0c7a52230da3?w=400&q=80',
    requiredTempRange: '−18°C to −12°C',
    restaurant: 'Naturals Gelato Juhu',
    deliveryPartner: 'Priya Verma', deliveryPartnerId: 'DP-5552',
    orderedAt: '2026-04-25T14:30:00+05:30', deliveredAt: '2026-04-25T14:50:00+05:30',
    stickerId: 'STK-005-PLM9', stickerStatus: 'intact',
    tempAtDispatch: '−15.2°C', tempAtDelivery: '−14.8°C',
    tempTimeline: [-15.2, -15.0, -14.9, -14.8, -14.8],
    partnerScore: 99, platform: 'Swiggy',
  }
]

const delay = ms => new Promise(r => setTimeout(r, ms))
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

function generateRefId() {
  const d = new Date()
  const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const rand = Math.random().toString(36).substring(2,6).toUpperCase()
  return `BR-${date}-${rand}`
}

export const MockApi = {
  async getOrder(orderId) {
    await delay(500)
    const order = SEED_ORDERS.find(o => o.orderId === orderId.toUpperCase())
    if (!order) return { ok: false, message: `No order found with ID "${orderId}". Check the sticker and try again.` }
    return { ok: true, data: order }
  },

  async submitBreach(payload) {
    const form = new FormData()
    const fields = [
      'orderId',
      'product',
      'deliveryPartner',
      'deliveryPartnerId',
      'platform',
      'breachType',
      'description',
    ]

    fields.forEach(field => {
      if (payload[field] !== undefined && payload[field] !== null) {
        form.append(field, payload[field])
      }
    })

    if (payload.photoFile) {
      form.append('photo', payload.photoFile, payload.photoFile.name || 'breach-photo.jpg')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/breach`, {
        method: 'POST',
        body: form,
      })
      const json = await response.json()
      if (!response.ok || !json.ok) {
        return { ok: false, message: json.error || 'Submission failed' }
      }
      return { ok: true, data: json.data }
    } catch {
      await delay(700)
      const refId = generateRefId()
      const breach = { refId, ...payload, submittedAt: new Date().toISOString(), status: 'submitted' }
      const existing = this.getLocalBreaches()
      existing.push(breach)
      localStorage.setItem('cc_breaches', JSON.stringify(existing))
      return { ok: true, data: { refId, submittedAt: breach.submittedAt } }
    }
  },

  getLocalBreaches() {
    try { return JSON.parse(localStorage.getItem('cc_breaches') || '[]') } catch { return [] }
  },

  async getBreaches() {
    try {
      const response = await fetch(`${API_BASE_URL}/breach`)
      const json = await response.json()
      if (!response.ok || !json.ok) return { ok: false, data: this.getLocalBreaches() }
      return { ok: true, data: json.data }
    } catch {
      return { ok: true, data: this.getLocalBreaches() }
    }
  },

  getAllOrders() {
    return SEED_ORDERS;
  },

  getHistoricalAnalytics() {
    // Generate some visually appealing dummy data for charts
    const dates = Array.from({length: 14}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return `${d.getDate()}/${d.getMonth()+1}`;
    });
    
    // Smooth random curve for deliveries
    const totalDeliveries = [120, 135, 142, 128, 150, 160, 155, 140, 145, 165, 180, 175, 190, 200];
    const breachRates = [4, 5, 3, 6, 4, 3, 4, 12, 15, 8, 5, 4, 3, 2]; // Spike in the middle (anomaly)
    
    return {
      labels: dates,
      deliveries: totalDeliveries,
      breaches: breachRates
    };
  },

  async resetDemo() {
    localStorage.removeItem('cc_breaches')
    try {
      await fetch(`${API_BASE_URL}/breach`, { method: 'DELETE' })
    } catch { }
    return { ok: true }
  },

  extractOrderId(rawText) {
    try {
      const url = new URL(rawText)
      return url.searchParams.get('orderId') || null
    } catch {
      if (/^ORD-\d{3,}$/i.test(rawText.trim())) return rawText.trim().toUpperCase()
      return null
    }
  }
}
