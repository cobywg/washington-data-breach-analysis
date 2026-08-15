import { BreachMap } from "./BreachMap";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="brand-mark" aria-hidden="true">
          WA
        </div>
        <div>
          <p className="eyebrow">Washington data breach analysis</p>
          <h1>Where breaches affecting Washingtonians originate</h1>
          <p className="lede">
            Reported breach notifications grouped by the breached entity&apos;s
            state—not the residence of the people affected.
          </p>
        </div>
      </header>

      <section className="stat-grid" aria-label="Dataset summary">
        <article className="stat-card">
          <span>Reporting years</span>
          <strong>2022–2025</strong>
          <small>Four complete AGO reporting cycles</small>
        </article>
        <article className="stat-card">
          <span>Mapped breaches</span>
          <strong>786</strong>
          <small>Counted by unique notification ID</small>
        </article>
        <article className="stat-card warning">
          <span>Unknown location</span>
          <strong>60</strong>
          <small>7.1% excluded from the map</small>
        </article>
      </section>

      <section className="map-section">
        <div className="map-heading">
          <div>
            <p className="eyebrow">Entity location</p>
            <h2>Breach notifications by state</h2>
          </div>
          <p className="map-instruction">Hover over a state to inspect it</p>
        </div>
        <BreachMap />
        <div className="map-footer">
          <p>
            <strong>How to read this map:</strong> Darker states reported more
            distinct breaches affecting Washington residents.
          </p>
          <p>
            AGO reporting years run July 24 through July 23. Records without a
            valid entity state remain in the analysis but are not mapped.
          </p>
        </div>
      </section>
    </main>
  );
}
