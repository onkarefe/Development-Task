import "./style.css";
import { GLOBUS } from "./globus.ts";
import { Polygon } from "./polygons/polygon.ts";
import { POLYGONS_LAYER } from "./polygons/layer.ts";
import { LINE_LAYER } from "./lines/layer.ts";
import { createParallelHatching } from "./lines/parallelHatchingAlgorithm.ts";
import { Line } from "./lines/line.ts";

// Dynamic Data
let currentPolygonCoordinates: [number, number, number?][][] | null = null;

const stepInput = document.getElementById("step") as HTMLInputElement;
const bearingInput = document.getElementById("bearing") as HTMLInputElement;
const offsetInput = document.getElementById("offset") as HTMLInputElement;

const stepValue = document.getElementById("step-value")!;
const bearingValue = document.getElementById("bearing-value")!;
const offsetValue = document.getElementById("offset-value")!;

function updateLabels() {
  stepValue.textContent = stepInput.value;
  bearingValue.textContent = bearingInput.value;
  offsetValue.textContent = offsetInput.value;
}

function updateLines() {
  if (!currentPolygonCoordinates) return;

  updateLabels();

  const step = Number(stepInput.value);
  const bearing = Number(bearingInput.value);
  const offset = Number(offsetInput.value);

  LINE_LAYER.clear();

  const lines = createParallelHatching(
    currentPolygonCoordinates,
    step,
    bearing,
    offset,
  );
  for (const line of lines) {
    LINE_LAYER.add(
      new Line([
        [line[0].lon, line[0].lat],
        [line[1].lon, line[1].lat],
      ]),
    );
  }
}

GLOBUS.planet.addLayer(POLYGONS_LAYER);
GLOBUS.planet.addLayer(LINE_LAYER);

POLYGONS_LAYER.events.on("ldblclick", (e: any) => {
  try {
    if (e.pickingObject instanceof Polygon) {
      currentPolygonCoordinates = e.pickingObject.coordinates;
      updateLines();
    }
  } catch (e) {
    console.error(e);
  }
});

const entities = POLYGONS_LAYER.getEntities();
if (entities && entities.length > 0) {
  const lastPoly = entities.pop(),
    extent = lastPoly?.getExtent();

  extent && GLOBUS.planet.camera.flyExtent(extent);
}

//Sliders
stepInput.addEventListener("input", updateLines);
bearingInput.addEventListener("input", updateLines);
offsetInput.addEventListener("input", updateLines);
