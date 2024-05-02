import { Map } from "ol";
import Select from "ol/interaction/Select";
import { Style, Fill, Stroke } from "ol/style";
import VectorLayer from "ol/layer/Vector";

export function setupCraterClick(map: Map) {
  const displayDivId = "LandingInfo"; // Ensure this div is present in your HTML/React component

  const selectInteraction = new Select({
    layers: (layer) =>
      layer instanceof VectorLayer && layer.get("id") === "Craters",
    style: new Style({
      fill: new Fill({
        color: "rgba(255, 204, 51, 0.2)",
      }),
      stroke: new Stroke({
        color: "#ffcc33",
        width: 2,
      }),
    }),
  });
  map.addInteraction(selectInteraction);

  selectInteraction.on("select", async (event) => {
    const displayDiv = document.getElementById(displayDivId);
    if (!displayDiv) return;

    if (event.selected.length === 0) {
      displayDiv.innerHTML = "";
    } else {
      displayDiv.innerHTML = "Loading...";
      const selectedFeature = event.selected[0];
      const craterName = selectedFeature.get("name");

      try {
        const response = await fetch(
          `https://eksamen2024-4ca230bb945c.herokuapp.com/moon-craters`,
        );
        const craters = await response.json();
        const crater = craters.find(
          (c: { name: any }) => c.name === craterName,
        );

        if (crater) {
          if (!crater.wiki) {
            displayDiv.innerHTML = `
                        <h3>${crater.name}</h3>
                        <p>Age: ${crater.age || "N/A"}</p>
                    `;
          } else {
            displayDiv.innerHTML = `
                            <h3>${crater.name}</h3>
                            <p>Age: ${crater.age || "N/A"}</p>
                            <p><a href="${crater.wiki}" target="_blank">More Info</a></p>
                        `;
          }
        } else {
          displayDiv.innerHTML = "No data available";
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        displayDiv.innerHTML = "Error fetching data";
      }
    }
  });

  return selectInteraction;
}
