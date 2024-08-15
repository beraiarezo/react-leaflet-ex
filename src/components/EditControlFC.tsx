import { useEffect, memo, useRef } from "react";
import * as L from "leaflet";
import { FeatureGroup } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import { EditControl } from "react-leaflet-draw";

interface EditControlProps {
  geojson: FeatureCollection;
  setGeojson: (geojson: FeatureCollection) => void;
  handleSave: () => void;
}

function EditControlFC({ geojson, setGeojson, handleSave }: EditControlProps) {
  const ref = useRef<L.FeatureGroup>(null);
  console.log("EditControlFC");
  useEffect(() => {
    console.log(geojson, "json");
    if (ref.current?.getLayers().length === 0 && geojson) {
      L.geoJSON(geojson).eachLayer((layer) => {
        if (
          layer instanceof L.Polyline ||
          layer instanceof L.Polygon ||
          layer instanceof L.Marker
        ) {
          if (layer?.feature?.properties.radius && ref.current) {
            new L.Circle(layer.feature.geometry.coordinates.slice().reverse(), {
              radius: layer.feature?.properties.radius,
            }).addTo(ref.current);
          } else {
            ref.current?.addLayer(layer);
          }
        }
      });
    }
  }, [geojson]);

  const handleChange = () => {
    const geo = ref.current?.toGeoJSON();
    if (geo?.type === "FeatureCollection") {
      console.log(geo, "geo");
      setGeojson(geo);
    }
  };

  return (
    <FeatureGroup ref={ref}>
      <EditControl
        position="topright"
        onEdited={handleChange}
        onCreated={handleChange}
        onDeleted={handleChange}
        draw={{
          rectangle: {
            showArea: false,
          },
          polyline: false,
          polygon: true,
          circle: false,
          marker: false,
          circlemarker: false,
        }}
      />
      <div className="save" onClick={handleSave}>
        save
      </div>
    </FeatureGroup>
  );
}

export default memo(EditControlFC);
