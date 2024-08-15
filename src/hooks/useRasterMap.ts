import { useEffect, useState, useRef, useCallback } from "react";
import GeoRaster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { convertToFeatureCollection } from "@/utils/parser";
import { useAppContext } from "@/store/context";
import { TileData } from "@/types";
import * as L from "leaflet";
import { delayReturn } from "@/utils/db";

export function useRasterMap() {
  const { state, setCollection } = useAppContext();
  const mapRef = useRef<L.Map>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const fetchResource = async (url: string) => {
    try {
      const u = new URL(url);
      const response = await fetch(u);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      return await response.arrayBuffer();
    } catch (error) {
      console.error(`Error fetching resource from ${url}:`, error);
      return null;
    }
  };

  const createGeoRasterLayer = async (arrayBuffer: ArrayBuffer) => {
    try {
      const geoRaster = await GeoRaster(arrayBuffer);
      return new GeoRasterLayer({
        georaster: geoRaster,
        opacity: 1,
      });
    } catch (error) {
      console.error("Error creating GeoRasterLayer:", error);
      return null;
    }
  };

  const fetchTileData = async (): Promise<TileData | null> => {
    try {
      const response = await fetch(
        "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/1/C/CV/2018/12/S2B_1CCV_20181213_0_L2A/tileinfo_metadata.json"
      );
      if (!response.ok) throw new Error("Failed to fetch tile data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching tile data:", error);
      return null;
    }
  };

  const applyRaster = async () => {
    setIsProcessing(true);

    const originalUrl =
      "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2acogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif";

    const arrayBuffer = await fetchResource(originalUrl);

    if (arrayBuffer) {
      const geoRasterLayer = await createGeoRasterLayer(arrayBuffer);

      if (geoRasterLayer && mapRef.current) {
        mapRef.current.addLayer(geoRasterLayer);
        mapRef.current.fitBounds(geoRasterLayer.getBounds());
      }
    }

    const tileData = await fetchTileData();

    if (tileData) {
      const collection = convertToFeatureCollection(tileData);
      setCollection(collection);
    }

    setIsProcessing(false);
  };

  useEffect(() => {
    applyRaster();
  }, []);

  const actualPost = () => {
    fetch(
      "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/1/C/CV/2018/12/S2B_1CCV_20181213_0_L2A",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state.collection),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleSave = useCallback(async () => {
    setIsProcessing(true);
    actualPost();
    delayReturn(state.collection).then((response) => {
      setCollection(response);
      setIsProcessing(false);
    });
  }, [state.collection]);

  const setState = useCallback(async () => {
    return setCollection;
  }, []);

  return {
    handleSave,
    mapRef,
    isProcessing,
    geojson: state.collection,
    setGeojson: setState,
  };
}
