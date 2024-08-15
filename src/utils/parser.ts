import proj4 from "proj4";
import { TileData } from "@/types";
import type { FeatureCollection, Point, Polygon, Position } from "geojson";
import { Feature, GeoJsonProperties } from "geojson";

const projUTM = "EPSG:32701";
const projWGS84 = "EPSG:4326";
console.log(proj4);
console.log(proj4.defs);
proj4.defs(projUTM, "+proj=utm +zone=1 +south +datum=WGS84 +units=m +no_defs");

export const parsePointCoordinates = (coords: number[]): Position => {
  if (coords.length !== 2) {
    throw new Error(
      "Point coordinates must be an array with exactly 2 elements."
    );
  }

  const [x, y] = coords;
  if (!isFinite(x) || !isFinite(y)) {
    throw new Error("Coordinates must be finite numbers.");
  }

  try {
    const [lon, lat] = proj4(projUTM, projWGS84, [x, y]);
    if (isFinite(lon) && isFinite(lat)) {
      return [lon, lat];
    } else {
      throw new Error(`Converted coordinates are not finite: (${lon}, ${lat})`);
    }
  } catch (e) {
    throw new Error(`Error converting coordinates (${x}, ${y}): ${e}`);
  }
};

const flattenCoordinates = (coords: Position[][] | Position[]): Position[] => {
  if (Array.isArray(coords[0])) {
    return (coords as Position[][]).reduce<Position[]>(
      (flat, toFlatten) => flat.concat(flattenCoordinates(toFlatten)),
      []
    );
  } else {
    return coords as Position[];
  }
};

const isPosition = (coords: unknown): coords is [number, number] => {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number"
  );
};

export const parsePolygonCoordinates = (
  coords: Position[][]
): Polygon["coordinates"] => {
  const flatCoords = flattenCoordinates(coords);

  if (flatCoords.length % 2 !== 0) {
    throw new Error("Coordinates array length must be even.");
  }

  const convertedCoords: Position[] = [];
  for (let i = 0; i < flatCoords.length; i += 2) {
    const pair = flatCoords.slice(i, i + 2);

    if (pair.length === 2 && isPosition(pair)) {
      const [x, y] = pair;

      if (isFinite(x) && isFinite(y)) {
        try {
          const [lon, lat] = proj4(projUTM, projWGS84, [x, y]);
          if (isFinite(lon) && isFinite(lat)) {
            convertedCoords.push([lon, lat]);
          } else {
            console.warn(
              `Converted coordinates are not finite: (${lon}, ${lat})`
            );
          }
        } catch (e) {
          console.error(`Error converting coordinates (${x}, ${y}):`, e);
        }
      } else {
        console.warn(`Skipping invalid coordinate pair: (${x}, ${y})`);
      }
    } else {
      console.warn(`Skipping invalid coordinate pair at index ${i}`);
    }
  }

  return [convertedCoords]; // GeoJSON expects the coordinates to be wrapped in an array
};

const createFeature = (
  geometry: Polygon | Point,
  additionalProperties: GeoJsonProperties = {}
): Feature<Polygon | Point, GeoJsonProperties> => {
  let convertedGeometry: Polygon | Point;

  if (geometry.type === "Polygon") {
    const cords = parsePolygonCoordinates(geometry.coordinates as Position[][]);
    convertedGeometry = { type: "Polygon", coordinates: cords };
  } else if (geometry.type === "Point") {
    const cords = parsePointCoordinates(geometry.coordinates as number[]);
    convertedGeometry = { type: "Point", coordinates: cords };
  } else {
    throw new Error(`Unsupported geometry type: ${geometry}`);
  }

  return {
    type: "Feature",
    geometry: convertedGeometry,
    properties: additionalProperties,
  };
};

export function convertToFeatureCollection(data: TileData): FeatureCollection {
  const features: Feature<Polygon | Point, GeoJsonProperties>[] = [];

  if (data.tileGeometry) {
    features.push(
      createFeature(data.tileGeometry, {
        path: data.path,
        timestamp: data.timestamp,
        utmZone: data.utmZone,
        latitudeBand: data.latitudeBand,
        gridSquare: data.gridSquare,
        datastrip: data.datastrip,
        dataCoveragePercentage: data.dataCoveragePercentage,
        cloudyPixelPercentage: data.cloudyPixelPercentage,
        productName: data.productName,
        productPath: data.productPath,
      })
    );
  }

  if (data.tileDataGeometry) {
    features.push(createFeature(data.tileDataGeometry));
  }

  if (data.tileOrigin) {
    features.push(createFeature(data.tileOrigin));
  }

  return {
    type: "FeatureCollection",
    features,
  };
}
