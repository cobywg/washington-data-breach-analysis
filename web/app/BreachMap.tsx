"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { countsByFips, type MapMetric } from "./breach-data";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const SOURCE_ID = "us-states";
const LAYER_ID = "breach-counts";

const COLORS = ["#202733", "#173f4c", "#126576", "#0b8f9d", "#20c6bb", "#8af5d8"];

// Read the selected metric from the generated state data.
function metricExpression(metric: MapMetric): mapboxgl.Expression {
  return [
    "match",
    ["to-string", ["get", "STATE_ID"]],
    ...Object.entries(countsByFips).flatMap(([fips, state]) => [
      fips,
      state[metric],
    ]),
    0,
  ];
}
// Use separate thresholds because affected-person totals are much larger.
function fillColorExpression(metric: MapMetric): mapboxgl.Expression {
  const stops = metric === "breaches"
    ? [1, COLORS[1], 10, COLORS[2], 25, COLORS[3], 50, COLORS[4], 100, COLORS[5]]
    : [10_000, COLORS[1], 50_000, COLORS[2], 250_000, COLORS[3], 1_000_000, COLORS[4], 3_000_000, COLORS[5]];

  return ["step", metricExpression(metric), COLORS[0], ...stops] as mapboxgl.Expression;
}

const formatNumber = new Intl.NumberFormat("en-US");

export function BreachMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const metricRef = useRef<MapMetric>("breaches");
  const [metric, setMetric] = useState<MapMetric>("breaches");

  useEffect(() => {
    if (!containerRef.current || !TOKEN) return;

    // Create the interactive map once when the component mounts.
    const map = new mapboxgl.Map({
      accessToken: TOKEN,
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-98.5, 38.5],
      zoom: 2.7,
      minZoom: 2,
      maxZoom: 7,
      attributionControl: true,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    // Display both metrics when a visitor hovers over a state.
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
    });

    map.on("load", () => {
      // Add state boundaries from Mapbox's Census vector source.
      map.addSource(SOURCE_ID, {
        type: "vector",
        url: "mapbox://mapbox.us_census_states_2015",
      });

      // Color each state according to the selected metric.
      map.addLayer({
        id: LAYER_ID,
        type: "fill",
        source: SOURCE_ID,
        "source-layer": "states",
        paint: {
          "fill-color": fillColorExpression(metricRef.current),
          "fill-opacity": 0.88,
          "fill-outline-color": "#8da1ad",
        },
      });

      map.on("mousemove", LAYER_ID, (event) => {
        const feature = event.features?.[0];
        if (!feature) return;

        const fips = String(feature.properties?.STATE_ID ?? "").padStart(2, "0");
        const state = countsByFips[fips];
        if (!state) return;

        map.getCanvas().style.cursor = "pointer";
        popup
          .setLngLat(event.lngLat)
          .setHTML(
            `<div class="map-popup"><span>${state.name}</span><strong>${formatNumber.format(state.breaches)}</strong><small>breach notifications</small><strong>${formatNumber.format(state.affected)}</strong><small>Washingtonians affected</small></div>`,
          )
          .addTo(map);
      });

      map.on("mouseleave", LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });

    return () => {
      popup.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    metricRef.current = metric;
    const map = mapRef.current;
    if (map?.getLayer(LAYER_ID)) {
      map.setPaintProperty(LAYER_ID, "fill-color", fillColorExpression(metric));
    }
  }, [metric]);

  if (!TOKEN) {
    return (
      <div className="token-message" role="status">
        <span>Mapbox connection needed</span>
        <strong>Add your token to web/.env.local</strong>
        <code>NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here</code>
      </div>
    );
  }

  return (
    <div className="map-experience">
      <div className="metric-toggle" aria-label="Select map measurement">
        <button
          type="button"
          aria-pressed={metric === "breaches"}
          onClick={() => setMetric("breaches")}
        >
          Breaches
        </button>
        <button
          type="button"
          aria-pressed={metric === "affected"}
          onClick={() => setMetric("affected")}
        >
          People affected
        </button>
      </div>
      <div className="map-shell">
        <div ref={containerRef} className="map" aria-label={`Choropleth map of ${metric === "breaches" ? "breach counts" : "affected Washingtonians"} by entity state`} />
        <div className="legend" aria-label="Map legend">
          <span>{metric === "breaches" ? "Breach notifications" : "Washingtonians affected"}</span>
          <div className="legend-scale" aria-hidden="true" />
          <div className="legend-labels">
            {metric === "breaches" ? (
              <><small>0</small><small>25</small><small>50</small><small>100+</small></>
            ) : (
              <><small>0</small><small>250K</small><small>1M</small><small>3M+</small></>
            )}
          </div>
        </div>
        <div className="map-total">50 states + DC evaluated</div>
      </div>
    </div>
  );
}
