"use client";

import { useState } from "react";
import {
  cyberattackTypes,
  industries,
  type CategorySummary,
  type MapMetric,
} from "./breach-data";

const formatNumber = new Intl.NumberFormat("en-US");

type CategoryChartProps = {
  data: CategorySummary[];
  description: string;
  metric: MapMetric;
  title: string;
};

function CategoryChart({ data, description, metric, title }: CategoryChartProps) {
  const sortedData = [...data].sort((a, b) => b[metric] - a[metric]);
  const maximum = sortedData[0]?.[metric] ?? 1;
  const unit = metric === "breaches" ? "notifications" : "Washingtonians affected";

  return (
    <article className="chart-card">
      <header className="chart-card-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </header>
      <ol className="bar-chart" aria-label={`${title} by ${unit}`}>
        {sortedData.map((item) => {
          const value = item[metric];
          const width = maximum === 0 ? 0 : (value / maximum) * 100;

          return (
            <li className="bar-row" key={item.category}>
              <div className="bar-label">
                <span>{item.category}</span>
                <strong>{formatNumber.format(value)}</strong>
              </div>
              <div className="bar-track" aria-hidden="true">
                <div className="bar-fill" style={{ width: `${width}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

export function BreachCharts() {
  const [metric, setMetric] = useState<MapMetric>("breaches");

  return (
    <section className="charts-section" aria-labelledby="charts-title">
      <div className="charts-heading">
        <div>
          <p className="eyebrow">Reported patterns</p>
          <h2 id="charts-title">Breach frequency and impact</h2>
          <p>
            Compare how often categories appear with the number of Washington
            residents reported as affected.
          </p>
        </div>
        <div className="metric-toggle chart-toggle" aria-label="Select chart measurement">
          <button
            type="button"
            aria-pressed={metric === "breaches"}
            onClick={() => setMetric("breaches")}
          >
            Breach notifications
          </button>
          <button
            type="button"
            aria-pressed={metric === "affected"}
            onClick={() => setMetric("affected")}
          >
            People affected
          </button>
        </div>
      </div>

      <div className="chart-grid">
        <CategoryChart
          data={cyberattackTypes}
          description="Cyberattack notifications only, grouped by reported attack type."
          metric={metric}
          title="Cyberattack type"
        />
        <CategoryChart
          data={industries}
          description="All selected breach notifications, grouped by reported industry."
          metric={metric}
          title="Industry"
        />
      </div>

      {metric === "affected" && (
        <p className="chart-note">
          Affected-person totals can be dominated by a small number of very large
          incidents, so bar length reflects impact rather than typical breach size.
        </p>
      )}
    </section>
  );
}
