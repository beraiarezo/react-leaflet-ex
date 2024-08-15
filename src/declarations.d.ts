declare module "georaster-layer-for-leaflet" {
  import { LatLngBoundsExpression, Layer } from "leaflet";

  interface GeoRasterLayerOptions {
    georaster: object;
    opacity?: number;
  }

  export default class GeoRasterLayer extends Layer {
    getBounds(): LatLngBoundsExpression {}

    constructor(options: GeoRasterLayerOptions);
  }
}

declare module "georaster" {
  const GeoRaster: (arrayBuffer: ArrayBuffer) => Promise<object>;
  export default GeoRaster;
}
