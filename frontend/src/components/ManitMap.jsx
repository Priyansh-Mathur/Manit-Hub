import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as toGeoJSON from "@tmcw/togeojson";

export default function ManitMap() {
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    fetch("/Untitled map.kml")
      .then((res) => res.text())
      .then((kmlText) => {
        const parser = new DOMParser();
        const kml = parser.parseFromString(kmlText, "text/xml");

        const geojson = toGeoJSON.kml(kml);
        const extracted = [];

        geojson.features.forEach((feature) => {
          if (feature.geometry && feature.geometry.type === "Polygon") {
            extracted.push(
              feature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])
            );
          }
        });

        setPolygons(extracted);
      });
  }, []);

  return (
    <MapContainer
      center={[23.213, 77.406]}
      zoom={15}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {polygons.map((polygon, index) => (
        <Polygon
          key={index}
          positions={polygon}
          pathOptions={{
            color: "green",
            fillColor: "green",
            fillOpacity: 0.3,
            weight: 3,
          }}
        />
      ))}
    </MapContainer>
  );
}