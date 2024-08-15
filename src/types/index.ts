import type { Point, Polygon } from "geojson";

export type CRS = {
  type: "name";
  properties: {
    name: string;
  };
};

export type GeometryType = {
  type: "Polygon" | "Point";
  crs: CRS;
  coordinates: number[] | number[][];
};

export type Datastrip = {
  id: string;
  path: string;
};

export type TileData = {
  path: string;
  timestamp: string;
  utmZone: number;
  latitudeBand: string;
  gridSquare: string;
  datastrip: Datastrip;
  tileGeometry: Polygon;
  tileDataGeometry: Polygon;
  tileOrigin: Point;
  dataCoveragePercentage: number;
  cloudyPixelPercentage: number;
  productName: string;
  productPath: string;
};
