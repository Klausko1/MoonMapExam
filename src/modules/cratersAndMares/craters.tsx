// OpenLayers and React imports
import Feature from "ol/Feature";
import { Style, Fill, Stroke, Text } from "ol/style";
import Polygon from "ol/geom/Polygon";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Map } from "ol";
import React, { useEffect } from "react";

// adding clicking functionality
import { setupCraterClick } from "./CraterInfo";

interface CratersProps {
  map: Map;
  show: boolean;
}

async function fetchCraters(map: Map) {
  try {
    const response = await fetch(
      "https://moonmapexam-6c2201712d34.herokuapp.com/moon-craters",
    );
    if (!response.ok) throw new Error("Error fetching data from the API");

    const data = await response.json();

    const vectorSource = new VectorSource({
      features: data.map(
        (crater: {
          radius: number;
          num_points: number;
          longitude: number;
          latitude: number;
          name: string;
          wiki: string;
        }) => {
          const num_points = crater.num_points || 16;
          const radius = crater.radius;
          const points = [];
          for (let i = 0; i < num_points; i++) {
            const angle = (i * 2 * Math.PI) / num_points;
            const pointLongitudeRadians =
              ((crater.latitude + radius * Math.sin(angle)) * Math.PI) / 180;
            const pointLongitude =
              crater.longitude +
              ((radius * Math.cos(angle)) / Math.cos(pointLongitudeRadians)) *
                4.5;
            const pointLatitude =
              crater.latitude + radius * Math.sin(angle) * 4.5;
            points.push(fromLonLat([pointLongitude, pointLatitude]));
          }
          points.push(points[0]);

          const polygon = new Polygon([points]);
          const feature = new Feature({
            geometry: polygon,
            name: crater.name,
            wiki: crater.wiki,
          });
          feature.setStyle(
            new Style({
              fill: new Fill({
                color: "rgba(255, 204, 51, 0.1)",
              }),
              stroke: new Stroke({
                color: "rgba(255, 204, 51, 0.5)",
                width: 2,
              }),
              text: new Text({
                font: "14px Calibri,sans-serif",
                fill: new Fill({
                  color: "#000",
                }),
                stroke: new Stroke({
                  color: "#fff",
                  width: 2,
                }),
                text: feature.get("name"),
              }),
            }),
          );
          return feature;
        },
      ),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      properties: { id: "Craters" },
      minZoom: 3,
      zIndex: 20,
    });

    map
      .getLayers()
      .getArray()
      .filter(
        (layer) =>
          layer instanceof VectorLayer && layer.get("id") === "Craters",
      )
      .forEach((layer) => map.removeLayer(layer));
    map.addLayer(vectorLayer);
    setupCraterClick(map);
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
}

const Craters: React.FC<CratersProps> = ({ map, show }) => {
  useEffect(() => {
    if (show) {
      fetchCraters(map);
    } else {
      map
        .getLayers()
        .getArray()
        .filter(
          (layer) =>
            layer instanceof VectorLayer && layer.get("id") === "Craters",
        )
        .forEach((layer) => map.removeLayer(layer));
    }
  }, [map, show]);

  return null; // This component does not render anything itself
};

export default Craters;
