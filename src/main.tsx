import { createRoot } from "react-dom/client";
import Map from "@/components/Map";
import "@/index.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { AppProvider } from "@/store/context";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <div id="map-wrapper">
      <Map />
    </div>
  </AppProvider>
);
