import React, { useEffect } from "react";
import { Map } from "ol";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke, Text } from "ol/style";

interface MaresProps {
  map: Map;
  show: boolean;
}

async function fetchMares(map: Map) {
  try {
    const response = await fetch(
      "https://moonmapexam-6c2201712d34.herokuapp.com/moon-mares",
    );
    if (!response.ok) throw new Error("Error fetching data from the api");
    const data = await response.json();

    if (!data || !Array.isArray(data)) {
      console.error("Data format is incorrect or undefined:", data);
      return; // Exit if data is not in expected format
    }

    const features: Feature<Polygon>[] = data
      .map((feature) => {
        if (!feature.coordinates || !feature.name) {
          console.error("Data missing required properties:", feature);
          return null; // Skip this entry if it lacks necessary data
        }

        // Assuming there is one outer ring and optionally more (holes), we process each
        const transformedCoordinates = feature.coordinates.map((ring: any[]) =>
          ring.map((coord) => fromLonLat(coord)),
        );

        const geometry = new Polygon(transformedCoordinates);
        return new Feature({
          geometry: geometry,
          name: feature.name,
        });
      })
      .filter((f): f is Feature<Polygon> => f != null);

    const mareSource = new VectorSource({
      features: features,
    });

    const mareLayer = new VectorLayer({
      source: mareSource,
      properties: { id: "mares" },
      maxZoom: 6,
      zIndex: 10,
      style: (feature) =>
        new Style({
          stroke: new Stroke({
            color: "rgba(30, 80, 155, 0.5)",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(30, 80, 155, 0.1)",
          }),
          text: new Text({
            font: "14px Calibri,sans-serif",
            fill: new Fill({
              color: "#ffffff",
            }),
            stroke: new Stroke({
              color: "#000000",
              width: 3,
            }),
            text: feature.get("name"),
          }),
        }),
    });

    map.addLayer(mareLayer); // Add the layer to the map
  } catch (error) {
    console.error("Failed to fetch moon mares:", error);
  }
}

const MoonMares: React.FC<MaresProps> = ({ map, show }) => {
  useEffect(() => {
    if (show) {
      fetchMares(map);
    } else {
      const layersToRemove = map
        .getLayers()
        .getArray()
        .filter(
          (layer) =>
            layer instanceof VectorLayer && layer.get("id") === "mares",
        );
      layersToRemove.forEach((layer) => map.removeLayer(layer));
    }

    return () => {
      // Cleanup function to remove layers when the component is unmounted or hidden
      const layersToRemove = map
        .getLayers()
        .getArray()
        .filter(
          (layer) =>
            layer instanceof VectorLayer && layer.get("id") === "mares",
        );
      layersToRemove.forEach((layer) => map.removeLayer(layer));
    };
  }, [map, show]);

  return null; // This component does not render anything itself
};

export default MoonMares;
