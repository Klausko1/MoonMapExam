// React and Open layer
import React, { useEffect, useState } from "react";
import { Map } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature, { FeatureLike } from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import { Fill, Stroke, Style } from "ol/style";
import { fromLonLat } from "ol/proj";

interface NearFarSideData {
  id: number;
  name: string;
  description: string | null;
  wiki: string | null;
  coordinates: number[][][];
}

interface NearFarSidePlotterProps {
  map: Map;
  show: boolean;
}

const getStyle = (feature: FeatureLike) => {
  const name = feature.get("name");

  if (name === "Nearside") {
    return new Style({
      stroke: new Stroke({
        color: "rgba(255, 255, 255, 0.075)",
        width: 3,
      }),
      fill: new Fill({
        color: "rgba(255, 255, 255, 0.15)",
      }),
    });
  } else if (name === "Farside") {
    return new Style({
      stroke: new Stroke({
        color: "rgba(0, 0, 0, 0.075)",
        width: 3,
      }),
      fill: new Fill({
        color: "rgba(0, 0, 0, 0.15)",
      }),
    });
  }
};

const NearFarSidePlotter: React.FC<NearFarSidePlotterProps> = ({
  map,
  show,
}) => {
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    const fetchNearFarSide = async () => {
      try {
        const response = await fetch(
          "https://moonmapexam-6c2201712d34.herokuapp.com/moon-sides",
        );
        const data: NearFarSideData[] = await response.json();
        console.log("Data fetched:", data);

        const loadedFeatures = data.map((side) => {
          const transformedCoordinates = side.coordinates[0].map((coord) =>
            fromLonLat(coord),
          );
          const polygon = new Polygon([transformedCoordinates]);
          const feature = new Feature({
            geometry: polygon,
            name: side.name,
          });
          return feature;
        });

        setFeatures(loadedFeatures);
      } catch (error) {
        console.error("Failed to fetch or process moon sides data:", error);
      }
    };

    fetchNearFarSide();
  }, []);

  useEffect(() => {
    if (show && features.length > 0) {
      const nearFarSideSource = new VectorSource({
        features: features,
      });

      const nearFarSideLayer = new VectorLayer({
        source: nearFarSideSource,
        style: (feature) => getStyle(feature),
      });

      map.addLayer(nearFarSideLayer);

      return () => {
        map.removeLayer(nearFarSideLayer);
        // Explicitly return void to satisfy TypeScript's type checking
        return;
      };
    }
  }, [show, features, map]);

  return null;
};

export default NearFarSidePlotter;
