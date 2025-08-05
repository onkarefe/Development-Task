// 2D point around a given center
export function rotatePoint(
  point: [number, number],
  center: [number, number],
  angleDeg: number,
): [number, number] {
  const angleRad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const dx = point[0] - center[0];
  const dy = point[1] - center[1];

  const x = cos * dx - sin * dy + center[0];
  const y = sin * dx + cos * dy + center[1];

  return [x, y];
}

// Rotate
export function rotatePolygon(
  points: [number, number][],
  center: [number, number],
  angleDeg: number,
): [number, number][] {
  return points.map((pt) => rotatePoint(pt, center, angleDeg));
}

// Center
export function getPolygonCenter(points: [number, number][]): [number, number] {
  const n = points.length;
  const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  return [sum[0] / n, sum[1] / n];
}

// Calculate
export function getBoundingBoxWithOffset(
  points: [number, number][],
  offset: number,
): { minX: number; maxX: number; minY: number; maxY: number } {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);

  const minX = Math.min(...xs) - offset;
  const maxX = Math.max(...xs) + offset;
  const minY = Math.min(...ys) - offset;
  const maxY = Math.max(...ys) + offset;

  return { minX, maxX, minY, maxY };
}

// Lines
export function generateSweepLines(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  step: number,
): [number, number][][] {
  const lines: [number, number][][] = [];

  for (let x = minX; x <= maxX; x += step) {
    lines.push([
      [x, minY - step * 2],
      [x, maxY + step * 2],
    ]);
  }

  return lines;
}

// Conversion
export function meterToDegree(meter: number, latitude: number): number {
  const degPerMeterLat = 1 / 110574;
  const degPerMeterLon = 1 / (111320 * Math.cos((latitude * Math.PI) / 180));
  return meter * ((degPerMeterLat + degPerMeterLon) / 2);
}

export function getLineIntersection(
  p1: [number, number],
  p2: [number, number],
  q1: [number, number],
  q2: [number, number],
): [number, number] | null {
  const A1 = p2[1] - p1[1];
  const B1 = p1[0] - p2[0];
  const C1 = A1 * p1[0] + B1 * p1[1];

  const A2 = q2[1] - q1[1];
  const B2 = q1[0] - q2[0];
  const C2 = A2 * q1[0] + B2 * q1[1];

  const denominator = A1 * B2 - A2 * B1;

  if (denominator === 0) return null; // paralel

  const intersectX = (B2 * C1 - B1 * C2) / denominator;
  const intersectY = (A1 * C2 - A2 * C1) / denominator;

  // Check if the intersection point is on both line segments
  if (
    intersectX < Math.min(p1[0], p2[0]) - 1e-10 ||
    intersectX > Math.max(p1[0], p2[0]) + 1e-10 ||
    intersectX < Math.min(q1[0], q2[0]) - 1e-10 ||
    intersectX > Math.max(q1[0], q2[0]) + 1e-10
  )
    return null;

  if (
    intersectY < Math.min(p1[1], p2[1]) - 1e-10 ||
    intersectY > Math.max(p1[1], p2[1]) + 1e-10 ||
    intersectY < Math.min(q1[1], q2[1]) - 1e-10 ||
    intersectY > Math.max(q1[1], q2[1]) + 1e-10
  )
    return null;

  return [intersectX, intersectY];
}

export function pointInPolygon(
  point: [number, number],
  polygon: [number, number][],
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];
    const intersect =
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function clipLineToPolygon(
  line: [[number, number], [number, number]],
  polygon: [number, number][],
): [[number, number], [number, number]][] {
  const intersections: [number, number][] = [];
  const { 0: start, 1: end } = line;

  // Crossroads
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const inter = getLineIntersection(start, end, p1, p2);
    if (inter) intersections.push(inter);
  }

  intersections.push(start, end);

  // Order
  intersections.sort((a, b) => {
    if (Math.abs(start[0] - end[0]) > Math.abs(start[1] - end[1])) {
      return a[0] - b[0];
    } else {
      return a[1] - b[1];
    }
  });

  const clippedSegments: [[number, number], [number, number]][] = [];

  // Clarify
  for (let i = 0; i < intersections.length - 1; i++) {
    const midPoint: [number, number] = [
      (intersections[i][0] + intersections[i + 1][0]) / 2,
      (intersections[i][1] + intersections[i + 1][1]) / 2,
    ];
    if (pointInPolygon(midPoint, polygon)) {
      clippedSegments.push([intersections[i], intersections[i + 1]]);
    }
  }

  return clippedSegments;
}
