import { Link } from 'react-router-dom'
import { GlowBlobs, Badge, Card } from '../components/UI'
import Navbar from '../components/Navbar'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  return (
    <div className={styles.root}>
      <GlowBlobs />
      <Navbar />

      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <div className={styles.eyebrowDot} />
            Version 3.0 • Trust Architecture Edition
          </div>
          <h1 className={styles.heroTitle}>
            Cold Chain Integrity<br />
            <span className={styles.gradOrange}>Verification System</span>
          </h1>
          <p className={styles.heroSub}>
            Zero-tech consumer verification for temperature-sensitive deliveries. 
            A unified trust architecture ensuring honest producers, accountable delivery partners, and empowered consumers.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/scan" className={styles.ctaPrimary}>Scan Prototype Sticker</Link>
            <Link to="/generate" className={styles.ctaGhost}>Generate QR</Link>
            <a href="#architecture" className={styles.ctaGhost}>Explore Architecture ↓</a>
          </div>
        </div>

        <div className={styles.heroImage}>
          <div className={styles.floatingMockup}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupIcon}>✓</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Cold Chain Intact</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ORD-001 • Häagen-Dazs Vanilla</div>
              </div>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupRow}>
                <span className={styles.mockupLabel}>Source Temp</span>
                <span className={styles.mockupValSuccess}>−16.4°C</span>
              </div>
              <div className={styles.mockupRow}>
                <span className={styles.mockupLabel}>Delivery Temp</span>
                <span className={styles.mockupValSuccess}>−15.9°C</span>
              </div>
              <div className={styles.mockupDivider} />
              <div className={styles.mockupRow}>
                <span className={styles.mockupLabel}>Partner Score</span>
                <span className={styles.mockupVal}>94 / 100</span>
              </div>
            </div>
          </div>
          <div className={styles.floatingMockupBad}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupIconBad}>!</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Breach Detected</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ORD-002 • Amul Frozen Paneer</div>
              </div>
            </div>
            <div className={styles.mockupBody}>
              <div className={styles.mockupRow}>
                <span className={styles.mockupLabel}>Source Temp</span>
                <span className={styles.mockupValSuccess}>−6.1°C</span>
              </div>
              <div className={styles.mockupRow}>
                <span className={styles.mockupLabel}>Delivery Temp</span>
                <span className={styles.mockupValBad}>+3.4°C</span>
              </div>
              <div className={styles.mockupDivider} />
              <div className={styles.mockupRow}>
                <span className={styles.mockupLabel}>Automated Action</span>
                <span className={styles.mockupValBad}>Refund Initiated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM STATEMENT ===== */}
      <section className={styles.section} style={{ background: 'var(--bg-surface)' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <Badge variant="orange">The Problem</Badge>
            <h2>Cold chain failure is silently destroying trust</h2>
            <p className={styles.sectionDesc}>
              Consumers ordering temperature-sensitive products routinely receive items that show signs of melting and refreezing. 
              Refund decisions are currently based on consumer word alone — resulting in high dispute rates and unchecked delivery partner behavior.
            </p>
          </div>

          <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <div className={styles.statNum}>43%</div>
              <div className={styles.statLabel}>Of surveyed platform users reported receiving partially melted frozen products in summer months.</div>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statNum}>12%</div>
              <div className={styles.statLabel}>Of consumers successfully received refunds due to lack of objective evidence bridging the trust gap.</div>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statNum}>Zero</div>
              <div className={styles.statLabel}>Current visibility into real-time temperature conditions for last-mile delivery partners.</div>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== TRUST ARCHITECTURE ===== */}
      <section id="architecture" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <Badge variant="yellow">v3.0 Framework</Badge>
            <h2>Data Ownership Boundary</h2>
            <p className={styles.sectionDesc}>
              The core design principle: no single actor controls the full chain. Every actor's data is cross-validated by the next actor downstream.
            </p>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustBox}>
              <div className={styles.trustIcon}>1</div>
              <h3>1. Producer Integrity</h3>
              <p>System generates data; producer only applies the sticker. Factory floor IoT sensors log source ambient temperatures autonomously. Sticker application is GPS-verified.</p>
              <ul className={styles.trustList}>
                <li>No manual data entry</li>
                <li>Regulatory license validation (FSSAI/CDSCO)</li>
                <li>Blockchain anchoring at source</li>
              </ul>
            </div>
            
            <div className={styles.trustBox}>
              <div className={styles.trustIcon}>2</div>
              <h3>2. Delivery Accountability</h3>
              <p>Phase 2 replaces pre-printed stickers with reusable BLE 5.0 tags. Every 2 minutes, temperature and GPS are logged to an immutable hash-chained cloud log.</p>
              <ul className={styles.trustList}>
                <li>Passive mobile background scanning</li>
                <li>Real-time breach alerts</li>
                <li>Accountability scoring system</li>
              </ul>
            </div>

            <div className={styles.trustBox}>
              <div className={styles.trustIcon}>3</div>
              <h3>3. Consumer Verification</h3>
              <p>A zero-friction React PWA using a mobile camera to scan the TTI sticker. Instant delivery intelligence including time overruns and product-specific visual checklists.</p>
              <ul className={styles.trustList}>
                <li>One-tap breach reporting</li>
                <li>ML-imaged photo evidence</li>
                <li>Automated refund webhook API</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS (Demo) ===== */}
      <section className={styles.section} style={{ background: 'var(--bg-surface)' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <Badge variant="green">Prototype Live</Badge>
            <h2>Test the Consumer Flow</h2>
            <p className={styles.sectionDesc}>
              Phase 1 eliminates physical BLE tags for evaluator demos by using pre-printed TTI stickers. Use the URLs below to simulate real-world outcomes.
            </p>
          </div>

          <div className={styles.demoCards}>
            <Card className={styles.demoCard}>
              <div className={styles.demoCardTop}>
                <h4>Scenario A: Intact Order</h4>
                <Badge variant="green">ORD-001</Badge>
              </div>
              <p>Simulates a successful delivery. The app verifies the QR code and shows a green "Cold Chain Intact" screen along with a simulated safe temperature timeline.</p>
              <Link to="/scan?orderId=ORD-001" className={styles.demoBtnOutlined}>Run Scenario A</Link>
            </Card>
            
            <Card className={styles.demoCard}>
              <div className={styles.demoCardTop}>
                <h4>Scenario B: Breached Order</h4>
                <Badge variant="red">ORD-002</Badge>
              </div>
              <p>Simulates a failed delivery. Automatically triggers the Breach Reporting Flow, allowing you to upload photo evidence and receive an automated reference ID.</p>
              <Link to="/scan?orderId=ORD-002" className={styles.demoBtnOutlined}>Run Scenario B</Link>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== ROADMAP ===== */}
      <section className={styles.section}>
        <div className={styles.container}>
           <div className={styles.sectionHeader}>
              <Badge variant="orange">Roadmap</Badge>
              <h2>Phased Implementation</h2>
           </div>
           
           <div className={styles.tableWrap}>
             <table className={styles.table}>
               <thead>
                 <tr>
                   <th>Factor</th>
                   <th>Phase 1: TTI Sticker System</th>
                   <th>Phase 2: BLE IoT Sensor System</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td><strong>Sensing Tech</strong></td>
                   <td>Chemically reactive printed sticker (green/red dot)</td>
                   <td>Reusable BLE 5.0 sensor tag (NTC thermistor)</td>
                 </tr>
                 <tr>
                   <td><strong>Data Richness</strong></td>
                   <td>Binary: Breach / No Breach</td>
                   <td>Continuous: Full 2-minute time-temperature log</td>
                 </tr>
                 <tr>
                   <td><strong>Partner Friction</strong></td>
                   <td>Zero — No partner action needed</td>
                   <td>Delivery App passive scanning and tag attachment required</td>
                 </tr>
                 <tr>
                   <td><strong>Tamper Resistance</strong></td>
                   <td>Medium — GPS photos at pickup</td>
                   <td>High — Immutable hash-chained cloud log</td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      </section>

      {/* ===== PRE-FOOTER CTA ===== */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to evaluate the prototype?</h2>
            <p className={styles.ctaDesc}>Jump right into the React-powered consumer application.</p>
            <Link to="/scan" className={styles.ctaPrimaryBtn}>Launch Scanner App</Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--text-primary)' }}>
               <span style={{ fontSize: 20 }}></span> ColdChain
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Internal High-Level Design Prototype v3.0 • April 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
