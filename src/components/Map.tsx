import { MapContainer, TileLayer } from "react-leaflet";
import EditControlFC from "./EditControlFC";
import { useRasterMap } from "@/hooks/useRasterMap";

export default function Map() {
  const { mapRef, isProcessing, geojson, setGeojson, handleSave } =
    useRasterMap();

  return (
    <>
      {isProcessing && (
        <div className="processing">
          Processing...
          <div className="loader"></div>
        </div>
      )}
      <MapContainer
        center={[37.8189, -122.4786]}
        zoom={2}
        ref={mapRef as React.RefObject<L.Map>}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
        <EditControlFC
          geojson={geojson}
          setGeojson={setGeojson}
          handleSave={handleSave}
        />
      </MapContainer>
    </>
  );
}
