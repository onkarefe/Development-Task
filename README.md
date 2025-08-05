## 🧭 How the Parallel Hatching Algorithm Works

When a user double-clicks on a polygon on the map, the following steps are executed to generate evenly spaced, directional hatching lines within the selected area:

1. **Polygon Coordinates are Retrieved**  
   The outer boundary coordinates of the selected polygon are retrieved. (Any interior holes are ignored at this stage.)

2. **Polygon Center is Calculated**  
   The geometric center (centroid) of the polygon is calculated. This point serves as the reference for all subsequent rotations and transformations.

3. **Step and Offset Values are Converted to Geographic Units**  
   The `step` (distance between lines) and `offset` (initial margin) values are defined in meters. Since the map operates on latitude and longitude, these values are converted to degrees based on the polygon’s latitude.

4. **Polygon is Rotated Based on User-Specified Angle**  
   To ensure clean and uniform hatching, the polygon is rotated by the angle provided by the user. This makes it easier to generate vertical or horizontal lines aligned to that direction.

5. **Bounding Box is Calculated Around the Rotated Polygon**  
   A tight rectangular bounding box is generated around the rotated polygon. This defines the area where sweeping lines will be generated.

6. **Parallel Hatching Lines are Generated**  
   From one side of the bounding box to the other, lines are generated at equal intervals (`step`) to cover the entire area with parallel strokes.

7. **Lines are Clipped to the Polygon Area**  
   Any portion of a line that falls outside the polygon is removed. Only the segments inside the polygon remain.

8. **Lines are Rotated Back to the Original Orientation**  
   Since the polygon and lines were previously rotated for alignment, the resulting clipped lines are now rotated back to match the original map coordinates.

9. **Lines are Rendered on the Map**  
   All finalized line segments are rendered on the map inside the polygon, giving the appearance of a neatly hatched area.

10. **Done – Seamless Interaction**  
   The entire process runs automatically in the background. From the user's point of view, a simple double-click results in a visually accurate and directionally consistent hatch pattern.

---
