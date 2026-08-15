"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { countsByFips } from "./breach-data";

const TOKEN = process.env.pk.eyJ1IjoiY29ieXdnIiwiYSI6ImNsb290dHAyYzAzN2syam16N3FrbXVtNnIifQ._au5sBLoVsaFSUvkTDOLkA;
const SOURCE_ID = "us-states";
const LAYER_ID = "breach-counts";

const countExpression: mapboxgl.Expression = [
  "match",
  ["to-string", ["get", "STATE_ID"]],
  ...Object.entries(countsByFips).flatMap(([fips, state]) => [
    fips,
    state.count,
  ]),
  0,
];

export function BreachMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !TOKEN) return;

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

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
    });

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "vector",
        url: "mapbox://mapbox.us_census_states_2015",
      });

      map.addLayer({
        id: LAYER_ID,
        type: "fill",
        source: SOURCE_ID,
        "source-layer": "states",
        paint: {
          "fill-color": [
            "step",
            countExpression,
            "#202733",
            1,
            "#173f4c",
            10,
            "#126576",
            25,
            "#0b8f9d",
            50,
            "#20c6bb",
            100,
            "#8af5d8",
          ],
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
            `<div class="map-popup"><span>${state.name}</span><strong>${state.count}</strong><small>reported breaches</small></div>`,
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
    };
  }, []);

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
    <div className="map-shell">
      <div ref={containerRef} className="map" aria-label="Choropleth map of breach counts by entity state" />
      <div className="legend" aria-label="Map legend">
        <span>Breaches</span>
        <div className="legend-scale" aria-hidden="true" />
        <div className="legend-labels">
          <small>0</small>
          <small>25</small>
          <small>50</small>
          <small>100+</small>
        </div>
      </div>
      <div className="map-total">50 states + DC evaluated</div>
    </div>
  );
}
