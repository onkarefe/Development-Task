import { LonLat } from "@openglobus/og";
import {
  rotatePolygon,
  getPolygonCenter,
  getBoundingBoxWithOffset,
  generateSweepLines,
  rotatePoint,
  meterToDegree,
  clipLineToPolygon,
} from "./addedFunctions";

export function createParallelHatching(
  coordinates: [number, number, number?][][],
  step = 1060,
  bearing = 0,
  offset = 50,
): LonLat[][] {
  const outerRing = coordinates[0];
  const center = getPolygonCenter(outerRing as [number, number][]);
  const sampleLat = center[1];
  const offsetDeg = meterToDegree(offset, sampleLat);
  const stepDeg = meterToDegree(step, sampleLat);
  const rotatedPolygon = rotatePolygon(
    outerRing as [number, number][],
    center,
    -bearing,
  );
  const { minX, maxX, minY, maxY } = getBoundingBoxWithOffset(
    rotatedPolygon,
    offsetDeg,
  );
  const sweepLines = generateSweepLines(minX, maxX, minY, maxY, stepDeg);
  const clippedLines: LonLat[][] = [];

  for (const [p1, p2] of sweepLines) {
    const clippedSegments = clipLineToPolygon([p1, p2], rotatedPolygon);

    for (const segment of clippedSegments) {
      const rotatedP1 = rotatePoint(segment[0], center, bearing);
      const rotatedP2 = rotatePoint(segment[1], center, bearing);

      const ll1 = new LonLat(rotatedP1[0], rotatedP1[1]);
      const ll2 = new LonLat(rotatedP2[0], rotatedP2[1]);

      clippedLines.push([ll1, ll2]);
    }
  }

  console.log("Generated clipped lines", clippedLines.length, clippedLines);
  return clippedLines;
}
