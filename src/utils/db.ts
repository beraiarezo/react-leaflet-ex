import type { FeatureCollection } from "geojson";

export function delayReturn(
  data: FeatureCollection
): Promise<FeatureCollection> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 3000);
  });
}
