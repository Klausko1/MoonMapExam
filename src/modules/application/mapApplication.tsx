// mapApplication.tsx
import "./application.css";
import React, { useEffect, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";
import { useGeographic } from "ol/proj";
import "ol/ol.css";
import { MapView } from "../map/mapView";

useGeographic();

export function MapApplication() {
  const [map] = useState(
    new Map({
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://s3.amazonaws.com/opmbuilder/301_moon/tiles/w/hillshaded-albedo/{z}/{x}/{-y}.png",
          }),
        }),
      ],
      view: new View({ center: [0, 0], zoom: 4 }),
    }),
  );

  return (
    <>
      <header>
        <h1>Moon map</h1>
      </header>
      <MapView map={map} />
    </>
  );
}
