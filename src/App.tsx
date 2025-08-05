// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { DeckGL } from "@deck.gl/react";

import { ScatterplotLayer } from "@deck.gl/layers";
import { CSVLoader } from "@loaders.gl/csv";
import { load } from "@loaders.gl/core";

import type { Color, MapViewState } from "@deck.gl/core";

const MALE_COLOR: Color = [0, 128, 255];
const FEMALE_COLOR: Color = [255, 0, 128];

// Source data CSV
const DATA_URL =
  "https://tirandocodigo.mx/proyectos/ccvis/data/total_anexos_geo.csv"; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -74,
  latitude: 40.7,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

type DataPoint = [longitude: number, latitude: number, gender: number];

export default function App({
  mapStyle = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json",
}: {
  radius?: number;
  maleColor?: Color;
  femaleColor?: Color;
  mapStyle?: string;
}) {
  const [data, setData] = useState([]);
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const pixelRatio = window.devicePixelRatio || 1;

  useEffect(() => {
    load(DATA_URL, CSVLoader, { csv: { header: true } }).then((result) => {
      setData(result);
    });
  }, []);
  const layers = [
    new ScatterplotLayer<DataPoint>({
      id: "scatter-plot",
      data,
      radiusMinPixels: 1,
      radiusMaxPixels: 30,
      getFillColor: [255, 171, 100, 130],
      getPosition: (d) => [Number(d.LON), Number(d.LAT)],
      getRadius: (d) => Math.sqrt(Number(+d.VOLUMEN_ANUAL) || 1) / 1000,
      radiusScale: isMac ? 10 * pixelRatio : 10, // Ajustar escala según el pixel ratio
      filled: true,
      stroked: false,
      pickable: true,
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
