import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const boundary = [
  [23.2211481, 77.403829],
  [23.2177169, 77.3973488],
  [23.215666, 77.3953747],
  [23.2139306, 77.3943018],
  [23.2122346, 77.3961043],
  [23.2091187, 77.3973917],
  [23.2063577, 77.4012541],
  [23.2045433, 77.4070906],
  [23.2065944, 77.4133563],
  [23.2112486, 77.4173045],
  [23.2157449, 77.4170899],
  [23.2207142, 77.4103951],
  [23.2211481, 77.403829],
];

export default function ManitMap() {
  return (
    <MapContainer
      center={[23.213, 77.406]}
      zoom={15}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polygon
        positions={boundary}
        pathOptions={{
          color: "green",
          fillColor: "green",
          fillOpacity: 0.3,
          weight: 3,
        }}
      />
    </MapContainer>
  );
}